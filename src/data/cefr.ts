import type { CEFRLevel, SkillScores } from '../types'

export const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const LEVEL_ORDER: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
}

/** Estimated hours from each level to C2 at focused study (research-backed ranges) */
export const HOURS_TO_C2: Record<CEFRLevel, number> = {
  A1: 1000,
  A2: 800,
  B1: 600,
  B2: 400,
  C1: 200,
  C2: 0,
}

export const HOURS_BETWEEN: Record<CEFRLevel, number> = {
  A1: 100, // A1→A2 ~90–100h
  A2: 180, // A2→B1
  B1: 200, // B1→B2
  B2: 220, // B2→C1
  C1: 300, // C1→C2
  C2: 0,
}

export const LEVEL_LABELS: Record<
  CEFRLevel,
  { en: string; my: string; canDo: string }
> = {
  A1: {
    en: 'Beginner',
    my: 'အစပိုင်း',
    canDo: 'ရိုးရှင်းသော စကားလုံး/စာကြောင်းများကို နားလည်၊ ပြော၊ ရေးနိုင်သည်။',
  },
  A2: {
    en: 'Elementary',
    my: 'အခြေခံ',
    canDo: 'နေ့စဉ် အခြေခံ ခေါင်းစဉ်များ (မိသားစု၊ ဈေးဝယ်၊ အလုပ်) ကို ဆက်သွယ်နိုင်သည်။',
  },
  B1: {
    en: 'Intermediate',
    my: 'အလယ်အလတ်',
    canDo: 'ခရီးသွား၊ အလုပ်၊ ပညာရေး အခြေအနေများတွင် အဓိက အချက်များကို နားလည်/ဖော်ပြနိုင်သည်။',
  },
  B2: {
    en: 'Upper Intermediate',
    my: 'အလယ်အလတ် အထက်',
    canDo: 'ရှုပ်ထွေးသော စာသားများကို နားလည်ပြီး အကြောင်းအရာကို အသေးစိတ် ဆွေးနွေးနိုင်သည်။',
  },
  C1: {
    en: 'Advanced',
    my: 'အဆင့်မြင့်',
    canDo: 'ရှည်လျား/နည်းပညာဆိုင်ရာ စာသားများကို နားလည်ပြီး ချောမွေ့စွာ ဖော်ပြနိုင်သည်။',
  },
  C2: {
    en: 'Mastery',
    my: 'ကျွမ်းကျင်မှု အမြင့်ဆုံး',
    canDo: 'နီးပါး ဇာတိစကားပြောသူအဆင့် — သိမ်မွေ့သော အဓိပ္ပာယ်ကွဲများကို နားလည်/အသုံးပြုနိုင်သည်။',
  },
}

export const SKILL_LABELS: Record<
  keyof SkillScores,
  { en: string; my: string; icon: string }
> = {
  listening: { en: 'Listening', my: 'နားထောင်ခြင်း', icon: '🎧' },
  speaking: { en: 'Speaking', my: 'ပြောဆိုခြင်း', icon: '🗣️' },
  reading: { en: 'Reading', my: 'ဖတ်ခြင်း', icon: '📖' },
  writing: { en: 'Writing', my: 'ရေးသားခြင်း', icon: '✍️' },
  pronunciation: { en: 'Pronunciation', my: 'အသံထွက်', icon: '🔊' },
}

/** Absolute % → CEFR (placement-style diagnostics only — not for weekly). */
export function levelFromScore(percent: number): CEFRLevel {
  if (percent >= 92) return 'C2'
  if (percent >= 80) return 'C1'
  if (percent >= 68) return 'B2'
  if (percent >= 52) return 'B1'
  if (percent >= 35) return 'A2'
  return 'A1'
}

/**
 * Weekly tests are written at the learner's current band (±1).
 * Remapping raw % onto the full CEFR scale incorrectly dumps strong learners to A1.
 * Adjust at most one level up/down from current.
 */
export function adjustLevelByWeeklyScore(
  current: CEFRLevel,
  percent: number,
): CEFRLevel {
  const i = LEVELS.indexOf(current)
  if (i < 0) return current
  if (percent >= 75) return LEVELS[Math.min(i + 1, LEVELS.length - 1)]!
  if (percent <= 45) return LEVELS[Math.max(i - 1, 0)]!
  return current
}

export function nextLevel(level: CEFRLevel): CEFRLevel | null {
  const i = LEVELS.indexOf(level)
  return i < LEVELS.length - 1 ? LEVELS[i + 1] : null
}

/** Practice band: current ± maxDist (e.g. B1 → A2, B1, B2) */
export function levelsNear(level: CEFRLevel, maxDist = 1): CEFRLevel[] {
  const order = LEVEL_ORDER[level]
  return LEVELS.filter((l) => Math.abs(LEVEL_ORDER[l] - order) <= maxDist)
}

export function isLevelNear(
  itemLevel: CEFRLevel,
  current: CEFRLevel,
  maxDist = 1,
): boolean {
  return Math.abs(LEVEL_ORDER[itemLevel] - LEVEL_ORDER[current]) <= maxDist
}

export function emptySkillScores(v = 0): SkillScores {
  return {
    listening: v,
    speaking: v,
    reading: v,
    writing: v,
    pronunciation: v,
  }
}

export function estimateDaysToC2(
  level: CEFRLevel,
  dailyMinutes: number,
  masteryBonus = 0,
): { days: number; weeks: number; months: number; hoursLeft: number } {
  const hoursLeft = Math.max(0, HOURS_TO_C2[level] * (1 - masteryBonus * 0.15))
  const hoursPerDay = Math.max(0.5, dailyMinutes / 60)
  const days = Math.ceil(hoursLeft / hoursPerDay)
  return {
    days,
    weeks: Math.ceil(days / 7),
    months: Math.round((days / 30) * 10) / 10,
    hoursLeft: Math.round(hoursLeft),
  }
}

export function formatEtaMy(days: number, months: number): string {
  if (days <= 0) return 'ပန်းတိုင် C2 သို့ ရောက်ပြီးပါပြီ!'
  if (months < 1) return `ခန့်မှန်း ${days} ရက် (၁ လ အောက်)`
  if (months < 12) return `ခန့်မှန်း ${months} လ (${days} ရက်)`
  const y = Math.floor(months / 12)
  const m = Math.round(months % 12)
  return `ခန့်မှန်း ${y} နှစ် ${m > 0 ? m + ' လ' : ''} (${days} ရက်)`
}
