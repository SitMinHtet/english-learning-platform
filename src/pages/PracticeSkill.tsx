import { useMemo, useRef } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LESSONS } from '../data/lessons'
import { getQuestionById, QUESTIONS } from '../data/questions'
import { isLevelNear, SKILL_LABELS } from '../data/cefr'
import { QuizPlayer } from '../components/QuizPlayer'
import { SpeechPractice } from '../components/SpeechPractice'
import { useProfile } from '../state/ProfileContext'
import { getDailyQuestions } from '../lib/dailyPlan'
import type { CEFRLevel, Question, Skill } from '../types'

const SESSION_SIZE = 24

function pickSessionQuestions(
  skill: Skill,
  level: CEFRLevel,
  usedIds: string[],
  size: number,
): Question[] {
  const unusedFirst = (list: Question[]) => {
    const unused = list.filter((q) => !usedIds.includes(q.id))
    return unused.length >= Math.min(4, list.length) ? unused : list
  }

  const same = unusedFirst(
    QUESTIONS.filter((q) => q.skill === skill && q.level === level),
  )
  const near = unusedFirst(
    QUESTIONS.filter(
      (q) =>
        q.skill === skill &&
        q.level !== level &&
        isLevelNear(q.level, level, 1),
    ),
  )
  // Stay within ±1 only — never fall back to distant levels
  const bandReuse = unusedFirst(
    QUESTIONS.filter((q) => q.skill === skill && isLevelNear(q.level, level, 1)),
  )

  const picked: Question[] = []
  const seen = new Set<string>()
  for (const q of [...same, ...near, ...bandReuse]) {
    if (seen.has(q.id)) continue
    seen.add(q.id)
    picked.push(q)
    if (picked.length >= size) break
  }
  return picked
}

export function PracticeSkill() {
  const { skill } = useParams<{ skill: Skill }>()
  const [params] = useSearchParams()
  const lessonId = params.get('lesson')
  const isDaily = params.get('daily') === '1'
  const { profile, completeLesson, markDailyDone } = useProfile()
  const nav = useNavigate()

  const s = (skill ?? 'reading') as Skill
  const meta = SKILL_LABELS[s] ?? SKILL_LABELS.reading

  const lesson = LESSONS.find((l) => l.id === lessonId)

  // Lock the session list so scoring / profile updates do not reshuffle or remount mid-practice
  const sessionKey = `${s}|${isDaily ? 'd' : 'n'}|${lessonId ?? ''}|${profile?.currentLevel ?? ''}|${profile?.dailyPlanDate ?? ''}`
  const lockedRef = useRef<{ key: string; questions: Question[] } | null>(null)

  const questions = useMemo(() => {
    if (!profile) return [] as Question[]
    if (lockedRef.current?.key === sessionKey) {
      return lockedRef.current.questions
    }

    let picked: Question[] = []
    if (isDaily) {
      const daily = getDailyQuestions(profile, s)
      if (daily.length > 0) picked = daily
    }

    if (picked.length === 0 && lesson) {
      const fromLesson = lesson.questionIds
        .map((id) => getQuestionById(id))
        .filter(Boolean) as Question[]
      if (fromLesson.length >= SESSION_SIZE) {
        picked = fromLesson.slice(0, SESSION_SIZE)
      } else {
        const extra = pickSessionQuestions(
          s,
          profile.currentLevel,
          [...profile.usedQuestionIds, ...fromLesson.map((q) => q.id)],
          SESSION_SIZE - fromLesson.length,
        )
        picked = [...fromLesson, ...extra]
      }
    }

    if (picked.length === 0) {
      picked = pickSessionQuestions(
        s,
        profile.currentLevel,
        profile.usedQuestionIds,
        SESSION_SIZE,
      )
    }

    lockedRef.current = { key: sessionKey, questions: picked }
    return picked
  }, [profile, s, isDaily, lesson, sessionKey])

  if (!profile) return null

  const validSkills: Skill[] = [
    'listening',
    'speaking',
    'reading',
    'writing',
    'pronunciation',
  ]
  if (!validSkills.includes(s)) {
    return <Navigate to="/" replace />
  }

  if (s === 'writing') {
    return <Navigate to="/practice/writing" replace />
  }

  const isSpeech = s === 'speaking' || s === 'pronunciation'

  const finish = () => {
    if (isDaily) markDailyDone(s)
    if (lesson) completeLesson(lesson.id, lesson.minutes)
    nav('/')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">
            {meta.icon} {meta.my} · {questions.length} မေးခွန်း
            {isDaily ? ' · ယနေ့' : ''}
          </div>
          <h1 style={{ marginTop: 10 }}>
            {isDaily
              ? `ယနေ့ · ${meta.my}`
              : (lesson?.titleMy ?? `${meta.my} လေ့ကျင့်`)}
          </h1>
          <p>
            {isDaily
              ? `${profile.currentLevel} · ယနေ့အတွက် လော့ခ်လုပ်ထားသော exercise set (နေ့တိုင်း အသစ်)`
              : (lesson?.descriptionMy ??
                `${profile.currentLevel} အဆင့် · တစ်ကြိမ် ${SESSION_SIZE} ခုအထိ`)}
          </p>
        </div>
        <Link className="btn ghost" to="/">
          Dashboard
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="panel">ဤ skill အတွက် မေးခွန်း မကျန်တော့ပါ။</div>
      ) : isSpeech ? (
        <SpeechPractice
          key={sessionKey}
          questions={questions}
          mode={s}
          onComplete={finish}
        />
      ) : (
        <QuizPlayer
          key={sessionKey}
          questions={questions}
          title={isDaily ? `Daily ${meta.en}` : lesson?.title}
          onComplete={finish}
        />
      )}
    </>
  )
}
