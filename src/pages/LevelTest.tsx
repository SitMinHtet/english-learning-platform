import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import {
  buildPlacementTest,
  buildWeeklyTest,
  isAnswerCorrect,
  placementLevelFromBands,
  PLACEMENT_PER_LEVEL,
  scoreTest,
  withShuffledOptions,
} from '../lib/testEngine'
import { localDayKey } from '../lib/dateKey'
import { speak } from '../lib/speech'
import { TapWordText } from '../components/TapWordText'
import { LEVELS, LEVEL_LABELS, SKILL_LABELS } from '../data/cefr'
import type { LevelTestResult, Question, Skill } from '../types'

interface Props {
  forceKind?: 'placement' | 'weekly'
}

export function LevelTest({ forceKind }: Props) {
  const { profile, completePlacement, completeWeekly, ensureWeeklyAi } =
    useProfile()
  const [params] = useSearchParams()
  const kind = (forceKind ??
    (params.get('kind') === 'placement' ? 'placement' : 'weekly')) as
    | 'placement'
    | 'weekly'
  const nav = useNavigate()

  // Keep questions in state (not only a ref) so the first paint always re-renders
  const sessionKey = useRef('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [ready, setReady] = useState(false)
  const [prepMsg, setPrepMsg] = useState('')
  const [aiWeekly, setAiWeekly] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<LevelTestResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const key = `${kind}|${profile.currentLevel}|${profile.placementDone}`

    if (kind === 'placement') {
      if (sessionKey.current !== key || questions.length === 0) {
        const qs = buildPlacementTest(profile.usedQuestionIds)
        sessionKey.current = key
        setQuestions(qs)
        setIdx(0)
        setAnswers({})
        setFinished(false)
        setResult(null)
      }
      setReady(true)
      return
    }

    ;(async () => {
      setReady(false)
      setPrepMsg('Weekly AI test ပြင်ဆင်နေသည်…')
      const res = await ensureWeeklyAi((m) => {
        if (!cancelled) setPrepMsg(m)
      })
      if (cancelled) return
      const qs =
        res.questions && res.questions.length >= 8
          ? res.questions
          : buildWeeklyTest(profile)
      setAiWeekly(!!(res.questions && res.questions.length >= 8))
      sessionKey.current = key
      setQuestions(qs)
      setIdx(0)
      setAnswers({})
      setFinished(false)
      setResult(null)
      setPrepMsg('')
      setReady(true)
    })()

    return () => {
      cancelled = true
    }
    // only re-run when kind / level changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, profile?.currentLevel, profile?.placementDone])

  if (!profile) return null

  if (!ready) {
    return (
      <div className="panel">
        <h2>Level Test ပြင်ဆင်နေသည်</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          {prepMsg || 'ခဏစောင့်ပါ… (API calls ခဏကြာနိုင်သည်)'}
        </p>
      </div>
    )
  }

  const q = questions[idx]
    ? withShuffledOptions(questions[idx]!, localDayKey())
    : undefined

  const select = (answer: string) => {
    if (!q) return
    const nextAnswers = { ...answers, [q.id]: answer }
    setAnswers(nextAnswers)
    if (idx + 1 >= questions.length) {
      const res = scoreTest(questions, nextAnswers, kind)
      setResult(res)
      setFinished(true)
      if (kind === 'weekly') completeWeekly(res)
    } else {
      setIdx((i) => i + 1)
    }
  }

  const finishAndGo = () => {
    if (!result) return
    if (kind === 'placement') {
      setSaving(true)
      completePlacement(result)
    }
    nav('/')
  }

  if (finished && result) {
    const bands =
      kind === 'placement'
        ? placementLevelFromBands(questions, answers).bandPercents
        : null

    return (
      <>
        <div className="page-head">
          <div>
            <div className="chip">
              {kind === 'placement' ? 'Placement' : 'Weekly'} Result
              {aiWeekly ? ' · AI' : ''}
            </div>
            <h1 style={{ marginTop: 10 }}>သင့်အဆင့်: {result.level}</h1>
            <p>
              {LEVEL_LABELS[result.level].my} — {LEVEL_LABELS[result.level].canDo}
            </p>
            {kind === 'placement' && (
              <p className="muted" style={{ marginTop: 8 }}>
                Level တိုင်း ≥၆၅% ရမှတ်ရှိသော အမြင့်ဆုံး band ကို သတ်မှတ်သည် (A1→C2)။
              </p>
            )}
          </div>
        </div>
        <div className="grid-2">
          <section className="panel">
            <div className="flex">
              <div
                className="score-ring"
                style={{ ['--p' as string]: result.percent }}
              >
                <span>{result.percent}%</span>
              </div>
              <div>
                <h2>စုစုပေါင်း ရမှတ်</h2>
                <p className="muted">မေးခွန်း {questions.length} ခု</p>
              </div>
            </div>
            {bands && (
              <div style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: '1rem' }}>Level band ရမှတ်</h2>
                {LEVELS.map((lv) => (
                  <div className="skill-row" key={lv}>
                    <span>
                      {lv}
                      {lv === result.level ? ' ★' : ''}
                    </span>
                    <div className="bar">
                      <span style={{ width: `${bands[lv] ?? 0}%` }} />
                    </div>
                    <span>{bands[lv] ?? '—'}%</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              {(Object.keys(result.skillScores) as Skill[])
                .filter((skill) => result.skillScores[skill] >= 0)
                .map((skill) => (
                  <div className="skill-row" key={skill}>
                    <span>{SKILL_LABELS[skill].my}</span>
                    <div className="bar">
                      <span style={{ width: `${result.skillScores[skill]}%` }} />
                    </div>
                    <span>{result.skillScores[skill]}%</span>
                  </div>
                ))}
            </div>
          </section>
          <section className="panel">
            <h2>ဘာဆက်လုပ်မလဲ</h2>
            <div className="flex wrap">
              <button className="btn" disabled={saving} onClick={finishAndGo}>
                Dashboard သို့
              </button>
              {kind === 'weekly' && (
                <Link className="btn secondary" to="/progress">
                  တိုးတက်မှု ကြည့်ရန်
                </Link>
              )}
            </div>
          </section>
        </div>
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>ပြန်လည်သုံးသပ်</h2>
          <ul className="list-plain">
            {questions.map((qq) => {
              const user = answers[qq.id] ?? ''
              const ok = isAnswerCorrect(qq, user)
              return (
                <li key={qq.id}>
                  <div className="flex wrap">
                    <span className={`chip ${ok ? '' : 'warn'}`}>
                      {ok ? 'မှန်' : 'မှား'} · {qq.skill}
                    </span>
                    <strong>{qq.prompt}</strong>
                  </div>
                  <p className="muted" style={{ marginTop: 6 }}>
                    သင့်အဖြေ: {user || '—'} · မှန်:{' '}
                    {Array.isArray(qq.answer) ? qq.answer.join('/') : qq.answer}
                  </p>
                  <p style={{ marginTop: 4 }}>{qq.explanationMy}</p>
                </li>
              )
            })}
          </ul>
        </section>
      </>
    )
  }

  if (!q) {
    return (
      <div className="panel">
        <p>မေးခွန်း မလုံလောက်ပါ။ ({questions.length} ခု ရရှိ)</p>
        {kind === 'placement' && (
          <button
            className="btn"
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => {
              const qs = buildPlacementTest()
              setQuestions(qs)
              setIdx(0)
              setAnswers({})
              setFinished(false)
              setResult(null)
              setReady(true)
            }}
          >
            Placement ပြန်ဆွဲမည်
          </button>
        )}
        {profile.placementDone ? (
          <Link className="btn ghost" to="/" style={{ marginLeft: 8 }}>
            နောက်သို့
          </Link>
        ) : null}
      </div>
    )
  }

  const options = q.options ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">
            {kind === 'placement'
              ? `Placement · A1→C2 · level တိုင်း ~${PLACEMENT_PER_LEVEL} မေး`
              : aiWeekly
                ? 'တပတ်တခါ Level Test · AI'
                : 'တပတ်တခါ Level Test · Local'}
          </div>
          <h1 style={{ marginTop: 10 }}>
            မေးခွန်း {idx + 1} / {questions.length}
            {q ? ` · ${q.level}` : ''}
          </h1>
        </div>
      </div>

      <div className="panel">
        <div className="bar" style={{ marginBottom: 16 }}>
          <span style={{ width: `${(idx / Math.max(questions.length, 1)) * 100}%` }} />
        </div>
        <div className="flex" style={{ marginBottom: 10 }}>
          <span className="chip">{q.level}</span>
          <span className="chip">{SKILL_LABELS[q.skill].my}</span>
        </div>

        {q.passage && (
          <div className="passage">
            <TapWordText text={q.passage} as="div" />
          </div>
        )}
        {q.audioText && (
          <button
            className="btn secondary"
            style={{ marginBottom: 12 }}
            onClick={() => void speak(q.audioText!, 0.88)}
          >
            🔊 နားထောင်ရန်
          </button>
        )}
        <TapWordText text={q.prompt} as="p" className="quiz-prompt-text" />
        {q.promptMy && (
          <p className="muted" style={{ marginTop: 6 }}>
            {q.promptMy}
          </p>
        )}

        <div style={{ marginTop: 14 }}>
          {options.length === 0 ? (
            <div className="feedback">
              <p>ရွေးစရာ မရှိပါ — ကျော်မည်။</p>
              <button className="btn" style={{ marginTop: 10 }} onClick={() => select('')}>
                ရှေ့သို့
              </button>
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="quiz-option"
                onClick={() => select(opt)}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
