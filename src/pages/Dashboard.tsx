import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import {
  buildDailyPlan,
  dailySourceLabel,
  progressSummary,
} from '../lib/dailyPlan'
import { LEVEL_LABELS, SKILL_LABELS } from '../data/cefr'
import { vocabStats } from '../lib/srs'
import type { DailyPlanItem, Skill } from '../types'

const EXTRA_LABELS: Record<string, { icon: string; my: string }> = {
  library: { icon: '📖', my: 'စာအုပ် / Stories' },
  vocab: { icon: '📚', my: 'Vocab SRS' },
  tutor: { icon: '🤖', my: 'AI Tutor' },
}

function planLabel(item: DailyPlanItem) {
  if (item.skill in SKILL_LABELS) {
    const s = SKILL_LABELS[item.skill as Skill]
    return `${s.icon} ${s.my}`
  }
  const e = EXTRA_LABELS[item.skill]
  return e ? `${e.icon} ${e.my}` : item.titleMy
}

export function Dashboard() {
  const { profile, refreshDaily, generateAiDaily } = useProfile()
  const [aiMsg, setAiMsg] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  if (!profile) return null

  const plan = buildDailyPlan(profile)
  const summary = progressSummary(profile)
  const levelInfo = LEVEL_LABELS[profile.currentLevel]
  const vstats = vocabStats(profile)
  const { daily } = summary
  const source = dailySourceLabel(profile)

  const onAiDaily = async () => {
    setAiBusy(true)
    setAiMsg('AI ဖြင့် ယနေ့ pack generate လုပ်နေသည်… (skills + stories ၃ + vocab)')
    const res = await generateAiDaily((m) => setAiMsg(m))
    setAiBusy(false)
    setAiMsg(
      res.ok
        ? '✅ AI နေ့စဉ် pack အသစ် ရပါပြီ (skill တခု ~၂၄ မေး · stories ၃ · vocab)'
        : `❌ ${res.error}`,
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">
            ယနေ့ {daily.todayLabel} · {profile.name} · {source}
          </div>
          <h1 style={{ marginTop: 10 }}>ယနေ့ လေ့ကျင့်ရန်</h1>
          <p>
            လက်ရှိ {profile.currentLevel} ({levelInfo.my}) · ပန်းတိုင် C2 · တနေ့{' '}
            {profile.dailyMinutes} မိနစ် · Vocab due {vstats.due}
            <br />
            နေ့စဉ် pack: ပြီးဆုံး {daily.done}/{daily.totalSlots}
            {daily.isFresh ? ' · ယနေ့ plan အသစ် ရပါပြီ' : ''}
          </p>
        </div>
        <div className="flex wrap">
          <button className="btn ghost" type="button" onClick={refreshDaily}>
            Local pack ပြန်ဆွဲ
          </button>
          <button
            className="btn"
            type="button"
            disabled={aiBusy}
            onClick={() => void onAiDaily()}
          >
            {aiBusy ? 'AI…' : 'AI ဖြင့် ယနေ့ pack'}
          </button>
          {vstats.due > 0 && (
            <Link className="btn secondary" to="/vocab">
              Vocab {vstats.due}
            </Link>
          )}
          {summary.needsWeeklyTest && (
            <Link className="btn" to="/test?kind=weekly">
              တပတ်စစ်ဆေးမှု ရပြီ
            </Link>
          )}
        </div>
      </div>

      {aiMsg && (
        <div className="feedback" style={{ marginBottom: 14 }}>
          {aiMsg}
        </div>
      )}

      <div className="grid-2">
        <section className="panel">
          <h2>၂ နာရီ အစီအစဉ် (နေ့တိုင်း အလိုအလျောက် ပြောင်း)</h2>
          <p className="muted" style={{ marginBottom: 10 }}>
            Local bank သို့မဟုတ် AI key ဖြင့် နေ့စဉ် story + exercise အသစ်။ API key ကို
            AI Tutor → Settings တွင် ထည့်ပါ။
          </p>
          {plan.map((item) => (
            <div className="plan-item" key={`${item.skill}-${item.route}`}>
              <div>
                <strong>
                  {item.done ? '✅ ' : ''}
                  {planLabel(item)}
                </strong>
                <div className="muted">{item.titleMy}</div>
              </div>
              <div className="flex">
                <span className="chip">{item.minutes} မိနစ်</span>
                <Link
                  className={`btn ${item.done ? 'ghost' : 'secondary'}`}
                  to={item.route}
                >
                  {item.done ? 'ထပ်လုပ်' : 'စမည်'}
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>C2 အထိ ခန့်မှန်းကာလ</h2>
          <div className="stat" style={{ marginBottom: 14 }}>
            <div className="label">တနေ့ ၂ နာရီဖြင့်</div>
            <div className="value">{summary.etaTextMy}</div>
          </div>
          <p className="muted" style={{ marginBottom: 12 }}>
            ကျန်ရှိ ခန့်မှန်းနာရီ: ~{summary.eta.hoursLeft} နာရီ · ပျမ်းမျှ ကျွမ်းကျင်မှု{' '}
            {summary.avgMastery}%
          </p>
          <p style={{ marginBottom: 12 }}>{summary.trendMy}</p>
          <p className="muted">
            အားနည်းချက်:{' '}
            {summary.weakSkills
              .map((s) => SKILL_LABELS[s as Skill].my)
              .join('၊ ')}{' '}
            — ယနေ့ အစီအစဉ်တွင် ဦးစားပေးပြီးပါပြီ။
          </p>
          <div style={{ marginTop: 18 }}>
            <Link className="btn ghost" to="/progress">
              အသေးစိတ် ခွဲခြမ်းစိတ်ဖြာကြည့်ရန်
            </Link>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Skills လေ့ကျင့်</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Listening · Speaking · Pronunciation · Reading · Writing — တိုက်ရိုက် ဝင်ပါ
        </p>
        <div className="grid-5">
          {(Object.keys(SKILL_LABELS) as Skill[]).map((skill) => (
            <Link
              className="stat"
              key={skill}
              to={`/practice/${skill}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="label">
                {SKILL_LABELS[skill].icon} {SKILL_LABELS[skill].en}
              </div>
              <div className="value">{profile.skillMastery[skill]}%</div>
              <div className="bar" style={{ marginTop: 8 }}>
                <span style={{ width: `${profile.skillMastery[skill]}%` }} />
              </div>
              <div className="muted" style={{ marginTop: 8, fontSize: '0.85rem' }}>
                {SKILL_LABELS[skill].my} · စမည် →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>သင့်အဆင့် can-do</h2>
        <p>{levelInfo.canDo}</p>
        {summary.nextLevel && (
          <p className="muted" style={{ marginTop: 8 }}>
            နောက်အဆင့် {summary.nextLevel} ({LEVEL_LABELS[summary.nextLevel].my}) သို့
            တက်ရန် — အားနည်း skill နှင့် weekly test ကို ပုံမှန် လုပ်ပါ။
          </p>
        )}
      </section>
    </>
  )
}
