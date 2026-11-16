import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import { askTutor, makeMessage } from '../lib/tutor'
import { canUseCloudAi } from '../lib/aiClient'
import { isAiProxyEnabled } from '../lib/aiConfig'

const QUICK = [
  'Present perfect ရှင်းပြပါ',
  'Articles (a/an/the) ရှင်းပြပါ',
  'C2 အတွက် ဘယ်လို လေ့ကျင့်ရမလဲ',
  'check: I go to school yesterday and she don’t like coffee.',
]

export function TutorPage() {
  const {
    profile,
    appendTutorMessages,
    clearTutorChat,
    updateTutorSettings,
  } = useProfile()
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [profile?.tutorChat.length, busy])

  if (!profile) return null

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setInput('')
    const userMsg = makeMessage('user', trimmed)
    appendTutorMessages([userMsg], 0)
    setBusy(true)
    try {
      // include the just-sent message in context via local copy
      const reply = await askTutor(trimmed, {
        ...profile,
        tutorChat: [...profile.tutorChat, userMsg],
      })
      appendTutorMessages([makeMessage('assistant', reply)], 3)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">🤖 AI Tutor</div>
          <h1 style={{ marginTop: 10 }}>မြန်မာလို ဆရာ</h1>
          <p>
            Offline ဆရာ အမြဲ ရသည်။ Public soft-launch တွင် Cloud AI ကို owner proxy မှ
            အလိုအလျောက် ချိတ်သည် (rate limit ရှိသည်)။
          </p>
        </div>
        <div className="flex wrap">
          <button className="btn ghost" type="button" onClick={() => setShowSettings((s) => !s)}>
            ဆက်တင် (Settings)
          </button>
          <Link className="btn ghost" to="/">
            ပင်မစာမျက်နှာ
          </Link>
        </div>
      </div>

      {showSettings && (
        <section className="panel" style={{ marginBottom: 16 }}>
          <h2>AI ဆက်တင်</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            {isAiProxyEnabled()
              ? 'Owner AI proxy သုံးနေသည် — သင့် API key မလိုပါ။ အလွန်အကျွံသုံးရင် rate limit တက်နိုင်သည်။'
              : 'Proxy ပိတ်ထားသည် — အောက်တွင် ကိုယ်ပိုင် key ထည့်နိုင်သည်။'}
          </p>
          <label className="flex" style={{ gap: 8, marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={profile.tutorSettings.useCloud}
              onChange={(e) => updateTutorSettings({ useCloud: e.target.checked })}
            />
            Cloud AI ဆရာ သုံးမည်
          </label>
          <label className="flex" style={{ gap: 8, marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={profile.tutorSettings.useAiDaily}
              onChange={(e) =>
                updateTutorSettings({ useAiDaily: e.target.checked })
              }
            />
            AI-first နေ့စဉ် pack + weekly test
          </label>
          {!isAiProxyEnabled() && (
            <>
              <input
                style={fieldStyle}
                type="password"
                placeholder="API Key (advanced)"
                value={profile.tutorSettings.apiKey}
                onChange={(e) => updateTutorSettings({ apiKey: e.target.value })}
              />
              <input
                style={fieldStyle}
                placeholder="Base URL (https://api.openai.com/v1)"
                value={profile.tutorSettings.baseUrl}
                onChange={(e) => updateTutorSettings({ baseUrl: e.target.value })}
              />
              <input
                style={fieldStyle}
                placeholder="Model (gpt-4o-mini)"
                value={profile.tutorSettings.model}
                onChange={(e) => updateTutorSettings({ model: e.target.value })}
              />
            </>
          )}
          <p className="muted" style={{ marginTop: 8 }}>
            ဆရာ:{' '}
            {profile.tutorSettings.useCloud && canUseCloudAi(profile.tutorSettings)
              ? isAiProxyEnabled()
                ? 'Cloud (proxy)'
                : 'Cloud (ကိုယ်ပိုင် key)'
              : 'Offline'}{' '}
            · Daily:{' '}
            {profile.tutorSettings.useAiDaily &&
            canUseCloudAi(profile.tutorSettings)
              ? 'AI generate'
              : 'Local bank'}
          </p>
        </section>
      )}

      <section className="panel chat-panel">
        <div className="chat-log">
          {profile.tutorChat.length === 0 && (
            <div className="feedback">
              မင်္ဂလာပါ! သဒ္ဒါမေးပါ၊ သို့မဟုတ်{' '}
              <code>check: your sentence here</code> ဖြင့် စာပြင်ခိုင်းပါ။
            </div>
          )}
          {profile.tutorChat.map((m) => (
            <div key={m.id} className={`bubble ${m.role}`}>
              <div className="bubble-meta">
                {m.role === 'user' ? 'သင်' : 'ဆရာ'} ·{' '}
                {new Date(m.at).toLocaleTimeString()}
              </div>
              <div className="bubble-body">{m.content}</div>
            </div>
          ))}
          {busy && <div className="muted">ဆရာ ရေးနေသည်…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="flex wrap" style={{ marginBottom: 10 }}>
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              className="chip"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => send(q)}
            >
              {q.length > 36 ? `${q.slice(0, 36)}…` : q}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          <textarea
            className="editor"
            style={{ minHeight: 72 }}
            placeholder="မေးခွန်း ရေးပါ… (Enter = ပို့, Shift+Enter = မျဉ်းသစ်)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
          />
          <div className="flex" style={{ marginTop: 10 }}>
            <button className="btn ghost" type="button" onClick={clearTutorChat}>
              စကားဝိုင်း ရှင်းမည်
            </button>
            <div className="spacer" />
            <button
              className="btn"
              type="button"
              disabled={busy || !input.trim()}
              onClick={() => void send(input)}
            >
              ပို့မည်
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

const fieldStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  marginBottom: 8,
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid var(--line)',
}
