import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import {
  cardWithWord,
  dueCardsNearLevel,
  vocabStats,
  type SrsQuality,
} from '../lib/srs'
import { speak } from '../lib/speech'

export function VocabPage() {
  const { profile, addVocabCards, reviewVocab, markDailyDone, saveWord } =
    useProfile()
  const [flipped, setFlipped] = useState(false)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => new Set())
  const [msg, setMsg] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  const due = useMemo(() => {
    if (!profile) return []
    const extra = profile.customVocab ?? []
    // Only review words in current ±1 (e.g. B1 → A2/B1/B2)
    return dueCardsNearLevel(profile, profile.currentLevel).filter(
      (c) => cardWithWord(c, extra).word,
    )
  }, [profile])
  const current = due[0]
  const pair = current
    ? cardWithWord(current, profile?.customVocab ?? [])
    : null
  const stats = profile ? vocabStats(profile) : null

  const isPinned = !!(
    pair?.word &&
    (profile?.savedWords ?? []).some(
      (w) => w.word.trim().toLowerCase() === pair.word!.word.trim().toLowerCase(),
    )
  )

  useEffect(() => {
    setPinMsg('')
  }, [current?.wordId])

  if (!profile || !stats) return null

  const onPin = () => {
    if (!pair?.word) return
    const w = pair.word
    const res = saveWord({
      word: w.word,
      meaningMy: w.meaningMy,
      pos: w.pos,
      example: w.example,
      exampleMy: w.exampleMy,
      tipMy: `Vocab SRS · ${w.level}`,
      context: w.example,
    })
    setPinMsg(res.updated ? 'အပ်ဒိတ် လုပ်ပြီးပါပြီ' : 'မှတ်စာလုံးထဲ ထည့်ပြီးပါပြီ')
  }

  const maybeMarkDaily = (nextIds: Set<string>, remainingDue: number) => {
    // 5 distinct cards OR cleared the due queue this session
    if (nextIds.size >= 5 || remainingDue <= 1) {
      markDailyDone('vocab')
    }
  }

  const rate = (q: SrsQuality) => {
    if (!current) return
    const id = current.wordId
    reviewVocab(id, q)
    setFlipped(false)
    setPinMsg('')
    setReviewedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      maybeMarkDaily(next, due.length)
      return next
    })
  }

  const onAdd = () => {
    const added = addVocabCards(8)
    if (added > 0) {
      setMsg(`✅ စကားလုံးအသစ် ${added} လုံး ထည့်ပြီးပါပြီ။ Due ကတ်တွေကို လေ့ကျင့်ပါ။`)
    } else {
      setMsg(
        `ℹ️ ထည့်စရာ စကားလုံး မကျန်တော့ပါ။ (စုစုပေါင်း bank ${stats.bankSize} လုံး · သင့်ကတ် ${stats.total})`,
      )
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">📚 Vocab SRS</div>
          <h1 style={{ marginTop: 10 }}>စကားလုံး Spaced Repetition</h1>
          <p>
            မေ့ခါနီးမှ ပြန်မေးသည် — C2 အတွက် နေ့စဉ် review က စကားလုံးအသစ်ထက် ပိုအရေးကြီးသည်။
            ကျန်ရှိ {stats.remaining} / {stats.bankSize} လုံး။
          </p>
        </div>
        <div className="flex wrap" style={{ gap: 8 }}>
          <Link className="btn ghost" to="/words">
            မှတ်စာလုံး ({profile.savedWords?.length ?? 0})
          </Link>
          <Link className="btn ghost" to="/">
            ပင်မစာမျက်နှာ
          </Link>
        </div>
      </div>

      <div className="grid-3">
        <div className="stat">
          <div className="label">စုစုပေါင်း ကတ်</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat">
          <div className="label">ယနေ့ Due</div>
          <div className="value">{stats.due}</div>
        </div>
        <div className="stat">
          <div className="label">ကျွမ်းပြီး (Mastered)</div>
          <div className="value">{stats.mastered}</div>
        </div>
      </div>

      <div className="flex wrap" style={{ margin: '16px 0' }}>
        <button
          className="btn secondary"
          type="button"
          onClick={onAdd}
          disabled={stats.remaining === 0}
        >
          + စကားလုံးအသစ် ၈ လုံး
        </button>
        <span className="muted">ဤ session သီးခြား ကတ်: {reviewedIds.size}</span>
      </div>

      {msg && (
        <div className="feedback" style={{ marginBottom: 14 }}>
          {msg}
        </div>
      )}

      {!pair?.word ? (
        <section className="panel">
          <h2>
            {stats.total === 0
              ? 'စကားလုံး မရှိသေးပါ'
              : 'ယနေ့ due မရှိတော့ပါ'}
          </h2>
          <p className="muted" style={{ marginTop: 8 }}>
            {stats.total === 0
              ? 'အပေါ်က “စကားလုံးအသစ် ၈ လုံး” ကို နှိပ်ပြီး စတင်ပါ။'
              : stats.remaining > 0
                ? 'စကားလုံးအသစ် ထပ်ထည့်နိုင်သည် သို့မဟုတ် နောက်မှ ပြန်လာပါ။'
                : 'Bank ထဲက စကားလုံးအားလုံး ထည့်ပြီးပါပြီ — due ပြန်လာတာကို စောင့်ပါ။'}
          </p>
          {stats.total === 0 && stats.remaining > 0 && (
            <button className="btn" style={{ marginTop: 12 }} type="button" onClick={onAdd}>
              စကားလုံး ၈ လုံး ထည့်မည်
            </button>
          )}
          {stats.total > 0 && due.length === 0 && (
            <button
              className="btn secondary"
              style={{ marginTop: 12 }}
              type="button"
              onClick={() => markDailyDone('vocab')}
            >
              ယနေ့ Vocab ပြီးပါပြီဟု မှတ်မည်
            </button>
          )}
        </section>
      ) : (
        <section className="panel vocab-card">
          <div className="flex">
            <span className="chip">{pair.word.level}</span>
            <span className="chip">{pair.word.pos ?? 'word'}</span>
            <span className="muted">
              ease {pair.card.ease} · interval {pair.card.interval}d
            </span>
          </div>

          <button
            type="button"
            className="vocab-face"
            onClick={() => setFlipped((f) => !f)}
          >
            {!flipped ? (
              <>
                <div className="vocab-word">{pair.word.word}</div>
                <p className="muted">နှိပ်ပြီး အဓိပ္ပာယ် ကြည့်ရန်</p>
              </>
            ) : (
              <>
                <div className="vocab-word" style={{ fontSize: '1.6rem' }}>
                  {pair.word.meaningMy}
                </div>
                <p style={{ marginTop: 12 }}>
                  <em>{pair.word.example}</em>
                </p>
                <p className="muted">{pair.word.exampleMy}</p>
              </>
            )}
          </button>

          <div className="flex wrap" style={{ marginTop: 14, gap: 8 }}>
            <button
              className="btn ghost"
              type="button"
              onClick={() => speak(pair.word!.word, 0.85)}
            >
              🔊 စကားလုံး
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => speak(pair.word!.example, 0.9)}
            >
              🔊 ဥပမာ
            </button>
            <button className="btn secondary" type="button" onClick={onPin}>
              {pinMsg
                ? `✓ ${pinMsg}`
                : isPinned
                  ? '📌 ထပ်မှတ် / အပ်ဒိတ်'
                  : '📌 မှတ်မည်'}
            </button>
          </div>

          {flipped && (
            <div className="srs-actions">
              <button className="btn danger" type="button" onClick={() => rate(0)}>
                ထပ်မေး (Again)
              </button>
              <button className="btn secondary" type="button" onClick={() => rate(1)}>
                ခက် (Hard)
              </button>
              <button className="btn" type="button" onClick={() => rate(2)}>
                ကောင်း (Good)
              </button>
              <button className="btn secondary" type="button" onClick={() => rate(3)}>
                လွယ် (Easy)
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}
