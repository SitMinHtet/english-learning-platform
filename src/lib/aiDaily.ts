import { LEVEL_LABELS } from '../data/cefr'
import type {
  AiStoryItem,
  CEFRLevel,
  DailyAiPack,
  Question,
  Skill,
  TutorSettings,
  UserProfile,
  VocabWord,
  WeeklyAiPack,
} from '../types'
import { localDayKey, localWeekKey } from './dateKey'
import {
  canUseAiDaily as canUseAiDailyClient,
  canUseAiWeekly as canUseAiWeeklyClient,
  chatCompletions,
  extractJsonObject,
} from './aiClient'
import type { AiKind } from './aiConfig'

export {
  canUseAiDailyClient as canUseAiDaily,
  canUseAiWeeklyClient as canUseAiWeekly,
}

const SKILLS: Skill[] = [
  'listening',
  'speaking',
  'pronunciation',
  'reading',
  'writing',
]

/** Target counts for AI daily pack (chunked to avoid truncated JSON) */
export const AI_DAILY_COUNTS: Record<Skill, number> = {
  listening: 16,
  speaking: 16,
  pronunciation: 16,
  reading: 16,
  writing: 16,
}

/** Max items per API call — keeps responses under max_tokens */
const AI_CHUNK = 8

export const AI_STORY_COUNT = 3
export const AI_VOCAB_COUNT = 16
export const AI_WEEKLY_COUNT = 15

export type AiProgressFn = (msg: string) => void

async function chatJson(
  settings: TutorSettings,
  system: string,
  user: string,
  kind: AiKind = 'daily',
): Promise<unknown> {
  const tryOnce = async (withFormat: boolean) => {
    const raw = await chatCompletions({
      kind,
      settings,
      temperature: 0.65,
      responseFormatJson: withFormat,
      messages: [
        {
          role: 'system',
          content: withFormat ? system : `${system}\nReturn ONLY valid JSON.`,
        },
        { role: 'user', content: user },
      ],
    })
    return extractJsonObject(raw)
  }

  try {
    return await tryOnce(true)
  } catch {
    return await tryOnce(false)
  }
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : []
}

function resolveAnswer(answer: string, options: string[]): string | null {
  if (options.includes(answer)) return answer
  const letterIdx = 'ABCD'.indexOf(answer.trim().toUpperCase())
  if (letterIdx >= 0 && letterIdx < options.length) return options[letterIdx]!
  const n = Number(answer)
  if (n >= 1 && n <= options.length) return options[n - 1]!
  // fuzzy: case-insensitive match
  const lower = answer.trim().toLowerCase()
  const hit = options.find((o) => o.trim().toLowerCase() === lower)
  return hit ?? null
}

function normalizeQuestion(
  raw: Record<string, unknown>,
  skill: Skill,
  level: CEFRLevel,
  i: number,
  day: string,
  prefix = 'ai',
): Question | null {
  const prompt = asString(raw.prompt)
  const answer = asString(raw.answer)
  if (!prompt || !answer) return null
  const options = asStringArray(raw.options)
  const type =
    skill === 'listening'
      ? 'listening'
      : skill === 'speaking'
        ? 'speaking'
        : skill === 'pronunciation'
          ? 'pronunciation'
          : skill === 'reading' && asString(raw.passage)
            ? 'reading'
            : 'mcq'

  const needsOptions =
    skill === 'listening' || skill === 'reading' || skill === 'writing'
  if (needsOptions) {
    if (options.length < 4) return null
    const resolved = resolveAnswer(answer, options)
    if (!resolved) return null
    if (skill === 'listening' && !asString(raw.audioText)) return null
    if (skill === 'reading' && !asString(raw.passage)) return null
    return {
      id: `${prefix}-${day}-${skill}-${i}`,
      skill,
      level,
      type,
      prompt,
      promptMy: asString(raw.promptMy) || undefined,
      options,
      answer: resolved,
      explanationMy:
        asString(raw.explanationMy) || 'AI မှ ဖန်တီးသော လေ့ကျင့်ခန်း။',
      audioText: asString(raw.audioText) || undefined,
      passage: asString(raw.passage) || undefined,
      tipsMy: asString(raw.tipsMy) || undefined,
    }
  }

  // speaking / pronunciation — model sentence as answer
  return {
    id: `${prefix}-${day}-${skill}-${i}`,
    skill,
    level,
    type,
    prompt,
    promptMy: asString(raw.promptMy) || undefined,
    answer,
    explanationMy:
      asString(raw.explanationMy) || 'AI မှ ဖန်တီးသော လေ့ကျင့်ခန်း။',
    tipsMy: asString(raw.tipsMy) || undefined,
  }
}

