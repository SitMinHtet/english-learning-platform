import { useEffect, useMemo, useState } from 'react'
import type { Question } from '../types'
import { isAnswerCorrect, withShuffledOptions } from '../lib/testEngine'
import { localDayKey } from '../lib/dateKey'
import { speak, stopSpeaking } from '../lib/speech'
import { useProfile } from '../state/ProfileContext'
import { TapWordText } from './TapWordText'

interface Props {
  questions: Question[]
  title?: string
  onComplete?: (correct: number, total: number) => void
  record?: boolean
}

export function QuizPlayer({
  questions,
  title,
  onComplete,
  record = true,
}: Props) {
  const { recordAttempt } = useProfile()
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const setId = questions.map((x) => x.id).join('|')
  useEffect(() => {
    setIdx(0)
    setSelected(null)
    setChecked(false)
    setCorrectCount(0)
    setDone(false)
    stopSpeaking()
  }, [setId])

  const raw = questions[idx]
  const q = useMemo(
    () => (raw ? withShuffledOptions(raw, localDayKey()) : raw),
    [raw],
  )
  const progress = useMemo(
    () => ((idx + (checked ? 1 : 0)) / Math.max(questions.length, 1)) * 100,
    [idx, checked, questions.length],
  )

  if (!q) {
    return <div className="panel">မေးခွန်း မရှိပါ။</div>
  }

  if (done) {
    return (
      <div className="panel">
        <h2>ပြီးပါပြီ</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          ရမှတ် {correctCount}/{questions.length} (
          {Math.round((correctCount / questions.length) * 100)}%)
        </p>
        <button
          className="btn"
          style={{ marginTop: 16 }}
          onClick={() => onComplete?.(correctCount, questions.length)}
        >
          ပြီးဆုံးသည်
        </button>
      </div>
    )
  }

  const check = (answer: string) => {
    if (checked) return
    setSelected(answer)
    setChecked(true)
    const ok = isAnswerCorrect(q, answer)
    if (ok) setCorrectCount((c) => c + 1)
    if (record) {
      recordAttempt({
        questionId: q.id,
        skill: q.skill,
        correct: ok,
        userAnswer: answer,
        correctAnswer: Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer,
        explanationMy: q.explanationMy,
      })
    }
  }

  const next = () => {
    stopSpeaking()
    if (idx + 1 >= questions.length) {
      setDone(true)
      return
    }
    setIdx((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  return (
    <div className="panel">
      {title && <h2>{title}</h2>}
      <div className="flex" style={{ marginBottom: 12 }}>
        <span className="chip">
          {idx + 1}/{questions.length}
        </span>
        <span className="chip">{q.level}</span>
        <span className="muted">{q.skill}</span>
      </div>
      <div className="bar" style={{ marginBottom: 18 }}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {q.passage && (
        <div className="passage">
          <TapWordText text={q.passage} as="div" />
        </div>
      )}

      {q.audioText && (
        <div className="flex wrap" style={{ marginBottom: 14 }}>
          <button
            className="btn secondary"
            type="button"
            onClick={() => void speak(q.audioText!, 0.88)}
          >
            🔊 နားထောင်ရန်
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => void speak(q.audioText!, 0.7)}
          >
            နှေးနှေး နားထောင်
          </button>
        </div>
      )}

      <TapWordText
        text={q.prompt}
        as="p"
        className="quiz-prompt-text"
      />
      {q.promptMy && (
        <p className="muted" style={{ marginTop: 6 }}>
          {q.promptMy}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        {q.options?.map((opt) => {
          let cls = 'quiz-option'
          let tag = ''
          if (checked && selected === opt && !isAnswerCorrect(q, opt)) {
            cls += ' wrong'
            tag = 'သင်ရွေးတာ (မှား)'
          } else if (checked && isAnswerCorrect(q, opt)) {
            cls += ' correct'
            tag = selected === opt ? 'မှန် · သင်ရွေးတာ' : 'အဖြေမှန်'
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
              {tag ? <span className="opt-tag">{tag}</span> : null}
            </button>
          )
        })}
      </div>

      {checked && (
        <div className={`feedback ${isAnswerCorrect(q, selected ?? '') ? 'good' : 'bad'}`}>
          <strong>
            {isAnswerCorrect(q, selected ?? '') ? 'မှန်ပါသည်!' : 'မှားပါသည်'}
          </strong>
          <p style={{ marginTop: 8 }}>{q.explanationMy}</p>
          {q.audioText && (
            <p className="muted" style={{ marginTop: 8 }}>
              နားထောင်သော စာသား: “{q.audioText}”
            </p>
          )}
          {!isAnswerCorrect(q, selected ?? '') && (
            <p style={{ marginTop: 8 }}>
              အဖြေမှန်: <strong>{Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer}</strong>
            </p>
          )}
          <button className="btn" style={{ marginTop: 12 }} onClick={next}>
            ရှေ့သို့
          </button>
        </div>
      )}
    </div>
  )
}
