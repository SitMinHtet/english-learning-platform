import { lessonsForLevel } from '../data/lessons'
import { estimateDaysToC2, formatEtaMy, nextLevel } from '../data/cefr'
import { getStory, pickDailyStory } from '../data/stories'
import type { Story } from '../data/stories'
import { QUESTIONS } from '../data/questions'
import { isLevelNear, LEVEL_ORDER, levelsNear } from '../data/cefr'
import { averageMastery } from './testEngine'
import { formatDayMy, localDayIndex, localDayKey } from './dateKey'
import type {
  CEFRLevel,
  DailyPlanItem,
  Question,
  Skill,
  UserProfile,
} from '../types'

const ROTATION: Skill[] = [
  'listening',
  'speaking',
  'pronunciation',
  'reading',
  'writing',
]

/** Local fallback session size; AI packs use 20–30 per skill */
const SESSION_SIZE = 24

function pickDailyQuestions(
  skill: Skill,
  level: CEFRLevel,
  dayIndex: number,
  usedIds: string[],
): string[] {
  const order = LEVEL_ORDER[level]
  const band = new Set(levelsNear(level, 1))
  // Strict ±1 only (e.g. B1 → A2/B1/B2) — never spill to A1 or C1+
  const pool = QUESTIONS.filter(
    (q) => q.skill === skill && band.has(q.level),
  ).sort((a, b) => {
    const da = Math.abs(LEVEL_ORDER[a.level] - order)
    const db = Math.abs(LEVEL_ORDER[b.level] - order)
    if (da !== db) return da - db
    return a.id.localeCompare(b.id)
  })

  if (pool.length === 0) return []

  // Rotate start offset by day so the set changes every day
  const start = Math.abs(dayIndex * 7 + skill.length) % pool.length
  const rotated = [...pool.slice(start), ...pool.slice(0, start)]

  // Prefer not-yet-used, but still fill to SESSION_SIZE within band
  const unused = rotated.filter((q) => !usedIds.includes(q.id))
  const source = unused.length >= Math.min(SESSION_SIZE, rotated.length)
    ? unused
    : rotated

  const ids: string[] = []
  const seen = new Set<string>()
  for (const q of source) {
    if (seen.has(q.id)) continue
    seen.add(q.id)
    ids.push(q.id)
    if (ids.length >= SESSION_SIZE) break
  }
  return ids
}

function inBandQuestion(q: Question | undefined, level: CEFRLevel): q is Question {
  return !!q && isLevelNear(q.level, level, 1)
}

/** Build / refresh today's locked daily pack when the calendar day changes */
export function refreshDailyPackIfNeeded(profile: UserProfile): UserProfile {
  const today = localDayKey()
  const sameDay = profile.dailyPlanDate === today
  const dayIndex = localDayIndex()
  const story = pickDailyStory(profile, dayIndex)
  const qMap = new Map(QUESTIONS.map((q) => [q.id, q]))
  const dailyQuestionIds: Partial<Record<Skill, string[]>> = {
    ...(sameDay ? profile.dailyQuestionIds : {}),
  }

  let questionsChanged = false
  for (const skill of ROTATION) {
    const existing = dailyQuestionIds[skill] ?? []
    const inBand = existing.filter((id) =>
      inBandQuestion(qMap.get(id), profile.currentLevel),
    )
    // Rebuild if empty, short, or previous pack leaked outside ±1
    if (
      inBand.length >= Math.min(8, SESSION_SIZE) &&
      inBand.length === existing.length
    ) {
      dailyQuestionIds[skill] = inBand
      continue
    }
    dailyQuestionIds[skill] = pickDailyQuestions(
      skill,
      profile.currentLevel,
      dayIndex,
      profile.usedQuestionIds,
    )
    questionsChanged = true
  }

  const hasQuestions = ROTATION.some(
    (s) => (dailyQuestionIds[s]?.length ?? 0) > 0,
  )

  if (
    sameDay &&
    profile.dailyStoryId &&
    hasQuestions &&
    !questionsChanged
  ) {
    return profile
  }

  // Keep AI pack only if it belongs to today; otherwise clear
  const dailyAiPack =
    profile.dailyAiPack?.date === today ? profile.dailyAiPack : null

  return {
    ...profile,
    dailyPlanDate: today,
    dailyStoryId:
      profile.dailyStoryId && sameDay
        ? profile.dailyStoryId
        : (dailyAiPack?.story?.id ?? story?.id ?? null),
    dailyQuestionIds,
    // Only wipe completions when the calendar day actually changes
    dailyCompleted: sameDay ? profile.dailyCompleted : [],
    dailyAiPack,
  }
}

