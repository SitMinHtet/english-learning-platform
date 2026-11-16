import type { UserProfile } from '../types'
import { normalizeProfile } from './storage'
import { aiProxyBase } from './aiConfig'

const TOKEN_KEY = 'path-to-c2-auth-token'
const USER_KEY = 'path-to-c2-auth-user'

export type CloudUser = {
  sub: string
  email: string
  name: string
  picture: string
}

function apiRoot(): string {
  // /api/ai → /api
  const base = aiProxyBase().replace(/\/ai\/?$/, '')
  return base || '/api'
}

export function isCloudSyncConfigured(): boolean {
  return !!(import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
}

export function googleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || ''
}

export function getAuthToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function getAuthUser(): CloudUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CloudUser
  } catch {
    return null
  }
}

export function setAuthSession(token: string, user: CloudUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAuthToken() && !!getAuthUser()
}

/** Strip secrets before upload */
export function profileForCloud(profile: UserProfile): UserProfile {
  return normalizeProfile({
    ...profile,
    tutorSettings: {
      ...profile.tutorSettings,
      apiKey: '',
    },
  })
}

export async function loginWithGoogleIdToken(idToken: string): Promise<{
  token: string
  user: CloudUser
  hasCloudProfile: boolean
  cloudUpdatedAt: string | null
}> {
  const res = await fetch(`${apiRoot()}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  const data = (await res.json()) as {
    error?: string
    token?: string
    user?: CloudUser
    hasCloudProfile?: boolean
    cloudUpdatedAt?: string | null
  }
  if (!res.ok || !data.token || !data.user) {
    throw new Error(data.error || 'Google login မအောင်မြင်ပါ')
  }
  setAuthSession(data.token, data.user)
  return {
    token: data.token,
    user: data.user,
    hasCloudProfile: !!data.hasCloudProfile,
    cloudUpdatedAt: data.cloudUpdatedAt ?? null,
  }
}

export async function fetchCloudProfile(): Promise<{
  profile: UserProfile
  updatedAt: string
  user: CloudUser
} | null> {
  const token = getAuthToken()
  if (!token) return null
  const res = await fetch(`${apiRoot()}/me/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 404) return null
  const data = (await res.json()) as {
    error?: string
    profile?: UserProfile
    updatedAt?: string
    user?: CloudUser
  }
  if (!res.ok || !data.profile) {
    if (res.status === 401) clearAuthSession()
    throw new Error(data.error || 'Cloud profile ဆွဲမရပါ')
  }
  return {
    profile: normalizeProfile(data.profile),
    updatedAt: data.updatedAt || data.profile.updatedAt,
    user: data.user || getAuthUser()!,
  }
}

export async function pushCloudProfile(profile: UserProfile): Promise<string> {
  const token = getAuthToken()
  if (!token) throw new Error('Login လိုသည်')
  const res = await fetch(`${apiRoot()}/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile: profileForCloud(profile) }),
  })
  const data = (await res.json()) as { error?: string; updatedAt?: string }
  if (!res.ok) {
    if (res.status === 401) clearAuthSession()
    throw new Error(data.error || 'Cloud သို့ မသိမ်းနိုင်ပါ')
  }
  return data.updatedAt || new Date().toISOString()
}

/**
 * After Google login: pull if cloud newer/empty local; else push local.
 */
export async function reconcileAfterLogin(
  local: UserProfile | null,
): Promise<{ profile: UserProfile; action: 'pulled' | 'pushed' | 'kept' }> {
  const cloud = await fetchCloudProfile()
  if (!local && cloud) {
    return { profile: cloud.profile, action: 'pulled' }
  }
  if (local && !cloud) {
    await pushCloudProfile(local)
    return { profile: local, action: 'pushed' }
  }
  if (local && cloud) {
    const localT = new Date(local.updatedAt || 0).getTime()
    const cloudT = new Date(cloud.updatedAt || 0).getTime()
    if (cloudT > localT) {
      return { profile: cloud.profile, action: 'pulled' }
    }
    await pushCloudProfile(local)
    return { profile: local, action: 'pushed' }
  }
  // both empty — caller should keep onboarding
  throw new Error('No profile to sync')
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

let gisLoading: Promise<void> | null = null

export function loadGoogleScript(): Promise<void> {
  if (!isCloudSyncConfigured()) return Promise.reject(new Error('No client id'))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (gisLoading) return gisLoading
  gisLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Google script load failed'))
    document.head.appendChild(s)
  })
  return gisLoading
}
