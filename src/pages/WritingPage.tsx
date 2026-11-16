import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { WRITING_PROMPTS } from '../data/writingPrompts'
import { checkWriting } from '../lib/writingChecker'
import { getDailyQuestions } from '../lib/dailyPlan'
import { QuizPlayer } from '../components/QuizPlayer'
import { useProfile } from '../state/ProfileContext'
import { isLevelNear } from '../data/cefr'
import type { WritingFeedback } from '../types'

export function WritingPage() {
  const { profile, saveWriting, markDailyDone } = useProfile()
  const [params] = useSearchParams()
  const isDaily = params.get('daily') === '1'
  const [promptId, setPromptId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null)
  const [mode, setMode] = useState<'essay' | 'mcq'>(isDaily ? 'mcq' : 'essay')

  const prompts = useMemo(() => {
    if (!profile) return []
    return WRITING_PROMPTS.filter((p) =>
      isLevelNear(p.level, profile.currentLevel, 1),
    )
  }, [profile])

  const dailyMcq = useMemo(() => {
    if (!profile) return []
    return getDailyQuestions(profile, 'writing')
  }, [profile])

  const prompt = prompts.find((p) => p.id === promptId) ?? prompts[0]

  if (!profile) return null

  const submit = () => {
    if (!prompt) return
    const fb = checkWriting(text, prompt.minWords)
    setFeedback(fb)
    saveWriting(prompt.id, text, fb)
    markDailyDone('writing')
  }

  const finishMcq = () => {
    markDailyDone('writing')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">✍️ Writing · ဆရာ စစ်ဆေး</div>
          <h1 style={{ marginTop: 10 }}>ရေးပြီး ပြင်ပေးမည်</h1>
          <p>
            သင့်စာကို သဒ္ဒါ/စတိုင် စစ်ပြီး အမှားတိုင်း မြန်မာလို ရှင်းပြပေးသည်။{' '}
            {profile.currentLevel} prompts။
          </p>
        </div>
        <Link className="btn ghost" to="/">
          Dashboard
        </Link>
      </div>

      {dailyMcq.length > 0 && (
        <div className="flex wrap" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={mode === 'mcq' ? 'btn' : 'btn secondary'}
            onClick={() => setMode('mcq')}
          >
            ယနေ့ Writing MCQ ({dailyMcq.length})
          </button>
          <button
            type="button"
            className={mode === 'essay' ? 'btn' : 'btn secondary'}
            onClick={() => setMode('essay')}
          >
            Free writing
          </button>
        </div>
      )}

      {mode === 'mcq' && dailyMcq.length > 0 ? (
        <QuizPlayer
          key={dailyMcq[0]?.id}
          questions={dailyMcq}
          title="ယနေ့ Writing MCQ"
          onComplete={finishMcq}
        />
      ) : (
        <div className="grid-2">
          <section className="panel">
            <label className="muted">ခေါင်းစဉ် ရွေးပါ</label>
            <select
              style={{
                width: '100%',
                marginTop: 8,
                marginBottom: 14,
                padding: 12,
                borderRadius: 12,
                border: '1px solid var(--line)',
              }}
              value={prompt?.id}
              onChange={(e) => {
                setPromptId(e.target.value)
                setFeedback(null)
                setText('')
              }}
            >
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titleMy} — {p.title}
                </option>
              ))}
            </select>

            {prompt && (
              <>
                <h2>{prompt.title}</h2>
                <p style={{ margin: '8px 0 12px' }}>{prompt.prompt}</p>
                <p className="muted">အနည်းဆုံး {prompt.minWords} လုံး</p>
                <ul style={{ margin: '12px 0', paddingLeft: 18 }}>
                  {prompt.rubricMy.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <textarea
                  className="editor"
                  placeholder="ဤနေရာတွင် အင်္ဂလိပ်လို ရေးပါ..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex" style={{ marginTop: 12 }}>
                  <span className="muted">
                    {text.trim().split(/\s+/).filter(Boolean).length} လုံး
                  </span>
                  <div className="spacer" />
                  <button
                    className="btn"
                    disabled={text.trim().length < 10}
                    onClick={submit}
                  >
                    ဆရာ့ထံ ပို့မည်
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="panel">
            <h2>ဆရာ့ တုံ့ပြန်ချက်</h2>
            {!feedback ? (
              <p className="muted">စာရေးပြီး ပို့လိုက်ရင် ဤနေရာတွင် ပြင်ချက်များ ပေါ်မည်။</p>
            ) : (
              <>
                <div className="flex" style={{ marginBottom: 12 }}>
                  <div
                    className="score-ring"
                    style={{ ['--p' as string]: feedback.score }}
                  >
                    <span>{feedback.score}</span>
                  </div>
                  <p>{feedback.overallMy}</p>
                </div>

                <h3 style={{ fontSize: '0.95rem', marginTop: 8 }}>အားသာချက်</h3>
                <ul style={{ paddingLeft: 18 }}>
                  {feedback.strengthsMy.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>

                <h3 style={{ fontSize: '0.95rem', marginTop: 14 }}>ပြင်ရန်</h3>
                {feedback.issues.length === 0 && (
                  <p className="muted">အဓိက အမှား မတွေ့ပါ။</p>
                )}
                {feedback.issues.map((issue, i) => (
                  <div key={i} className={`issue ${issue.severity}`}>
                    <div>
                      <strong>{issue.original}</strong>
                      {issue.suggestion && (
                        <>
                          {' '}
                          → <em>{issue.suggestion}</em>
                        </>
                      )}
                    </div>
                    <p style={{ marginTop: 6 }}>{issue.reasonMy}</p>
                  </div>
                ))}

                <h3 style={{ fontSize: '0.95rem', marginTop: 14 }}>နောက်တစ်ဆင့်</h3>
                <ul style={{ paddingLeft: 18 }}>
                  {feedback.nextStepsMy.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}
