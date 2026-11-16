import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  canUseAiLookup,
  isSkippableWord,
  lookupWordAi,
  normalizeLemma,
  type WordSense,
} from '../lib/wordLookup'
import { speak } from '../lib/speech'
import { useProfile } from '../state/ProfileContext'

type Props = {
  text: string
  className?: string
  as?: 'p' | 'div' | 'span'
}

type Token =
  | { kind: 'word'; value: string }
  | { kind: 'space'; value: string }
  | { kind: 'punct'; value: string }

function tokenize(text: string): Token[] {
  const parts = text
    .split(/([A-Za-z]+(?:'[A-Za-z]+)?|[_]+)/g)
    .filter((p) => p.length > 0)
  return parts.map((p) => {
    if (/^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(p)) return { kind: 'word' as const, value: p }
    if (/^_+$/.test(p)) return { kind: 'punct' as const, value: p }
    if (/^\s+$/.test(p)) return { kind: 'space' as const, value: p }
    return { kind: 'punct' as const, value: p }
  })
}

export function TapWordText({ text, className, as = 'p' }: Props) {
  const { profile, saveWord } = useProfile()
  const [open, setOpen] = useState<string | null>(null)
  const [sense, setSense] = useState<WordSense | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const aiReady = canUseAiLookup(profile?.tutorSettings)

  const alreadySaved = (word: string) =>
    (profile?.savedWords ?? []).some(
      (w) => w.word.trim().toLowerCase() === word.trim().toLowerCase(),
    )

  useEffect(() => {
    setOpen(null)
    setSense(null)
    setLoading(false)
    setSavedMsg('')
  }, [text])

  const onWord = async (raw: string) => {
    const key = normalizeLemma(raw)
    if (!key || isSkippableWord(raw)) return
    if (open === key) {
      setOpen(null)
      return
    }
    setOpen(key)
    setSense(null)
    setSavedMsg('')
    setLoading(true)
    const hit = await lookupWordAi(raw, text, profile?.tutorSettings)
    setLoading(false)
    setSense(hit)
  }

  const onSave = () => {
    if (!sense || sense.source !== 'ai') return
    const res = saveWord({
      word: sense.word,
      meaningMy: sense.meaningMy,
      pos: sense.pos,
      example: sense.example,
      exampleMy: sense.exampleMy,
      tipMy: sense.tipMy,
      context: text.slice(0, 200),
    })
    setSavedMsg(res.updated ? 'အပ်ဒိတ် လုပ်ပြီးပါပြီ' : 'မှတ်ပြီးပါပြီ')
  }

  const tokens = tokenize(text)
  const Tag = as
  const kids: ReactNode[] = tokens.map((t, i) => {
    if (t.kind !== 'word') {
      return <span key={i}>{t.value}</span>
    }
    const skip = isSkippableWord(t.value)
    const active = open === normalizeLemma(t.value)
    return (
      <button
        key={i}
        type="button"
        className={`tap-word${skip ? ' tap-word-skip' : ''}${active ? ' active' : ''}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void onWord(t.value)
        }}
        title={skip ? undefined : 'AI ဖြင့် အဓိပ္ပာယ် ကြည့်ရန်'}
      >
        {t.value}
      </button>
    )
  })

  return (
    <div className="tap-word-wrap">
      <Tag className={className}>{kids}</Tag>
      {open && (
        <div className="word-pop" role="dialog" aria-label={`Meaning of ${open}`}>
          <div className="flex wrap" style={{ gap: 8, marginBottom: 6 }}>
            <strong style={{ fontSize: '1.1rem' }}>{sense?.word ?? open}</strong>
            {sense?.pos && <span className="chip">{sense.pos}</span>}
            <span className="chip">{loading ? 'AI…' : sense?.source === 'ai' ? 'AI' : '—'}</span>
            <div className="spacer" />
            <button
              type="button"
              className="btn ghost"
              style={{ padding: '4px 10px' }}
              onClick={() => void speak(sense?.word ?? open, 0.9)}
            >
              🔊
            </button>
            <button
              type="button"
              className="btn ghost"
              style={{ padding: '4px 10px' }}
              onClick={() => setOpen(null)}
            >
              ✕
            </button>
          </div>
          {loading && <p className="muted">AI ရှာနေသည်…</p>}
          {!loading && sense && (
            <>
              <p>{sense.meaningMy}</p>
              {sense.example && (
                <p className="muted" style={{ marginTop: 8 }}>
                  e.g. <em>{sense.example}</em>
                </p>
              )}
              {sense.exampleMy && <p className="muted">{sense.exampleMy}</p>}
              {sense.tipMy && (
                <p style={{ marginTop: 8, fontSize: '0.92rem' }}>💡 {sense.tipMy}</p>
              )}
              {sense.source === 'ai' && (
                <div className="flex wrap" style={{ marginTop: 12, gap: 8 }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={onSave}
                  >
                    {savedMsg
                      ? `✓ ${savedMsg}`
                      : alreadySaved(sense.word)
                        ? '📌 ထပ်မှတ် / အပ်ဒိတ်'
                        : '📌 မှတ်မည်'}
                  </button>
                  <Link className="btn ghost" to="/words">
                    မှတ်ထားတာ ကြည့်ရန်
                  </Link>
                </div>
              )}
              {savedMsg && (
                <p className="muted" style={{ marginTop: 8 }}>
                  {savedMsg}
                </p>
              )}
              {!aiReady && (
                <p className="muted" style={{ marginTop: 10 }}>
                  <Link to="/tutor">Tutor → Settings</Link> တွင် API key ထည့်ပါ။
                </p>
              )}
            </>
          )}
        </div>
      )}
      {!open && (
        <p className="muted tap-hint">
          စကားလုံးနှိပ် → AI → မှတ်မည်
          {!aiReady ? ' (API key လိုသည်)' : ''}
        </p>
      )}
    </div>
  )
}
