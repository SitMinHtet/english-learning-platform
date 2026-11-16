import { useEffect, useRef, useState } from 'react'
import { useProfile } from '../state/ProfileContext'
import {
  clearAuthSession,
  getAuthUser,
  isCloudSyncConfigured,
  isLoggedIn,
  loadGoogleScript,
  loginWithGoogleIdToken,
  googleClientId,
  type CloudUser,
} from '../lib/cloudSync'

type Variant = 'onboard' | 'dashboard' | 'chip'

type Props = {
  /** onboard = landing CTA; chip = top-right (guest + logged-in) */
  variant?: Variant
}

export function CloudAccount({ variant = 'chip' }: Props) {
  const { profile, applyCloudProfile, pushCloudNow, cloudStatus } = useProfile()
  const [user, setUser] = useState<CloudUser | null>(() => getAuthUser())
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const configured = isCloudSyncConfigured()

  useEffect(() => {
    setUser(getAuthUser())
  }, [cloudStatus])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const runGoogleButton = async () => {
    if (!btnRef.current || !window.google) return
    window.google.accounts.id.initialize({
      client_id: googleClientId(),
      callback: async (resp: { credential?: string }) => {
        if (!resp.credential) return
        setBusy(true)
        setMsg('Google ဝင်နေသည်…')
        try {
          await loginWithGoogleIdToken(resp.credential)
          setUser(getAuthUser())
          const res = await applyCloudProfile()
          setOpen(false)
          setMsg(
            res.ok
              ? res.action === 'pulled'
                ? 'Cloud → ဤ device'
                : 'ဤ device → Cloud'
              : res.error || 'မအောင်မြင်ပါ',
          )
        } catch (e) {
          setMsg(e instanceof Error ? e.message : 'Login မအောင်မြင်ပါ')
        } finally {
          setBusy(false)
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })
    btnRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: variant === 'chip' ? 260 : 280,
    })
  }

  useEffect(() => {
    if (!configured || isLoggedIn()) return
    // onboard banner always; chip guest panel when open
    if (variant === 'chip' && !open) return
    if (variant === 'dashboard') return // moved to chip only
    let cancelled = false
    ;(async () => {
      try {
        await loadGoogleScript()
        if (cancelled) return
        await runGoogleButton()
      } catch {
        if (!cancelled) setMsg('Google button မဖွင့်နိုင်ပါ')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, applyCloudProfile, user, variant, open])

  if (!configured) return null

  const logout = () => {
    clearAuthSession()
    setUser(null)
    setOpen(false)
    setMsg('Logout ပြီး — local ဆက်သုံးနိုင်သည်')
  }

  const syncNow = async () => {
    if (!profile) return
    setBusy(true)
    setMsg('Cloud သို့ သိမ်းနေသည်…')
    const res = await pushCloudNow()
    setBusy(false)
    setMsg(res.ok ? 'Cloud sync ပြီးပါပြီ' : res.error || 'မရပါ')
  }

  // ——— Top-right: logged in ———
  if (variant === 'chip' && user) {
    const statusLine = msg || cloudStatus || 'Cloud ချိတ်ပြီး'
    return (
      <div className="cloud-chip-wrap" ref={menuRef}>
        <button
          type="button"
          className="cloud-chip"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {user.picture ? (
            <img src={user.picture} alt="" className="cloud-chip__avatar" />
          ) : (
            <span className="cloud-chip__avatar cloud-chip__avatar--ph" />
          )}
          <span className="cloud-chip__text">
            <span className="cloud-chip__name">{user.name || 'Account'}</span>
            <span className="cloud-chip__status">{statusLine}</span>
          </span>
          <span className="cloud-chip__caret" aria-hidden>
            ▾
          </span>
        </button>
        {open && (
          <div className="cloud-chip__menu">
            <div className="cloud-chip__email">{user.email}</div>
            <button
              type="button"
              className="cloud-chip__item"
              disabled={busy}
              onClick={() => void syncNow()}
            >
              Sync ယခု
            </button>
            <button type="button" className="cloud-chip__item" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    )
  }

  // ——— Top-right: guest save CTA ———
  if (variant === 'chip' && !user) {
    return (
      <div className="cloud-chip-wrap" ref={menuRef}>
        <button
          type="button"
          className="cloud-chip cloud-chip--guest"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="cloud-chip__badge">Cloud</span>
          <span className="cloud-chip__text">
            <span className="cloud-chip__name">Progress သိမ်းမလား?</span>
            <span className="cloud-chip__hint">Guest OK · နောက်မှ ဝင်လို့ရ</span>
          </span>
          <span className="cloud-chip__caret" aria-hidden>
            ▾
          </span>
        </button>
        {open && (
          <div className="cloud-chip__menu cloud-chip__menu--guest">
            <p className="cloud-chip__blurb">
              အခု Guest အဖြစ် သုံးနေနိုင်သည်။ ဖုန်းပြောင်းရင် မပျောက်အောင် Google ဝင်ပြီး
              cloud သိမ်းပါ။
            </p>
            <div className="cloud-chip__google" ref={btnRef} />
            {(msg || busy) && (
              <p className="cloud-chip__msg">{busy ? 'ခဏစောင့်ပါ…' : msg}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // ——— Onboarding full banner only ———
  if (variant === 'onboard' && !user) {
    return (
      <aside className="cloud-banner cloud-banner--return">
        <div className="cloud-banner__eyebrow">Returning user</div>
        <h2 className="cloud-banner__title">အရင်က သုံးဖူးပါသလား?</h2>
        <p className="cloud-banner__text">
          ဖုန်း/PC အခြားတစ်ခုမှာ သုံးခဲ့ရင် Google ဖြင့် ဝင်ပါ။ Level၊ vocab၊ streak
          ပြန်ပေါ်မယ်။ မဝင်ဘဲ အသစ်စလည်း ရသည်။
        </p>
        <div className="cloud-banner__google" ref={btnRef} />
        {(msg || busy) && (
          <p className="cloud-banner__status">{busy ? 'ခဏစောင့်ပါ…' : msg}</p>
        )}
      </aside>
    )
  }

  return null
}
