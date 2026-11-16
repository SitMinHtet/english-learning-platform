import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import {
  STORIES,
  getStory,
  storiesForLevel,
  storyCountsByLevel,
} from '../data/stories'
import { getDailyAiStories } from '../lib/dailyPlan'
import { isLevelNear, LEVELS, LEVEL_LABELS, levelsNear } from '../data/cefr'
import { speak } from '../lib/speech'
import { isOptionCorrect, shuffleOptions } from '../lib/testEngine'
import { localDayKey } from '../lib/dateKey'
import type { CEFRLevel } from '../types'
import { TapWordText } from '../components/TapWordText'

export function LibraryPage() {
  const { profile, markStoryRead, recordAttempt } = useProfile()
  const [params, setParams] = useSearchParams()
  const storyId = params.get('id')
  const dailyMode = params.get('daily') === '1'
  const levelParam = params.get('level') as CEFRLevel | null

  const [quizIdx, setQuizIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correctN, setCorrectN] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  const activeLevel: CEFRLevel =
    levelParam && LEVELS.includes(levelParam)
      ? levelParam
      : profile?.currentLevel ?? 'A1'

  const aiStories = useMemo(
    () => (profile ? getDailyAiStories(profile) : []),
    [profile],
  )

  const story = storyId
    ? aiStories.find((s) => s.id === storyId) ??
      (profile?.dailyAiPack?.story?.id === storyId
        ? profile.dailyAiPack.story
        : getStory(storyId))
    : undefined

  const daily = useMemo(() => {
    if (!profile) return null
    if (aiStories.length) {
      return (
        aiStories.find((s) => s.id === profile.dailyStoryId) ?? aiStories[0] ?? null
      )
    }
    if (profile.dailyStoryId) return getStory(profile.dailyStoryId) ?? null
    return null
  }, [profile, aiStories])

  const levelList = useMemo(() => storiesForLevel(activeLevel), [activeLevel])
  const counts = useMemo(() => storyCountsByLevel(), [])

  if (!profile) return null

  const openStory = (id: string, opts?: { daily?: boolean; level?: CEFRLevel }) => {
    const next = new URLSearchParams()
    next.set('id', id)
    if (opts?.daily) next.set('daily', '1')
    next.set('level', opts?.level ?? activeLevel)
    setParams(next)
    setQuizIdx(0)
    setSelected(null)
    setChecked(false)
    setCorrectN(0)
    setQuizDone(false)
  }

  const backToShelf = () => {
    const next = new URLSearchParams()
    next.set('level', activeLevel)
    setParams(next)
  }

  // ——— Reader view ———
  if (story) {
    const rawQ = story.quiz[quizIdx]
    const q = rawQ
      ? {
          ...rawQ,
          options: shuffleOptions(
            rawQ.options,
            `${story.id}-q${quizIdx}-${localDayKey()}`,
          ),
        }
      : undefined
    const paragraphs = story.body.split(/\n\n+/).filter(Boolean)

    const check = (opt: string) => {
      if (checked || !q) return
      setSelected(opt)
      setChecked(true)
      const ok = isOptionCorrect(q.answer, opt)
      if (ok) setCorrectN((n) => n + 1)
      recordAttempt({
        questionId: `${story.id}-q${quizIdx}`,
        skill: 'reading',
        correct: ok,
        userAnswer: opt,
        correctAnswer: q.answer,
        explanationMy: q.explanationMy,
        minutes: 2,
      })
    }

    const finishReading = () => {
      setQuizDone(true)
      markStoryRead(story.id, story.minutes)
    }

    const nextQuiz = () => {
      if (quizIdx + 1 >= story.quiz.length) {
        finishReading()
        return
      }
      setQuizIdx((i) => i + 1)
      setSelected(null)
      setChecked(false)
    }

    return (
      <>
        <div className="page-head">
          <div>
            <div className="flex wrap">
              <span className="chip">{story.level}</span>
              <span className="chip">{story.genreMy}</span>
              {dailyMode && <span className="chip warn">ယနေ့ ဖတ်ရန်</span>}
            </div>
            <h1 style={{ marginTop: 10 }}>{story.title}</h1>
            <p>
              {story.titleMy} · ~{story.words} လုံး · {LEVEL_LABELS[story.level].my}
            </p>
          </div>
          <button className="btn ghost" type="button" onClick={backToShelf}>
            Level စာအုပ်စင်
          </button>
        </div>

        <article className="panel book-page">
          <div className="book-meta muted">
            {story.genre} · {story.minutes} မိနစ်ဖတ်ရန် · Level {story.level}
          </div>
          {paragraphs.map((p, i) => (
            <TapWordText key={i} text={p} as="p" className="book-para" />
          ))}
          <div className="flex wrap" style={{ marginTop: 16 }}>
            <button
              className="btn secondary"
              type="button"
              onClick={() => speak(story.body.slice(0, 400), 0.9)}
            >
              🔊 အစပိုင်း နားထောင်
            </button>
          </div>
        </article>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2>Glossary · ဝေါဟာရ</h2>
          <ul className="list-plain">
            {story.glossary.map((g) => (
              <li key={g.word}>
                <strong>{g.word}</strong> — {g.meaningMy}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <h2>ဖတ်ပြီး မေးခွန်း</h2>
          {quizDone ? (
            <div className="feedback good">
              <p>
                ပြီးပါပြီ — {correctN}/{story.quiz.length} မှန်။ Level {story.level} စာအုပ်စင်တွင်
                ဖတ်ပြီးဟု မှတ်ထားပါပြီ။
              </p>
              <div className="flex wrap" style={{ marginTop: 12 }}>
                <button className="btn" type="button" onClick={backToShelf}>
                  ဒီ level ထဲက နောက်တစ်ပုဒ်
                </button>
                <Link className="btn ghost" to="/">
                  Dashboard
                </Link>
              </div>
            </div>
          ) : q ? (
            <>
              <div className="chip" style={{ marginBottom: 10 }}>
                {quizIdx + 1}/{story.quiz.length}
              </div>
              <p style={{ fontWeight: 650 }}>{q.prompt}</p>
              {q.promptMy && <p className="muted">{q.promptMy}</p>}
              <div style={{ marginTop: 12 }}>
                {q.options.map((opt) => {
                  let cls = 'quiz-option'
                  const isRight = isOptionCorrect(q.answer, opt)
                  if (checked && selected === opt) {
                    cls += isRight ? ' correct' : ' wrong'
                  } else if (checked && isRight) {
                    cls += ' correct'
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cls}
                      disabled={checked}
                      onClick={() => check(opt)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {checked && (
                <div
                  className={`feedback ${
                    selected && isOptionCorrect(q.answer, selected) ? 'good' : 'bad'
                  }`}
                >
                  <p>{q.explanationMy}</p>
                  <button className="btn" style={{ marginTop: 10 }} onClick={nextQuiz}>
                    {quizIdx + 1 >= story.quiz.length ? 'ပြီးဆုံး' : 'ရှေ့သို့'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="feedback">
              <p>ဤဇာတ်လမ်းတွင် မေးခွန်း မပါပါ — ဖတ်ပြီးဟု မှတ်နိုင်သည်။</p>
              <button className="btn" style={{ marginTop: 10 }} type="button" onClick={finishReading}>
                ဖတ်ပြီးဟု မှတ်မည်
              </button>
            </div>
          )}
        </section>
      </>
    )
  }

  // ——— Shelf view (level tabs + daily) ———
  const unreadHere = levelList.filter((s) => !profile.readStoryIds.includes(s.id))

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">📖 Daily Reading · Level {profile.currentLevel}</div>
          <h1 style={{ marginTop: 10 }}>စာအုပ် / Story ဖတ်ရန်</h1>
          <p>
            ယနေ့ story က သင့် level ({profile.currentLevel}) · အကြံပြု band:{' '}
            {levelsNear(profile.currentLevel, 1).join(' · ')}
          </p>
        </div>
        <Link className="btn ghost" to="/">
          Dashboard
        </Link>
      </div>

      {aiStories.length > 0 ? (
        <section className="panel daily-story">
          <div className="flex wrap">
            <span className="chip warn">ယနေ့ AI Stories · {aiStories.length} ပုဒ်</span>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            {aiStories.map((s) => (
              <button
                key={s.id}
                type="button"
                className="panel story-card"
                onClick={() =>
                  openStory(s.id, { daily: true, level: profile.currentLevel })
                }
              >
                <div className="flex wrap">
                  <span className="chip">{s.genreMy}</span>
                  {profile.readStoryIds.includes(s.id) && (
                    <span className="chip">ဖတ်ပြီး</span>
                  )}
                </div>
                <h2 style={{ marginTop: 10, fontSize: '1.1rem' }}>{s.title}</h2>
                <p className="muted">{s.titleMy}</p>
                <p style={{ marginTop: 8 }}>{s.summaryMy}</p>
                <p className="muted" style={{ marginTop: 8 }}>
                  ~{s.words} လုံး · {s.minutes} မိနစ်
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        daily && (
          <section className="panel daily-story">
            <div className="flex wrap">
              <span className="chip warn">ယနေ့ ဖတ်ရန် · {daily.level}</span>
              <span className="chip">{daily.genreMy}</span>
            </div>
            <h2 style={{ marginTop: 12 }}>{daily.title}</h2>
            <p className="muted">{daily.titleMy}</p>
            <p style={{ marginTop: 8 }}>{daily.summaryMy}</p>
            <button
              className="btn"
              style={{ marginTop: 14 }}
              type="button"
              onClick={() =>
                openStory(daily.id, { daily: true, level: profile.currentLevel })
              }
            >
              ယနေ့စာ ဖတ်မည်
            </button>
          </section>
        )
      )}

      <div className="level-tabs" style={{ marginTop: 18 }}>
        {LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            className={`level-tab ${activeLevel === lv ? 'active' : ''}`}
            style={
              isLevelNear(lv, profile.currentLevel, 1)
                ? undefined
                : { opacity: 0.45 }
            }
            title={
              isLevelNear(lv, profile.currentLevel, 1)
                ? 'အကြံပြု band'
                : 'သင့် level နှင့် ဝေး — စိတ်ကြိုက် ဖတ်နိုင်'
            }
            onClick={() => {
              const next = new URLSearchParams()
              next.set('level', lv)
              setParams(next)
            }}
          >
            {lv}
            <span className="muted"> ({counts[lv]})</span>
          </button>
        ))}
      </div>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>
          {activeLevel} · {LEVEL_LABELS[activeLevel].my}
          {activeLevel === profile.currentLevel ? ' (သင့် level)' : ''}
        </h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          ဤ level တွင် {levelList.length} ပုဒ် · မဖတ်ရသေး {unreadHere.length} ပုဒ်
        </p>

        {levelList.length === 0 ? (
          <p className="muted">ဤ level အတွက် story မရှိသေးပါ။</p>
        ) : (
          <div className="grid-2">
            {levelList.map((s) => {
              const read = profile.readStoryIds.includes(s.id)
              const isDaily = daily?.id === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  className="panel story-card"
                  onClick={() =>
                    openStory(s.id, {
                      daily: isDaily,
                      level: activeLevel,
                    })
                  }
                >
                  <div className="flex wrap">
                    <span className="chip">{s.genreMy}</span>
                    {isDaily && <span className="chip warn">ယနေ့</span>}
                    {read && <span className="chip">ဖတ်ပြီး</span>}
                  </div>
                  <h2 style={{ marginTop: 10, fontSize: '1.1rem' }}>{s.title}</h2>
                  <p className="muted">{s.titleMy}</p>
                  <p style={{ marginTop: 8 }}>{s.summaryMy}</p>
                  <p className="muted" style={{ marginTop: 10 }}>
                    ~{s.words} လုံး · {s.minutes} မိနစ်
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <p className="muted" style={{ marginTop: 16 }}>
        စုစုပေါင်း {STORIES.length} ပုဒ် · သင်ဖတ်ပြီး {profile.readStoryIds.length} ပုဒ်
      </p>
    </>
  )
}
