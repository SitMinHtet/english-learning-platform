import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  clearAccessCode,
  getAccessCode,
  isAiProxyEnabled,
  setAccessCode,
} from '../lib/aiConfig'
import { checkProxyHealth } from '../lib/aiClient'

/**
 * Invite gate when server has SOFT_LAUNCH_CODE.
 * Skipped if proxy disabled or server does not require a code.
 */
export function SoftLaunchGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'boot' | 'gate' | 'open'>(
    isAiProxyEnabled() ? 'boot' : 'open',
  )
  const [checking, setChecking] = useState(false)
  const [code, setCode] = useState(() => getAccessCode())
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAiProxyEnabled()) {
      setPhase('open')
      return
    }
    let cancelled = false
    ;(async () => {
      const health = await checkProxyHealth()
      if (cancelled) return
      if (health.ok) {
        setPhase('open')
        return
      }
      if (health.softLaunch) {
        setPhase('gate')
        if (health.error) setError(health.error)
        return
      }
      // Proxy down or no key — still open app (local exercises work)
      setPhase('open')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setAccessCode(code, remember)
    setChecking(true)
    const health = await checkProxyHealth()
    setChecking(false)
    if (health.ok) {
      setPhase('open')
      return
    }
    clearAccessCode()
    setError(health.error || 'Access code မမှန်ပါ')
  }

  if (phase === 'boot') {
    return (
      <div className="hero-onboard">
        <p className="muted">ဖွင့်နေသည်…</p>
      </div>
    )
  }

  if (phase === 'open') return <>{children}</>

  return (
    <div className="hero-onboard">
      <div className="panel" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="chip">Soft launch</div>
        <h1 style={{ marginTop: 12 }}>Path to C2</h1>
        <p className="muted" style={{ marginBottom: 16 }}>
          Early access — invite code ထည့်ပါ။ Study / level / progress က ဤ device မှာပဲ
          သိမ်းသည်။
        </p>
        <form onSubmit={(e) => void submit(e)}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--line)',
              marginBottom: 10,
            }}
            autoFocus
          />
          <label className="flex" style={{ gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            ဤ device မှာ မှတ်ထားမည်
          </label>
          {error && (
            <p className="muted" style={{ color: 'crimson', marginBottom: 10 }}>
              {error}
            </p>
          )}
          <button className="btn" type="submit" disabled={checking || !code.trim()}>
            {checking ? 'စစ်နေသည်…' : 'ဝင်မည်'}
          </button>
        </form>
      </div>
    </div>
  )
}
