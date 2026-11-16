import type { BackupPayload, TutorSettings, UserProfile } from '../types'
import { emptySkillScores } from '../data/cefr'
import { localDayKey, localYesterdayKey } from './dateKey'

const KEY = 'path-to-c2-profile-v1'
const BACKUP_KEY = 'path-to-c2-profile-backup-v1'
const IDB_NAME = 'path-to-c2'
const IDB_STORE = 'profile'

export const defaultTutorSettings = (): TutorSettings => ({
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  // Public soft-launch: AI via owner proxy (no user key)
  useCloud: true,
  useAiDaily: true,
})

export function defaultProfile(name = 'Learner'): UserProfile {
  const now = new Date().toISOString()
  return {
    name,
    createdAt: now,
    updatedAt: now,
    currentLevel: 'A1',
    targetLevel: 'C2',
    dailyMinutes: 120,
    placementDone: false,
    usedQuestionIds: [],
    attempts: [],
    levelTests: [],
    skillMastery: emptySkillScores(10),
    streak: 0,
    lastStudyDate: null,
    totalMinutes: 0,
    errorJournal: [],
    writingHistory: [],
    completedLessonIds: [],
    speakingBest: {},
    vocabCards: [],
    tutorChat: [],
    tutorSettings: defaultTutorSettings(),
    readStoryIds: [],
    dailyPlanDate: null,
    dailyStoryId: null,
    dailyQuestionIds: {},
    dailyCompleted: [],
    dailyAiPack: null,
    weeklyAiPack: null,
    customVocab: [],
    savedWords: [],
  }
}

/** Fill missing fields when loading older saves */
export function normalizeProfile(raw: Partial<UserProfile> & { name?: string }): UserProfile {
  const base = defaultProfile(raw.name ?? 'Learner')
  return {
    ...base,
    ...raw,
    name: raw.name ?? base.name,
    createdAt: raw.createdAt ?? base.createdAt,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    skillMastery: { ...base.skillMastery, ...raw.skillMastery },
    speakingBest: { ...base.speakingBest, ...raw.speakingBest },
    usedQuestionIds: raw.usedQuestionIds ?? [],
    attempts: raw.attempts ?? [],
    levelTests: raw.levelTests ?? [],
    errorJournal: raw.errorJournal ?? [],
    writingHistory: raw.writingHistory ?? [],
    completedLessonIds: raw.completedLessonIds ?? [],
    vocabCards: (() => {
      if (Array.isArray(raw.vocabCards)) return raw.vocabCards
      const nested = raw.vocabCards as unknown as { cards?: UserProfile['vocabCards'] } | null
      if (nested && Array.isArray(nested.cards)) return nested.cards
      return []
    })(),
    tutorChat: Array.isArray(raw.tutorChat) ? raw.tutorChat : [],
    tutorSettings: (() => {
      const ts = {
        ...defaultTutorSettings(),
        ...raw.tutorSettings,
      }
      // Soft-launch: no personal key → use owner proxy (cloud + daily on)
      if (!ts.apiKey?.trim()) {
        ts.useCloud = true
        ts.useAiDaily = true
      }
      return ts
    })(),
    readStoryIds: Array.isArray(raw.readStoryIds) ? raw.readStoryIds : [],
    dailyPlanDate: raw.dailyPlanDate ?? null,
    dailyStoryId: raw.dailyStoryId ?? null,
    dailyQuestionIds: raw.dailyQuestionIds ?? {},
    dailyCompleted: Array.isArray(raw.dailyCompleted) ? raw.dailyCompleted : [],
    dailyAiPack: (() => {
      const pack = raw.dailyAiPack
      if (!pack) return null
      const stories =
        Array.isArray(pack.stories) && pack.stories.length
          ? pack.stories
          : pack.story
            ? [pack.story]
            : []
      return {
        ...pack,
        stories,
        story: pack.story ?? stories[0] ?? null,
        vocab: Array.isArray(pack.vocab) ? pack.vocab : [],
      }
    })(),
    weeklyAiPack: raw.weeklyAiPack ?? null,
    customVocab: Array.isArray(raw.customVocab) ? raw.customVocab : [],
    savedWords: Array.isArray(raw.savedWords) ? raw.savedWords : [],
  }
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    return normalizeProfile(JSON.parse(raw) as UserProfile)
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): UserProfile {
  const next = {
    ...profile,
    updatedAt: new Date().toISOString(),
  }
  const json = JSON.stringify(next)
  try {
    localStorage.setItem(KEY, json)
    localStorage.setItem(BACKUP_KEY, json)
  } catch {
    // Quota / private mode — still mirror to IDB
  }
  void mirrorToIndexedDB(next)
  return next
}

export function clearProfile(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem(BACKUP_KEY)
  void clearIndexedDB()
}

export function exportBackup(profile: UserProfile): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'path-to-c2',
    profile: normalizeProfile(profile),
  }
}

export function downloadBackup(profile: UserProfile): void {
  const payload = exportBackup(profile)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const day = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `path-to-c2-backup-${day}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): UserProfile {
  const data = JSON.parse(text) as BackupPayload | UserProfile
  if ('profile' in data && data.app === 'path-to-c2') {
    return normalizeProfile(data.profile)
  }
  return normalizeProfile(data as UserProfile)
}

/** Local calendar day — same as daily pack keys (not UTC) */
export function todayKey(): string {
  return localDayKey()
}

export function bumpStreak(profile: UserProfile): UserProfile {
  const today = todayKey()
  if (profile.lastStudyDate === today) return profile
  const yKey = localYesterdayKey()
  const streak = profile.lastStudyDate === yKey ? profile.streak + 1 : 1
  return { ...profile, streak, lastStudyDate: today }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function mirrorToIndexedDB(profile: UserProfile): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(profile, 'main')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // IndexedDB optional — localStorage is primary
  }
}

export async function loadFromIndexedDB(): Promise<UserProfile | null> {
  try {
    const db = await openDb()
    const profile = await new Promise<UserProfile | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get('main')
      req.onsuccess = () =>
        resolve(req.result ? normalizeProfile(req.result as UserProfile) : null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return profile
  } catch {
    return null
  }
}

async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete('main')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    /* ignore */
  }
}

/** Recover if localStorage empty but IndexedDB has data */
export async function recoverProfile(): Promise<UserProfile | null> {
  const local = loadProfile()
  if (local) return local
  const idb = await loadFromIndexedDB()
  if (idb) {
    saveProfile(idb)
    return idb
  }
  return null
}
