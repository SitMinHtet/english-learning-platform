import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import { progressSummary } from '../lib/dailyPlan'
import { LEVEL_LABELS, SKILL_LABELS } from '../data/cefr'
import { vocabStats } from '../lib/srs'
import type { Skill } from '../types'

export function ProgressPage() {
  const { profile, resetAll, exportData, importData } = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  if (!profile) return null

  const vstats = vocabStats(profile)

  const summary = progressSummary(profile)
  const recentAttempts = [...profile.attempts].slice(-12).reverse()

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">Auto Analysis</div>
          <h1 style={{ marginTop: 10 }}>တိုးတက်မှု ခွဲခြမ်းစိတ်ဖြာခြင်း</h1>
          <p>
            စုစုပေါင်း လေ့ကျင့်ချိန် ~{profile.totalMinutes} မိနစ် · Streak {profile.streak} ရက် ·
            မေးခွန်းသုံးပြီး {profile.usedQuestionIds.length} ခု
          </p>
        </div>
        <Link className="btn" to="/test?kind=weekly">
          Level Test
        </Link>
      </div>

      <div className="grid-3">
        <div className="stat">
          <div className="label">လက်ရှိ Level</div>
          <div className="value">{profile.currentLevel}</div>
          <div className="muted">{LEVEL_LABELS[profile.currentLevel].my}</div>
        </div>
        <div className="stat">
          <div className="label">C2 အထိ</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {summary.etaTextMy}
          </div>
        </div>
        <div className="stat">
          <div className="label">ပျမ်းမျှ ကျွမ်းကျင်မှု</div>
          <div className="value">{summary.avgMastery}%</div>
        </div>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Skill Mastery</h2>
        <p className="muted" style={{ marginBottom: 8 }}>
          {summary.trendMy}
        </p>
        {(Object.keys(SKILL_LABELS) as Skill[]).map((skill) => (
          <div className="skill-row" key={skill}>
            <Link to={`/practice/${skill}`}>
              {SKILL_LABELS[skill].icon} {SKILL_LABELS[skill].my}
            </Link>
            <div className="bar">
              <span style={{ width: `${profile.skillMastery[skill]}%` }} />
            </div>
            <span>{profile.skillMastery[skill]}%</span>
          </div>
        ))}
      </section>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <section className="panel">
          <h2>Level Test မှတ်တမ်း</h2>
          {profile.levelTests.length === 0 ? (
            <p className="muted">စစ်ဆေးမှု မရှိသေးပါ။</p>
          ) : (
            <ul className="list-plain">
              {[...profile.levelTests].reverse().map((t) => (
                <li key={t.id}>
                  <strong>
                    {t.kind === 'placement' ? 'Placement' : 'Weekly'} → {t.level}
                  </strong>
                  <div className="muted">
                    {new Date(t.date).toLocaleString()} · {t.percent}% · မေးခွန်း{' '}
                    {t.questionIds.length}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>အမှား မှတ်တမ်း (Error Journal)</h2>
          {profile.errorJournal.length === 0 ? (
            <p className="muted">အမှား မသိမ်းရသေးပါ — လေ့ကျင့်ရင် ဤနေရာတွင် ပေါ်မည်။</p>
          ) : (
            <ul className="list-plain">
              {[...profile.errorJournal].reverse().slice(0, 10).map((e) => (
                <li key={e.id}>
                  <span className="chip warn">{SKILL_LABELS[e.skill].my}</span>
                  <div style={{ marginTop: 6 }}>
                    {e.wrong && (
                      <span>
                        <strong>{e.wrong}</strong>
                        {e.correct ? <> → {e.correct}</> : null}
                      </span>
                    )}
                  </div>
                  <p className="muted" style={{ marginTop: 4 }}>
                    {e.reasonMy}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>မကြာသေးမီ အဖြေများ</h2>
        {recentAttempts.length === 0 ? (
          <p className="muted">မရှိသေးပါ။</p>
        ) : (
          <ul className="list-plain">
            {recentAttempts.map((a) => (
              <li key={a.id}>
                <span className={`chip ${a.correct ? '' : 'warn'}`}>
                  {a.correct ? 'မှန်' : 'မှား'} · {a.skill}
                </span>{' '}
                {a.userAnswer}
                {a.explanationMy && (
                  <p className="muted" style={{ marginTop: 4 }}>
                    {a.explanationMy}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>💾 မှတ်တမ်း သိမ်းဆည်းခြင်း</h2>
        <p style={{ marginBottom: 10 }}>
          <strong>npm run ပြန်ဖွင့်ရင် မပျက်ပါ။</strong> ဒေတာကို ဤဘရောက်ဇာ၏ localStorage +
          IndexedDB တွင် သိမ်းထားသည်။ Project ပြန် build/run လုပ်ရုံဖြင့် အစမှ မဖြစ်ပါ။
        </p>
        <p className="muted" style={{ marginBottom: 12 }}>
          နောက်ဆုံး သိမ်းချိန်: {new Date(profile.updatedAt).toLocaleString()} · Vocab ကတ်{' '}
          {vstats.total} · Due {vstats.due}
        </p>
        <div className="feedback" style={{ marginBottom: 14 }}>
          ပျက်နိုင်သော အခြေအနေများ: browser data ရှင်းခြင်း၊ Incognito, တခြား browser/ကွန်ပျူတာ။
          ထို့ကြောင့် အောက်တွင် JSON backup ဒေါင်းလုပ်ထားပါ။
        </div>
        <div className="flex wrap">
          <button className="btn" type="button" onClick={exportData}>
            Backup ဒေါင်းလုပ်
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            Backup ပြန်တင်
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              const res = importData(text)
              setImportMsg(res.ok ? '✅ Backup ပြန်တင်ပြီးပါပြီ' : `❌ ${res.error}`)
              e.target.value = ''
            }}
          />
        </div>
        {importMsg && <p style={{ marginTop: 10 }}>{importMsg}</p>}
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>ဒေတာ ပြန်စရန်</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Profile အားလုံးဖျက်ပြီး အစမှ ပြန်စမည် (မေးခွန်း used list ပါ)။
        </p>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('အားလုံး ဖျက်မလား?')) resetAll()
          }}
        >
          Reset
        </button>
      </section>
    </>
  )
}
