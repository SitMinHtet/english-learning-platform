import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import { progressSummary } from '../lib/dailyPlan'
import { LEVEL_LABELS, SKILL_LABELS } from '../data/cefr'
import type { Skill } from '../types'

export function ProgressPage() {
  const { profile, resetAll } = useProfile()
  if (!profile) return null

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