function normalizeStory(
  raw: Record<string, unknown>,
  level: CEFRLevel,
  day: string,
  index: number,
): AiStoryItem | null {
  const body = asString(raw.body)
  const title = asString(raw.title)
  if (!body || !title) return null
  const words = body.trim().split(/\s+/).filter(Boolean).length
  if (words < 180) return null // prefer longer stories

  const glossary = Array.isArray(raw.glossary)
    ? raw.glossary
        .map((g) => {
          const o = g as Record<string, unknown>
          return {
            word: asString(o.word),
            meaningMy: asString(o.meaningMy),
          }
        })
        .filter((g) => g.word && g.meaningMy)
    : []

  const quiz = Array.isArray(raw.quiz)
    ? raw.quiz
        .map((q) => {
          const o = q as Record<string, unknown>
          const options = asStringArray(o.options)
          const answer = asString(o.answer)
          if (options.length < 4) return null
          const resolved = resolveAnswer(answer, options)
          if (!resolved) return null
          const prompt = asString(o.prompt)
          if (!prompt) return null
          return {
            prompt,
            promptMy: asString(o.promptMy) || undefined,
            options,
            answer: resolved,
            explanationMy: asString(o.explanationMy) || '…',
          }
        })
        .filter((q): q is NonNullable<typeof q> => !!q)
    : []

  if (quiz.length < 2) return null

  return {
    id: `ai-story-${day}-${index + 1}`,
    level,
    title,
    titleMy: asString(raw.titleMy) || title,
    genre: asString(raw.genre) || 'Story',
    genreMy: asString(raw.genreMy) || 'ဇာတ်လမ်း',
    minutes: Number(raw.minutes) || Math.max(12, Math.round(words / 140)),
    words,
    summaryMy: asString(raw.summaryMy) || 'ယနေ့ AI ဇာတ်လမ်း',
    body,
    glossary,
    quiz,
  }
}

async function generateSkillQuestions(
  settings: TutorSettings,
  profile: UserProfile,
  skill: Skill,
  count: number,
  day: string,
): Promise<Question[]> {
  const level = profile.currentLevel
  const label = LEVEL_LABELS[level]
  const system = `You are an English teacher creating CEFR ${level} ${skill} exercises for a Myanmar learner (target C2).
English for prompts/passages/audio; Myanmar for explanationMy, promptMy, tipsMy.
Never use any other language. Return ONLY valid JSON.`

  const shape =
    skill === 'listening'
      ? `{"questions":[{"prompt":"...","promptMy":"...","audioText":"1-3 spoken sentences","options":["A","B","C","D"],"answer":"exact option text","explanationMy":"..."}]}`
      : skill === 'reading'
        ? `{"questions":[{"passage":"short paragraph","prompt":"...","promptMy":"...","options":["A","B","C","D"],"answer":"exact option text","explanationMy":"..."}]}`
        : skill === 'writing'
          ? `{"questions":[{"prompt":"grammar/MCQ writing item","promptMy":"...","options":["A","B","C","D"],"answer":"exact option text","explanationMy":"..."}]}`
          : skill === 'speaking'
            ? `{"questions":[{"prompt":"Say: \\"...\\"","promptMy":"...","answer":"exact sentence to say","explanationMy":"...","tipsMy":"..."}]}`
            : `{"questions":[{"prompt":"Pronounce: \\"...\\"","promptMy":"...","answer":"exact phrase","explanationMy":"...","tipsMy":"..."}]}`

  const list: Question[] = []
  let offset = 0
  while (offset < count) {
    const n = Math.min(AI_CHUNK, count - offset)
    const user = `Create exactly ${n} unique ${skill} items for ${profile.name}, CEFR ${level} (${label.my}), date ${day}, batch ${offset / AI_CHUNK + 1}.
JSON shape: ${shape}
Rules:
- answer MUST be exactly one of the options (full text, not letter) when options exist
- 4 distinct options for MCQ skills
- Keep difficulty strictly at ${level} only
- Fresh content for ${day}`

    const raw = (await chatJson(settings, system, user)) as Record<string, unknown>
    const arr = Array.isArray(raw.questions) ? raw.questions : []
    for (let i = 0; i < arr.length; i++) {
      const q = normalizeQuestion(
        arr[i] as Record<string, unknown>,
        skill,
        level,
        offset + i,
        day,
      )
      if (q) list.push(q)
    }
    offset += n
  }
  return list
}