export function buildDailyPlan(profile: UserProfile): DailyPlanItem[] {
  const minutes = profile.dailyMinutes
  const dayIndex = localDayIndex()
  const weights: Record<Skill, number> = {
    listening: 0.22,
    speaking: 0.2,
    pronunciation: 0.15,
    reading: 0.22,
    writing: 0.21,
  }

  const mastery = profile.skillMastery
  const sorted = [...ROTATION].sort((a, b) => mastery[a] - mastery[b])
  const weak = sorted.slice(0, 2)
  const focusOrder = [
    ...weak,
    ...ROTATION.filter((s) => !weak.includes(s)),
  ]
  const rotated = [
    ...focusOrder.slice(dayIndex % focusOrder.length),
    ...focusOrder.slice(0, dayIndex % focusOrder.length),
  ]

  const lessons = lessonsForLevel(profile.currentLevel)
  const items: DailyPlanItem[] = []

  for (const skill of rotated) {
    const mins = Math.round(minutes * weights[skill])
    const skillLessons = lessons.filter((l) => l.skill === skill)
    // Rotate lesson by day — not stuck on the same one
    const lesson =
      skillLessons.length > 0
        ? skillLessons[dayIndex % skillLessons.length]
        : undefined

    const routes: Record<Skill, string> = {
      listening: '/practice/listening',
      speaking: '/practice/speaking',
      pronunciation: '/practice/pronunciation',
      reading: '/practice/reading',
      writing: '/practice/writing',
    }

    const day = profile.dailyPlanDate ?? localDayKey()
    const route = `${routes[skill]}?daily=1&day=${day}`

    items.push({
      skill,
      title: lesson?.title ?? skill,
      titleMy: lesson
        ? `ယနေ့ · ${lesson.titleMy}`
        : `ယနေ့ · ${skill}`,
      minutes: Math.max(10, mins),
      lessonId: lesson?.id,
      route,
      done: profile.dailyCompleted.includes(skill),
    })
  }

  const vocabMins = Math.max(12, Math.round(minutes * 0.1))
  const libraryMins = Math.max(15, Math.round(minutes * 0.15))
  const tutorMins = Math.max(8, Math.round(minutes * 0.08))
  const skillBudget = minutes - vocabMins - libraryMins - tutorMins
  const skillSum = items.reduce((a, b) => a + b.minutes, 0)
  if (skillSum > 0) {
    for (const item of items) {
      item.minutes = Math.max(
        8,
        Math.round((item.minutes / skillSum) * skillBudget),
      )
    }
  }

  const lockedStory = resolveDailyStory(profile, dayIndex)

  items.push({
    skill: 'library',
    title: lockedStory?.title ?? 'Story reading',
    titleMy: lockedStory
      ? `ယနေ့စာ · ${lockedStory.level} · ${lockedStory.titleMy}`
      : 'စာအုပ် / Story ဖတ်ခြင်း',
    minutes: libraryMins,
    route: lockedStory
      ? `/library?daily=1&level=${profile.currentLevel}&id=${lockedStory.id}`
      : `/library?level=${profile.currentLevel}&daily=1`,
    done: profile.dailyCompleted.includes('library'),
  })
  items.push({
    skill: 'vocab',
    title: 'Vocab SRS',
    titleMy: 'ယနေ့ · စကားလုံး SRS',
    minutes: vocabMins,
    route: '/vocab?daily=1',
    done: profile.dailyCompleted.includes('vocab'),
  })
  items.push({
    skill: 'tutor',
    title: 'AI Tutor',
    titleMy: 'ယနေ့ · AI ဆရာ',
    minutes: tutorMins,
    route: '/tutor',
    done: profile.dailyCompleted.includes('tutor'),
  })

  const sum = items.reduce((a, b) => a + b.minutes, 0)
  if (sum !== minutes && items.length) {
    items[0].minutes += minutes - sum
  }
  return items
}

export function dailyMeta(profile: UserProfile) {
  const today = localDayKey()
  const isFresh = profile.dailyPlanDate === today
  const done = profile.dailyCompleted.length
  const totalSlots = 5 + 3 // 5 skills + library/vocab/tutor
  return {
    today,
    todayLabel: formatDayMy(today),
    isFresh,
    done,
    totalSlots,
    allDone: done >= totalSlots,
  }
}

