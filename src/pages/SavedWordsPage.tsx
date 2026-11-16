import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import {
  downloadWordsDoc,
  downloadWordsHtml,
  printWordsPdf,
} from '../lib/exportWords'
import { speak } from '../lib/speech'

export function SavedWordsPage() {
  const { profile, removeSavedWord, clearSavedWords } = useProfile()
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const words = useMemo(() => {
    const list = profile?.savedWords ?? []
    const needle = q.trim().toLowerCase()
    if (!needle) return list
    return list.filter(
      (w) =>
        w.word.toLowerCase().includes(needle) ||
        w.meaningMy.toLowerCase().includes(needle),
    )
  }, [profile?.savedWords, q])

  if (!profile) return null

  const onDoc = () => {
    if (!profile.savedWords.length) return
    downloadWordsDoc(profile, profile.savedWords)
    setMsg('Word (.doc) ဒေါင်းလုပ် လုပ်ပြီးပါပြီ')
  }

  const onPdf = () => {
    if (!profile.savedWords.length) return
    printWordsPdf(profile, profile.savedWords)
    setMsg('Print dialog ဖွင့်ပါ — Destination မှာ Save as PDF ရွေးနိုင်သည်')
  }

  const onHtml = () => {
    if (!profile.savedWords.length) return
    downloadWordsHtml(profile, profile.savedWords)
    setMsg('HTML ဖိုင် ဒေါင်းလုပ်ပြီး — ဖွင့်ပြီး Print → PDF လုပ်နိုင်သည်')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">📌 Saved Words</div>
          <h1 style={{ marginTop: 10 }}>မှတ်ထားသော စကားလုံးများ</h1>
          <p>
            မေးခွန်းထဲက စကားလုံးကို နှိပ် → AI အဓိပ္ပာယ် → “မှတ်မည်”။ နောက်မှ ပြန်ကြည့် /
            Word သို့ PDF ထုတ်နိုင်သည်။
          </p>
        </div>
        <Link className="btn ghost" to="/">
          Dashboard
        </Link>
      </div>

      <div className="flex wrap" style={{ gap: 10, marginBottom: 14 }}>
        <button
          className="btn"
          type="button"
          disabled={!profile.savedWords.length}
          onClick={onPdf}
        >
          🖨️ PDF / Print
        </button>
        <button
          className="btn secondary"
          type="button"
          disabled={!profile.savedWords.length}
          onClick={onDoc}
        >
          📄 Word (.doc)
        </button>
        <button
          className="btn ghost"
          type="button"
          disabled={!profile.savedWords.length}
          onClick={onHtml}
        >
          HTML
        </button>
        <button
          className="btn danger"
          type="button"
          disabled={!profile.savedWords.length}
          onClick={() => {
            if (confirm('မှတ်ထားသော စကားလုံးအားလုံး ဖျက်မလား?')) {
              clearSavedWords()
              setMsg('အားလုံး ဖျက်ပြီးပါပြီ')
            }
          }}
        >
          အားလုံး ဖျက်
        </button>
        <div className="spacer" />
        <span className="muted">{profile.savedWords.length} လုံး</span>
      </div>

      {msg && (
        <div className="feedback" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 14 }}>
        <input
          className="speech-type-input"
          style={{ width: '100%' }}
          placeholder="ရှာရန် — word သို့မဟုတ် အဓိပ္ပာယ်…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {words.length === 0 ? (
        <section className="panel">
          <h2>စာရင်း ဗလာ</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            Reading / Listening မေးခွန်းမှာ စကားလုံးကို နှိပ်ပြီး “မှတ်မည်” နှိပ်ပါ။
          </p>
        </section>
      ) : (
        <ul className="list-plain saved-word-list">
          {words.map((w) => (
            <li key={w.id} className="panel saved-word-item">
              <div className="flex wrap" style={{ gap: 8 }}>
                <strong style={{ fontSize: '1.15rem' }}>{w.word}</strong>
                {w.pos && <span className="chip">{w.pos}</span>}
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  {new Date(w.savedAt).toLocaleString()}
                </span>
                <div className="spacer" />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => void speak(w.word, 0.9)}
                >
                  🔊
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => removeSavedWord(w.id)}
                >
                  ဖျက်
                </button>
              </div>
              <p style={{ marginTop: 8 }}>{w.meaningMy}</p>
              {w.example && (
                <p className="muted" style={{ marginTop: 6 }}>
                  e.g. <em>{w.example}</em>
                </p>
              )}
              {w.exampleMy && <p className="muted">{w.exampleMy}</p>}
              {w.tipMy && (
                <p style={{ marginTop: 6, fontSize: '0.92rem' }}>💡 {w.tipMy}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