async function generateStories(
  settings: TutorSettings,
  profile: UserProfile,
  day: string,
): Promise<AiStoryItem[]> {
  const level = profile.currentLevel
  const system = `You are an English teacher writing CEFR ${level} graded readers for Myanmar learners.
Story body in English (longer); titlesMy/summaryMy/glossary/explanationMy in Myanmar only.
Return ONLY valid JSON.`

  const user = `Create exactly ${AI_STORY_COUNT} different longer stories for level ${level}, date ${day}.
JSON:
{"stories":[{
  "title":"...","titleMy":"...","genre":"...","genreMy":"...","minutes":15,
  "summaryMy":"...",
  "body":"5-8 English paragraphs separated by blank lines (at least 220 words)",
  "glossary":[{"word":"...","meaningMy":"..."}],
  "quiz":[{"prompt":"...","options":["A","B","C","D"],"answer":"exact option","explanationMy":"..."}]
}]}
Rules: each story ≥220 words, quiz 3 items, answer exact option text, varied genres.`

  const raw = (await chatJson(settings, system, user)) as Record<string, unknown>
  const arr = Array.isArray(raw.stories) ? raw.stories : []
  const stories: AiStoryItem[] = []
  for (let i = 0; i < arr.length; i++) {
    const s = normalizeStory(arr[i] as Record<string, unknown>, level, day, i)
    if (s) stories.push(s)
  }
  return stories
}

async function generateVocab(
  settings: TutorSettings,
  profile: UserProfile,
  day: string,
): Promise<VocabWord[]> {
  const level = profile.currentLevel
  const system = `English vocab for CEFR ${level} Myanmar learners. meaningMy/exampleMy in Myanmar. Return ONLY JSON.`
  const user = `Create exactly ${AI_VOCAB_COUNT} new vocabulary items for level ${level}, date ${day}.
{"vocab":[{"word":"lemma","pos":"noun","meaningMy":"...","example":"English sentence","exampleMy":"..."}]}
Words must suit CEFR ${level} only — not beginner A1 words if level is B1+, and not rare C1/C2 academic words if level is below C1.`

  const raw = (await chatJson(settings, system, user)) as Record<string, unknown>
  const arr = Array.isArray(raw.vocab) ? raw.vocab : []
  const out: VocabWord[] = []
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i] as Record<string, unknown>
    const word = asString(o.word).trim().toLowerCase()
    const meaningMy = asString(o.meaningMy)
    const example = asString(o.example)
    const exampleMy = asString(o.exampleMy)
    if (!word || !meaningMy || !example) continue
    out.push({
      id: `ai-v-${day}-${i}`,
      word,
      meaningMy,
      example,
      exampleMy: exampleMy || meaningMy,
      level,
      pos: asString(o.pos) || undefined,
    })
  }
  return out
}

