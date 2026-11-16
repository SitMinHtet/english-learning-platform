export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type Skill = 'listening' | 'speaking' | 'reading' | 'writing' | 'pronunciation'

export type QuestionType =
  | 'mcq'
  | 'fill'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'pronunciation'

export interface Question {
  id: string
  skill: Skill
  level: CEFRLevel
  type: QuestionType
  prompt: string
  promptMy?: string
  options?: string[]
  answer: string | string[]
  explanationMy: string
  audioText?: string
  passage?: string
  tipsMy?: string
}

export interface WritingPrompt {
  id: string
  level: CEFRLevel
  title: string
  titleMy: string
  prompt: string
  minWords: number
  rubricMy: string[]
}

export interface Lesson {
  id: string
  level: CEFRLevel
  skill: Skill
  title: string
  titleMy: string
  minutes: number
  descriptionMy: string
  questionIds: string[]
}

export interface SkillScores {
  listening: number
  speaking: number
  reading: number
  writing: number
  pronunciation: number
}

export interface AttemptRecord {
  id: string
  questionId: string
  skill: Skill
  correct: boolean
  userAnswer: string
  at: string
  explanationMy?: string
}

export interface LevelTestResult {
  id: string
  kind: 'placement' | 'weekly'
  date: string
  level: CEFRLevel
  percent: number
  skillScores: SkillScores
  questionIds: string[]
}

export interface WritingFeedback {
  overallMy: string
  score: number
  issues: Array<{
    original: string
    suggestion: string
    reasonMy: string
    severity: 'error' | 'warning' | 'tip'
  }>
  strengthsMy: string[]
  nextStepsMy: string[]
}

/** SM-2 spaced repetition card state */
export interface VocabCardState {
  wordId: string
  ease: number
  interval: number
  repetitions: number
  due: string
  lastResult?: 0 | 1 | 2 | 3
  lapses: number
}

export interface VocabWord {
  id: string
  word: string
  phonetic?: string
  meaningMy: string
  example: string
  exampleMy: string
  level: CEFRLevel
  pos?: string
}

/** Words the learner bookmarked from tap-to-define */
export interface SavedWord {
  id: string
  word: string
  meaningMy: string
  pos?: string
  example?: string
  exampleMy?: string
  tipMy?: string
  context?: string
  savedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  at: string
}

export interface TutorSettings {
  /** OpenAI-compatible API key (optional) */
  apiKey: string
  /** e.g. https://api.openai.com/v1 */
  baseUrl: string
  model: string
  useCloud: boolean
  /** Use API key to generate fresh daily story + exercises */
  useAiDaily: boolean
}

export interface AiStoryItem {
  id: string
  level: CEFRLevel
  title: string
  titleMy: string
  genre: string
  genreMy: string
  minutes: number
  words: number
  summaryMy: string
  body: string
  glossary: Array<{ word: string; meaningMy: string }>
  quiz: Array<{
    prompt: string
    promptMy?: string
    options: string[]
    answer: string
    explanationMy: string
  }>
}

/** AI-generated (or cached) daily content pack — one cache per local day */
export interface DailyAiPack {
  date: string
  source: 'ai' | 'local'
  /** Up to 3 longer stories for the day */
  stories: AiStoryItem[]
  /** Primary/featured story (stories[0]) — kept for older UI */
  story: AiStoryItem | null
  questions: Partial<Record<Skill, Question[]>>
  /** Fresh vocab for SRS (merged into customVocab on apply) */
  vocab: VocabWord[]
}

/** AI weekly level test — cached per local ISO week */
export interface WeeklyAiPack {
  weekKey: string
  generatedAt: string
  level: CEFRLevel
  source: 'ai' | 'local'
  questions: Question[]
}

export interface UserProfile {
  name: string
  createdAt: string
  updatedAt: string
  currentLevel: CEFRLevel
  targetLevel: CEFRLevel
  dailyMinutes: number
  placementDone: boolean
  usedQuestionIds: string[]
  attempts: AttemptRecord[]
  levelTests: LevelTestResult[]
  skillMastery: SkillScores
  streak: number
  lastStudyDate: string | null
  totalMinutes: number
  errorJournal: Array<{
    id: string
    skill: Skill
    wrong: string
    correct: string
    reasonMy: string
    at: string
  }>
  writingHistory: Array<{
    id: string
    promptId: string
    text: string
    feedback: WritingFeedback
    at: string
  }>
  completedLessonIds: string[]
  speakingBest: Record<string, number>
  vocabCards: VocabCardState[]
  tutorChat: ChatMessage[]
  tutorSettings: TutorSettings
  readStoryIds: string[]
  /** YYYY-MM-DD local — when daily pack was last generated */
  dailyPlanDate: string | null
  /** Today's locked story id */
  dailyStoryId: string | null
  /** Today's locked question ids per skill */
  dailyQuestionIds: Partial<Record<Skill, string[]>>
  /** Skills / slots completed today (listening, library, vocab, …) */
  dailyCompleted: string[]
  /** Optional AI-generated daily content for today */
  dailyAiPack: DailyAiPack | null
  /** AI weekly test cache */
  weeklyAiPack: WeeklyAiPack | null
  /** Extra vocab words (AI / imported) beyond static bank */
  customVocab: VocabWord[]
  /** Bookmarked word meanings for later review / export */
  savedWords: SavedWord[]
}

export interface DailyPlanItem {
  skill: Skill | 'vocab' | 'tutor' | 'library'
  title: string
  titleMy: string
  minutes: number
  lessonId?: string
  route: string
  done?: boolean
}

export interface BackupPayload {
  version: 1
  exportedAt: string
  app: 'path-to-c2'
  profile: UserProfile
}
