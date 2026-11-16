/** Public soft-launch: browser talks to our proxy, never holds the owner key. */

export type AiKind = 'tutor' | 'lookup' | 'daily' | 'weekly'

/** Default ON for public launch. Set VITE_AI_PROXY=0 to disable. */
export function isAiProxyEnabled(): boolean {
  return import.meta.env.VITE_AI_PROXY !== '0'
}

/** Absolute URL or same-origin path (dev Vite proxies /api → :8787) */
export function aiProxyBase(): string {
  const raw = (import.meta.env.VITE_AI_PROXY_URL as string | undefined)?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return '/api/ai'
}

/** Must match server PROXY_APP_TOKEN when that env is set */
export function proxyAppToken(): string {
  return (import.meta.env.VITE_PROXY_APP_TOKEN as string | undefined)?.trim() || ''
}

const ACCESS_KEY = 'path-to-c2-access-code'
const CLIENT_KEY = 'path-to-c2-client-id'

export function getAccessCode(): string {
  try {
    return sessionStorage.getItem(ACCESS_KEY) ?? localStorage.getItem(ACCESS_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAccessCode(code: string, remember: boolean) {
  const v = code.trim()
  try {
    sessionStorage.setItem(ACCESS_KEY, v)
    if (remember) localStorage.setItem(ACCESS_KEY, v)
    else localStorage.removeItem(ACCESS_KEY)
  } catch {
    /* ignore */
  }
}

export function clearAccessCode() {
  try {
    sessionStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(ACCESS_KEY)
  } catch {
    /* ignore */
  }
}

export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(CLIENT_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}
