import { useEffect, useRef, useState } from 'react'
import type { Question } from '../types'
import {
  isSpeechRecognitionAvailable,
  listenOnce,
  scorePronunciation,
  speak,
  stopSpeaking,
  type ListenHandle,
} from '../lib/speech'
import { useProfile } from '../state/ProfileContext'
import { TapWordText } from './TapWordText'

interface Props {
  questions: Question[]
  mode: 'speaking' | 'pronunciation'
  onComplete?: () => void
}

export function SpeechPractice({ questions, mode, onComplete }: Props) {
  const { recordAttempt } = useProfile()
  const [idx, setIdx] = useState(0)
  const [listening, setListening] = useState(false)
  const [live, setLive] = useState('')
  const [level, setLevel] = useState(0)
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [typed, setTyped] = useState('')
  const [ttsError, setTtsError] = useState('')
  const handleRef = useRef<ListenHandle | null>(null)

  // Only reset when the question *set* changes — not when parent re-renders after scoring
  const setId = questions.map((x) => x.id).join('|')
  useEffect(() => {
    setIdx(0)
    setHeard('')
    setLive('')
    setLevel(0)
    setScore(null)
    setError('')
    setTyped('')
    setTtsError('')
    setListening(false)
    handleRef.current = null
    stopSpeaking()
  }, [setId, mode])

  const q = questions[idx]
  const available = isSpeechRecognitionAvailable()
  const expected = q
    ? Array.isArray(q.answer)
      ? q.answer[0]
      : q.answer
    : ''

  if (!q) return <div className="panel">လေ့ကျင့်ရန် မေးခွန်း မရှိပါ။</div>

  const playModel = async () => {
    setTtsError('')
    stopSpeaking()
    try {
      await speak(expected, mode === 'pronunciation' ? 0.75 : 0.88)
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : 'အသံဖွင့် မရပါ')
    }
  }

  const applyResult = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setHeard(trimmed)
    setLive('')
    const s = scorePronunciation(expected, trimmed)
    setScore(s)
    setError('')
    recordAttempt({
      questionId: q.id,
      skill: mode,
      correct: s >= 70,
      userAnswer: trimmed,
      correctAnswer: expected,
      explanationMy: q.explanationMy,
      minutes: 3,
      speakingScore: s,
    })
  }

  const startListen = async () => {
    setError('')
    setHeard('')
    setLive('')
    setLevel(0)
    setScore(null)
    stopSpeaking()
    setListening(true)
    handleRef.current = null
    try {
      const text = await listenOnce({
        timeoutMs: 22000,
        onPartial: (t) => setLive(t),
        onLevel: (n) => setLevel(n),
        onReady: (h) => {
          handleRef.current = h
        },
      })
      applyResult(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'မအောင်မြင်ပါ')
    } finally {
      setListening(false)
      handleRef.current = null
      setLevel(0)
    }
  }

  const stopListen = () => {
    handleRef.current?.stop()
  }

  const submitTyped = () => {
    if (!typed.trim()) return
    applyResult(typed)
    setTyped('')
  }

  const next = () => {
    stopSpeaking()
    setHeard('')
    setLive('')
    setScore(null)
    setError('')
    setTyped('')
    if (idx + 1 >= questions.length) {
      onComplete?.()
      return
    }
    setIdx((i) => i + 1)
  }

  return (
    <div className="panel">
      <div className="flex" style={{ marginBottom: 12 }}>
        <span className="chip">
          {idx + 1}/{questions.length}
        </span>
        <span className="chip">{q.level}</span>
      </div>
      <TapWordText text={q.prompt} as="p" className="quiz-prompt-text" />
      {q.promptMy && (
        <p className="muted" style={{ marginTop: 6 }}>
          {q.promptMy}
        </p>
      )}
      {q.tipsMy && (
        <p className="chip warn" style={{ marginTop: 12 }}>
          အကြံ: {q.tipsMy}
        </p>
      )}

      <div className="flex wrap" style={{ marginTop: 22, gap: 12 }}>
        <button
          className="btn secondary"
          type="button"
          onClick={() => void playModel()}
          disabled={listening}
        >
          🔊 နမူနာ နားထောင်
        </button>
        {available ? (
          <>
            <button
              className={listening ? 'mic-pulse' : 'btn'}
              type="button"
              onClick={() => void startListen()}
              disabled={listening}
            >
              {listening ? 'နားထောင်နေသည်…' : '🎤 ပြောရန်'}
            </button>
            {listening && (
              <button className="btn secondary" type="button" onClick={stopListen}>
                ပြောပြီးပါပြီ
              </button>
            )}
          </>
        ) : (
          <p className="muted">
            Mic အသံမှတ်ခြင်း မရပါ — Chrome သုံးပါ (သို့) အောက်တွင် စာရိုက်စစ်ပါ။
          </p>
        )}
      </div>

      {ttsError && (
        <p className="muted" style={{ marginTop: 8, color: 'var(--danger, #b42318)' }}>
          {ttsError}
        </p>
      )}

      {listening && (
        <div className="feedback" style={{ marginTop: 14 }}>
          <p>
            <strong>အခု ပြောပါ</strong> — အင်္ဂလိပ်လို စာကြောင်းတစ်ခုလုံး။ Mic bar တက်ရင် မိုက် အလုပ်လုပ်နေသည်။
          </p>
          <div className="mic-level" aria-hidden>
            <span style={{ width: `${Math.max(4, level)}%` }} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            ကြားနေသည်: <em>{live ? `“${live}”` : '… စာသား စောင့်နေသည်'}</em>
          </p>
        </div>
      )}

      {error && (
        <div className="feedback bad" style={{ marginTop: 16 }}>
          {error}
          <div className="flex wrap" style={{ marginTop: 12 }}>
            <button
              className="btn secondary"
              type="button"
              onClick={() => void startListen()}
            >
              ထပ်ကြိုးစား
            </button>
            <button className="btn ghost" type="button" onClick={next}>
              ကျော်မည်
            </button>
          </div>
        </div>
      )}

      {score === null && (
        <div className="typed-fallback" style={{ marginTop: 18 }}>
          <p className="muted" style={{ marginBottom: 8 }}>
            Mic မရရင် — ပြောလိုက်သည့်စာကို ရိုက်ပြီး စစ်နိုင်သည်:
          </p>
          <div className="flex wrap" style={{ gap: 8 }}>
            <input
              className="speech-type-input"
              value={typed}
              placeholder={expected}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitTyped()
              }}
              disabled={listening}
            />
            <button
              className="btn secondary"
              type="button"
              disabled={listening || !typed.trim()}
              onClick={submitTyped}
            >
              စာရိုက် စစ်မည်
            </button>
          </div>
        </div>
      )}

      {score !== null && (
        <div className={`feedback ${score >= 70 ? 'good' : 'bad'}`} style={{ marginTop: 16 }}>
          <div className="flex">
            <div className="score-ring" style={{ ['--p' as string]: score }}>
              <span>{score}</span>
            </div>
            <div>
              <strong>
                {score >= 90
                  ? 'အလွန်ကောင်း!'
                  : score >= 70
                    ? 'ကောင်း — နီးပါးမှန်'
                    : 'ထပ်လေ့ကျင့်ရန်'}
              </strong>
              <p className="muted" style={{ marginTop: 4 }}>
                သင်ပြောတာ: “{heard}”
              </p>
              <p style={{ marginTop: 8 }}>{q.explanationMy}</p>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} onClick={next}>
            {idx + 1 >= questions.length ? 'ပြီးဆုံး' : 'ရှေ့သို့'}
          </button>
        </div>
      )}
    </div>
  )
}