export function progressSummary(profile: UserProfile) {
  const avg = averageMastery(profile.skillMastery) / 100
  const eta = estimateDaysToC2(profile.currentLevel, profile.dailyMinutes, avg)
  const nxt = nextLevel(profile.currentLevel)
  const weakSkills = (
    Object.entries(profile.skillMastery) as [Skill, number][]
  )
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([s]) => s)

  const recentWrong = profile.errorJournal.slice(-5).reverse()
  const tests = profile.levelTests
  const last = tests[tests.length - 1]
  const prev = tests[tests.length - 2]
  let trendMy = 'ပထမဆုံး စစ်ဆေးမှု — နောက်အပတ်တွင် နှိုင်းယှဉ်နိုင်မည်။'
  if (last && prev) {
    const diff = last.percent - prev.percent
    if (diff >= 5) trendMy = `တိုးတက်နေသည် — နောက်ဆုံး စစ်ဆေးမှု +${diff}%။`
    else if (diff <= -5)
      trendMy = `ခဏကျဆင်း — ${Math.abs(diff)}%။ အားနည်း skill ကို ဦးစားပေးပါ။`
    else trendMy = 'တည်ငြိမ်နေသည် — နက်ရှိုင်းအောင် လေ့ကျင့်ပါ။'
  }

  return {
    eta,
    etaTextMy: formatEtaMy(eta.days, eta.months),
    nextLevel: nxt,
    weakSkills,
    recentWrong,
    trendMy,
    avgMastery: Math.round(avg * 100),
    needsWeeklyTest: needsWeeklyTest(profile),
    daily: dailyMeta(profile),
  }
}

export function needsWeeklyTest(profile: UserProfile): boolean {
  if (!profile.placementDone) return false
  const weekly = profile.levelTests.filter((t) => t.kind === 'weekly')
  if (weekly.length === 0) {
    const placed = profile.levelTests.find((t) => t.kind === 'placement')
    if (!placed) return true
    const days =
      (Date.now() - new Date(placed.date).getTime()) / (1000 * 60 * 60 * 24)
    return days >= 7
  }
  const last = weekly[weekly.length - 1]
  const days =
    (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)
  return days >= 7
}

export function getDailyQuestions(
  profile: UserProfile,
  skill: Skill,
): Question[] {
  const level = profile.currentLevel
  const ai = profile.dailyAiPack
  if (ai?.date === localDayKey() && ai.questions[skill]?.length) {
    // AI packs are tagged at current level; keep only ±1 if model drifts
    return (ai.questions[skill] as Question[]).filter((q) =>
      inBandQuestion(q, level),
    )
  }
  const ids = profile.dailyQuestionIds[skill] ?? []
  const map = new Map(QUESTIONS.map((q) => [q.id, q]))
  return ids
    .map((id) => map.get(id))
    .filter((q): q is Question => inBandQuestion(q, level))
}

function resolveDailyStory(
  profile: UserProfile,
  dayIndex: number,
): Story | null {
  const ai = profile.dailyAiPack
  if (ai?.date === localDayKey()) {
    const stories = ai.stories?.length
      ? ai.stories
      : ai.story
        ? [ai.story]
        : []
    if (stories.length) {
      const featured =
        stories.find((s) => s.id === profile.dailyStoryId) ?? stories[0]
      return featured as Story
    }
  }
  if (profile.dailyStoryId) {
    return getStory(profile.dailyStoryId) ?? pickDailyStory(profile, dayIndex)
  }
  return pickDailyStory(profile, dayIndex)
}

export function getDailyAiStories(profile: UserProfile): Story[] {
  const ai = profile.dailyAiPack
  if (ai?.date !== localDayKey()) return []
  if (ai.stories?.length) return ai.stories as Story[]
  if (ai.story) return [ai.story as Story]
  return []
}

export function dailySourceLabel(profile: UserProfile): string {
  const ai = profile.dailyAiPack
  if (ai?.date === localDayKey() && ai.source === 'ai') {
    const n = ai.questions
      ? Object.values(ai.questions).reduce((a, b) => a + (b?.length ?? 0), 0)
      : 0
    const stories = ai.stories?.length || (ai.story ? 1 : 0)
    return `AI · ${n} Q · ${stories} stories`
  }
  return 'Local bank'
}