export async function generateAiDailyPack(
  profile: UserProfile,
  onProgress?: AiProgressFn,
): Promise<DailyAiPack> {
  const settings = profile.tutorSettings
  const day = localDayKey()
  const questions: Partial<Record<Skill, Question[]>> = {}
  const errors: string[] = []

  for (const skill of SKILLS) {
    onProgress?.(`${skill} မေးခွန်းများ generate လုပ်နေသည်…`)
    try {
      const list = await generateSkillQuestions(
        settings,
        profile,
        skill,
        AI_DAILY_COUNTS[skill],
        day,
      )
      if (list.length) questions[skill] = list
      else errors.push(`${skill}: AI ပြန်လာသော်လည်း မေးခွန်း validate မအောင်`)
    } catch (e) {
      errors.push(
        `${skill}: ${e instanceof Error ? e.message : 'generate မအောင်'}`,
      )
    }
  }

  onProgress?.('ဇာတ်လမ်း ၃ ပုဒ် generate လုပ်နေသည်…')
  let stories: AiStoryItem[] = []
  try {
    stories = await generateStories(settings, profile, day)
    if (!stories.length) errors.push('stories: အလွတ် / တိုလွန်း / invalid JSON')
  } catch (e) {
    errors.push(`stories: ${e instanceof Error ? e.message : 'fail'}`)
    stories = []
  }

  onProgress?.('Vocab generate လုပ်နေသည်…')
  let vocab: VocabWord[] = []
  try {
    vocab = await generateVocab(settings, profile, day)
  } catch (e) {
    errors.push(`vocab: ${e instanceof Error ? e.message : 'fail'}`)
    vocab = []
  }

  const anyQs = SKILLS.some((s) => (questions[s]?.length ?? 0) > 0)
  if (!anyQs && stories.length === 0) {
    const hint = errors[0] || 'unknown'
    const rateHint = /rate limit|429/i.test(hint)
      ? ' — .env မှာ RATE_MINUTE/RATE_HOUR တိုးပါ (daily pack ≈ ၇+ calls)'
      : ''
    throw new Error(`AI pack အလွတ် — ${hint}${rateHint}`)
  }

  return {
    date: day,
    source: 'ai',
    stories,
    story: stories[0] ?? null,
    questions,
    vocab,
  }
}

export async function generateAiWeeklyTest(
  profile: UserProfile,
  onProgress?: AiProgressFn,
): Promise<WeeklyAiPack> {
  const settings = profile.tutorSettings
  if (!canUseAiWeeklyClient(settings)) {
    throw new Error('API key လိုသည် (Tutor Settings)')
  }
  const level = profile.currentLevel
  const weekKey = localWeekKey()
  const day = localDayKey()
  onProgress?.('Weekly AI test generate လုပ်နေသည်…')

  const system = `Create a CEFR ${level} weekly English level test for a Myanmar learner.
MCQ only (listening/reading/writing skills). Myanmar for explanationMy.
Return ONLY valid JSON.`

  const user = `Create exactly ${AI_WEEKLY_COUNT} unique MCQ items for weekly test, level ${level}, week ${weekKey}.
Mix listening, reading, and writing skills.
JSON:
{"questions":[
  {"skill":"listening","prompt":"...","audioText":"...","options":["A","B","C","D"],"answer":"exact option","explanationMy":"..."},
  {"skill":"reading","passage":"...","prompt":"...","options":["A","B","C","D"],"answer":"exact option","explanationMy":"..."},
  {"skill":"writing","prompt":"...","options":["A","B","C","D"],"answer":"exact option","explanationMy":"..."}
]}
Rules: 4 options, answer exact option text, CEFR ${level}.`

  const raw = (await chatJson(
    settings,
    system,
    user,
    'weekly',
  )) as Record<string, unknown>
  const arr = Array.isArray(raw.questions) ? raw.questions : []
  const list: Question[] = []
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i] as Record<string, unknown>
    const skillRaw = asString(item.skill, 'reading') as Skill
    const skill: Skill = SKILLS.includes(skillRaw) ? skillRaw : 'reading'
    // force MCQ-friendly skills
    const useSkill: Skill =
      skill === 'speaking' || skill === 'pronunciation' ? 'reading' : skill
    const q = normalizeQuestion(item, useSkill, level, i, day, 'aiw')
    if (q && q.options && q.options.length >= 4) list.push(q)
  }

  if (list.length < 8) {
    throw new Error('Weekly AI test မေးခွန်း မလုံလောက်ပါ — ထပ်ကြိုးစားပါ')
  }

  return {
    weekKey,
    generatedAt: new Date().toISOString(),
    level,
    source: 'ai',
    questions: list.slice(0, AI_WEEKLY_COUNT),
  }
}
