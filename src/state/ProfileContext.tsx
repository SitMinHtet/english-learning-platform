import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AttemptRecord,
  ChatMessage,
  LevelTestResult,
  Question,
  Skill,
  SkillScores,
  SavedWord,
  TutorSettings,
  UserProfile,
  WritingFeedback,
} from '../types'
import {
  bumpStreak,
  clearProfile,
  defaultProfile,
  downloadBackup,
  loadProfile,
  parseBackup,
  recoverProfile,
  saveProfile,
} from '../lib/storage'
import { mergeMastery } from '../lib/testEngine'
import { ensureVocabDeck, reviewCard, type SrsQuality } from '../lib/srs'
import { refreshDailyPackIfNeeded } from '../lib/dailyPlan'
import {
  canUseAiDaily,
  canUseAiWeekly,
  generateAiDailyPack,
  generateAiWeeklyTest,
  type AiProgressFn,
} from '../lib/aiDaily'
import { localDayKey, localWeekKey, msUntilNextLocalMidnight } from '../lib/dateKey'
import { newCard } from '../lib/srs'

interface ProfileCtx {
  profile: UserProfile | null
  ready: boolean
  startOnboarding: (name: string) => void
  completePlacement: (result: LevelTestResult) => void
  completeWeekly: (result: LevelTestResult) => void
  recordAttempt: (
    attempt: Omit<AttemptRecord, 'id' | 'at'> & {
      minutes?: number
      correctAnswer?: string
      speakingScore?: number
    },
  ) => void
  completeLesson: (lessonId: string, minutes: number) => void
  saveWriting: (
    promptId: string,
    text: string,
    feedback: WritingFeedback,
  ) => void
  setSpeakingBest: (questionId: string, score: number, skill?: Skill) => void
  updateMasteryDelta: (skill: Skill, delta: number) => void
  markQuestionsUsed: (ids: string[]) => void
  addVocabCards: (count?: number) => number
  reviewVocab: (wordId: string, quality: SrsQuality) => void
  markStoryRead: (storyId: string, minutes: number) => void
  markDailyDone: (slot: string) => void
  refreshDaily: () => void
  generateAiDaily: (
    onProgress?: AiProgressFn,
  ) => Promise<{ ok: boolean; error?: string }>
  ensureWeeklyAi: (
    onProgress?: AiProgressFn,
  ) => Promise<{ ok: boolean; error?: string; questions?: Question[] }>
  appendTutorMessages: (messages: ChatMessage[], minutes?: number) => void
  clearTutorChat: () => void
  updateTutorSettings: (patch: Partial<TutorSettings>) => void
  saveWord: (word: Omit<SavedWord, 'id' | 'savedAt'>) => { ok: boolean; updated?: boolean }
  removeSavedWord: (id: string) => void
  clearSavedWords: () => void
  exportData: () => void
  importData: (fileText: string) => { ok: boolean; error?: string }
  resetAll: () => void
}

const Ctx = createContext<ProfileCtx | null>(null)

function speakingSkillFromId(questionId: string, hint?: Skill): Skill {
  if (hint === 'pronunciation' || hint === 'speaking') return hint
  if (
    questionId.includes('-pronunciation-') ||
    /(?:^|-)p-/.test(questionId) ||
    questionId.includes('pronunciation')
  ) {
    return 'pronunciation'
  }
  return 'speaking'
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile())
  const [ready, setReady] = useState(false)

  const persist = useCallback((p: UserProfile) => {
    const saved = saveProfile(p)
    setProfile(saved)
  }, [])

  const persistUpdate = useCallback((fn: (p: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      if (!prev) return prev
      const next = fn(prev)
      return saveProfile(next)
    })
  }, [])

  const applyDaily = useCallback((p: UserProfile) => {
    const next = refreshDailyPackIfNeeded(p)
    if (next !== p) {
      return saveProfile(next)
    }
    if (!next.dailyPlanDate) {
      const forced = refreshDailyPackIfNeeded({
        ...next,
        dailyPlanDate: null,
        dailyStoryId: null,
      })
      return saveProfile(forced)
    }
    return next
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let p = loadProfile()
      if (!p) {
        p = await recoverProfile()
      }
      if (p && !Array.isArray(p.vocabCards)) {
        const raw = p.vocabCards as unknown as {
          cards?: UserProfile['vocabCards']
        }
        p = {
          ...p,
          vocabCards: Array.isArray(raw?.cards) ? raw.cards : [],
        }
      }
      if (p && p.placementDone) {
        p = applyDaily(p)
      } else if (p) {
        p = saveProfile(p)
      }
      if (!cancelled) {
        if (p) setProfile(p)
        setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applyDaily])

  useEffect(() => {
    if (!profile?.placementDone) return

    const sync = () => {
      setProfile((prev) => {
        if (!prev?.placementDone) return prev
        const next = refreshDailyPackIfNeeded(prev)
        if (next !== prev) return saveProfile(next)
        return prev
      })
    }

    const onFocus = () => sync()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    const timer = window.setTimeout(() => {
      sync()
    }, msUntilNextLocalMidnight())
    const hourly = window.setInterval(sync, 60 * 60 * 1000)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearTimeout(timer)
      window.clearInterval(hourly)
    }
  }, [profile?.placementDone])

  const startOnboarding = useCallback(
    (name: string) => {
      persist(defaultProfile(name.trim() || 'Learner'))
    },
    [persist],
  )

  const completePlacement = useCallback(
    (result: LevelTestResult) => {
      persistUpdate((p) => {
        const base: UserProfile = {
          ...bumpStreak(p),
          placementDone: true,
          currentLevel: result.level,
          levelTests: [...p.levelTests, result],
          usedQuestionIds: [
            ...new Set([...p.usedQuestionIds, ...result.questionIds]),
          ],
          skillMastery: mergeMastery(p.skillMastery, result.skillScores, 0.5),
          totalMinutes: p.totalMinutes + 30,
        }
        const withVocab = {
          ...base,
          vocabCards: ensureVocabDeck(base, result.level, 8).cards,
          dailyPlanDate: null,
          dailyStoryId: null,
          dailyQuestionIds: {},
          dailyCompleted: [],
        }
        return refreshDailyPackIfNeeded(withVocab)
      })
    },
    [persistUpdate],
  )

  const completeWeekly = useCallback(
    (result: LevelTestResult) => {
      persistUpdate((p) => {
        if (!p.placementDone) return p
        const base: UserProfile = {
          ...bumpStreak(p),
          currentLevel: result.level,
          levelTests: [...p.levelTests, result],
          usedQuestionIds: [
            ...new Set([...p.usedQuestionIds, ...result.questionIds]),
          ],
          skillMastery: mergeMastery(p.skillMastery, result.skillScores, 0.4),
          totalMinutes: p.totalMinutes + 25,
        }
        return {
          ...base,
          vocabCards: ensureVocabDeck(base, result.level, 4).cards,
        }
      })
    },
    [persistUpdate],
  )

  const recordAttempt = useCallback(
    (
      attempt: Omit<AttemptRecord, 'id' | 'at'> & {
        minutes?: number
        correctAnswer?: string
        speakingScore?: number
      },
    ) => {
      persistUpdate((p) => {
        const rec: AttemptRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: new Date().toISOString(),
          questionId: attempt.questionId,
          skill: attempt.skill,
          correct: attempt.correct,
          userAnswer: attempt.userAnswer,
          explanationMy: attempt.explanationMy,
        }
        let next: UserProfile = {
          ...bumpStreak(p),
          attempts: [...p.attempts, rec].slice(-500),
          usedQuestionIds: p.usedQuestionIds.includes(attempt.questionId)
            ? p.usedQuestionIds
            : [...p.usedQuestionIds, attempt.questionId],
          totalMinutes: p.totalMinutes + (attempt.minutes ?? 2),
        }
        if (!attempt.correct && attempt.explanationMy) {
          next = {
            ...next,
            errorJournal: [
              ...next.errorJournal,
              {
                id: rec.id,
                skill: attempt.skill,
                wrong: attempt.userAnswer,
                correct: attempt.correctAnswer ?? '',
                reasonMy: attempt.explanationMy,
                at: rec.at,
              },
            ].slice(-100),
          }
        }
        const mastery = { ...next.skillMastery }
        mastery[attempt.skill] = Math.max(
          0,
          Math.min(100, mastery[attempt.skill] + (attempt.correct ? 2 : -1)),
        )
        next.skillMastery = mastery

        if (typeof attempt.speakingScore === 'number') {
          const prevBest = next.speakingBest[attempt.questionId] ?? 0
          if (attempt.speakingScore > prevBest) {
            const speakSkill = speakingSkillFromId(
              attempt.questionId,
              attempt.skill,
            )
            const m = { ...next.skillMastery }
            m[speakSkill] = Math.min(
              100,
              m[speakSkill] + Math.round(attempt.speakingScore / 50),
            )
            next = {
              ...next,
              speakingBest: {
                ...next.speakingBest,
                [attempt.questionId]: attempt.speakingScore,
              },
              skillMastery: m,
            }
          }
        }
        return next
      })
    },
    [persistUpdate],
  )

  const completeLesson = useCallback(
    (lessonId: string, minutes: number) => {
      persistUpdate((p) => {
        if (p.completedLessonIds.includes(lessonId)) {
          return {
            ...bumpStreak(p),
            totalMinutes: p.totalMinutes + minutes,
          }
        }
        return {
          ...bumpStreak(p),
          completedLessonIds: [...p.completedLessonIds, lessonId],
          totalMinutes: p.totalMinutes + minutes,
        }
      })
    },
    [persistUpdate],
  )

  const saveWriting = useCallback(
    (promptId: string, text: string, feedback: WritingFeedback) => {
      persistUpdate((p) => {
        const mastery: SkillScores = {
          ...p.skillMastery,
          writing: Math.round(p.skillMastery.writing * 0.7 + feedback.score * 0.3),
        }
        return {
          ...bumpStreak(p),
          writingHistory: [
            ...p.writingHistory,
            {
              id: `w-${Date.now()}`,
              promptId,
              text,
              feedback,
              at: new Date().toISOString(),
            },
          ].slice(-50),
          skillMastery: mastery,
          totalMinutes: p.totalMinutes + 20,
          errorJournal: [
            ...p.errorJournal,
            ...feedback.issues
              .filter((i) => i.severity === 'error')
              .map((i) => ({
                id: `ej-${Date.now()}-${i.original}`,
                skill: 'writing' as const,
                wrong: i.original,
                correct: i.suggestion,
                reasonMy: i.reasonMy,
                at: new Date().toISOString(),
              })),
          ].slice(-100),
        }
      })
    },
    [persistUpdate],
  )

  const setSpeakingBest = useCallback(
    (questionId: string, score: number, skill?: Skill) => {
      persistUpdate((p) => {
        const prev = p.speakingBest[questionId] ?? 0
        if (score <= prev) return p
        const mastery = { ...p.skillMastery }
        const sk = speakingSkillFromId(questionId, skill)
        mastery[sk] = Math.min(100, mastery[sk] + Math.round(score / 50))
        return {
          ...p,
          speakingBest: { ...p.speakingBest, [questionId]: score },
          skillMastery: mastery,
        }
      })
    },
    [persistUpdate],
  )

  const updateMasteryDelta = useCallback(
    (skill: Skill, delta: number) => {
      persistUpdate((p) => {
        const mastery = { ...p.skillMastery }
        mastery[skill] = Math.max(0, Math.min(100, mastery[skill] + delta))
        return { ...p, skillMastery: mastery }
      })
    },
    [persistUpdate],
  )

  const markQuestionsUsed = useCallback(
    (ids: string[]) => {
      persistUpdate((p) => ({
        ...p,
        usedQuestionIds: [...new Set([...p.usedQuestionIds, ...ids])],
      }))
    },
    [persistUpdate],
  )

  const addVocabCards = useCallback(
    (count = 8) => {
      if (!profile) return 0
      const preview = ensureVocabDeck(profile, profile.currentLevel, count)
      if (preview.added === 0) return 0
      persistUpdate((p) => {
        const result = ensureVocabDeck(p, p.currentLevel, count)
        if (result.added === 0) return p
        return {
          ...bumpStreak(p),
          vocabCards: result.cards,
          totalMinutes: p.totalMinutes + 2,
        }
      })
      return preview.added
    },
    [profile, persistUpdate],
  )

  const reviewVocab = useCallback(
    (wordId: string, quality: SrsQuality) => {
      persistUpdate((p) => {
        const cards = Array.isArray(p.vocabCards)
          ? p.vocabCards
          : Array.isArray((p.vocabCards as unknown as { cards?: unknown })?.cards)
            ? ((p.vocabCards as unknown as { cards: typeof p.vocabCards }).cards)
            : []
        return {
          ...bumpStreak(p),
          vocabCards: cards.map((c) =>
            c.wordId === wordId ? reviewCard(c, quality) : c,
          ),
          totalMinutes: p.totalMinutes + 1,
        }
      })
    },
    [persistUpdate],
  )

  const markStoryRead = useCallback(
    (storyId: string, minutes: number) => {
      persistUpdate((p) => {
        const mastery = { ...p.skillMastery }
        mastery.reading = Math.min(100, mastery.reading + 2)
        const isDailyStory = p.dailyStoryId === storyId
        const completed =
          isDailyStory && !p.dailyCompleted.includes('library')
            ? [...p.dailyCompleted, 'library']
            : p.dailyCompleted
        return {
          ...bumpStreak(p),
          readStoryIds: p.readStoryIds.includes(storyId)
            ? p.readStoryIds
            : [...p.readStoryIds, storyId],
          skillMastery: mastery,
          totalMinutes: p.totalMinutes + minutes,
          dailyCompleted: completed,
        }
      })
    },
    [persistUpdate],
  )

  const markDailyDone = useCallback(
    (slot: string) => {
      persistUpdate((p) => {
        if (p.dailyCompleted.includes(slot)) return p
        return {
          ...bumpStreak(p),
          dailyCompleted: [...p.dailyCompleted, slot],
        }
      })
    },
    [persistUpdate],
  )

  const refreshDaily = useCallback(() => {
    persistUpdate((p) =>
      refreshDailyPackIfNeeded({
        ...p,
        dailyPlanDate: null,
        dailyStoryId: null,
        dailyQuestionIds: {},
        dailyCompleted: [],
        dailyAiPack: null,
      }),
    )
  }, [persistUpdate])

  const applyAiPackToProfile = useCallback(
    (prev: UserProfile, pack: Awaited<ReturnType<typeof generateAiDailyPack>>) => {
      const skillIds: Partial<Record<Skill, string[]>> = {
        ...prev.dailyQuestionIds,
      }
      for (const [skill, list] of Object.entries(pack.questions)) {
        if (list?.length) {
          skillIds[skill as Skill] = list.map((q) => q.id)
        }
      }
      const customVocab = [...(prev.customVocab ?? [])]
      const haveWord = new Set(customVocab.map((w) => w.word.toLowerCase()))
      for (const w of pack.vocab ?? []) {
        if (!haveWord.has(w.word.toLowerCase())) {
          customVocab.push(w)
          haveWord.add(w.word.toLowerCase())
        }
      }
      const prevCards = Array.isArray(prev.vocabCards) ? prev.vocabCards : []
      const haveCard = new Set(prevCards.map((c) => c.wordId))
      const vocabCards = [...prevCards]
      for (const w of pack.vocab ?? []) {
        if (!haveCard.has(w.id)) {
          vocabCards.push(newCard(w.id))
          haveCard.add(w.id)
        }
      }
      const featured =
        pack.stories?.[0]?.id ?? pack.story?.id ?? prev.dailyStoryId
      return saveProfile({
        ...prev,
        dailyPlanDate: localDayKey(),
        dailyStoryId: featured,
        dailyQuestionIds: skillIds,
        dailyCompleted: [],
        dailyAiPack: pack,
        customVocab,
        vocabCards,
      })
    },
    [],
  )

  const generateAiDaily = useCallback(
    async (onProgress?: AiProgressFn) => {
      const snap = profile
      if (!snap) return { ok: false, error: 'Profile မရှိပါ' }
      if (!canUseAiDaily(snap.tutorSettings)) {
        return {
          ok: false,
          error:
            'Tutor Settings တွင် API key ထည့်ပြီး “AI နေ့စဉ် pack” ကို ဖွင့်ပါ',
        }
      }
      try {
        onProgress?.('AI daily pack စတင်နေသည်…')
        const pack = await generateAiDailyPack(snap, onProgress)
        setProfile((prev) => {
          if (!prev) return prev
          return applyAiPackToProfile(prev, pack)
        })
        return { ok: true }
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : 'AI generate မအောင်မြင်ပါ',
        }
      }
    },
    [profile, applyAiPackToProfile],
  )

  const ensureWeeklyAi = useCallback(
    async (onProgress?: AiProgressFn) => {
      const snap = profile
      if (!snap) return { ok: false, error: 'Profile မရှိပါ' }
      const week = localWeekKey()
      if (
        snap.weeklyAiPack?.weekKey === week &&
        snap.weeklyAiPack.level === snap.currentLevel &&
        (snap.weeklyAiPack.questions?.length ?? 0) >= 8
      ) {
        return { ok: true, questions: snap.weeklyAiPack.questions }
      }
      if (!canUseAiWeekly(snap.tutorSettings)) {
        return { ok: true } // local fallback in LevelTest
      }
      try {
        const pack = await generateAiWeeklyTest(snap, onProgress)
        setProfile((prev) => {
          if (!prev) return prev
          return saveProfile({ ...prev, weeklyAiPack: pack })
        })
        return { ok: true, questions: pack.questions }
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : 'Weekly AI မအောင်မြင်ပါ',
        }
      }
    },
    [profile],
  )

  useEffect(() => {
    if (!profile?.placementDone) return
    if (!canUseAiDaily(profile.tutorSettings)) return
    if (profile.dailyAiPack?.date === localDayKey()) return
    let cancelled = false
    ;(async () => {
      try {
        const pack = await generateAiDailyPack(profile)
        if (cancelled) return
        setProfile((prev) => {
          if (!prev) return prev
          if (prev.dailyAiPack?.date === localDayKey()) return prev
          return applyAiPackToProfile(prev, pack)
        })
      } catch {
        // keep local pack
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    profile?.placementDone,
    profile?.tutorSettings.useAiDaily,
    profile?.tutorSettings.apiKey,
    profile?.dailyAiPack?.date,
    applyAiPackToProfile,
  ])

  const appendTutorMessages = useCallback(
    (messages: ChatMessage[], minutes = 3) => {
      persistUpdate((p) => {
        const completed = p.dailyCompleted.includes('tutor')
          ? p.dailyCompleted
          : [...p.dailyCompleted, 'tutor']
        return {
          ...bumpStreak(p),
          tutorChat: [...p.tutorChat, ...messages].slice(-80),
          totalMinutes: p.totalMinutes + minutes,
          dailyCompleted: completed,
        }
      })
    },
    [persistUpdate],
  )

  const clearTutorChat = useCallback(() => {
    persistUpdate((p) => ({ ...p, tutorChat: [] }))
  }, [persistUpdate])

  const updateTutorSettings = useCallback(
    (patch: Partial<TutorSettings>) => {
      persistUpdate((p) => ({
        ...p,
        tutorSettings: { ...p.tutorSettings, ...patch },
      }))
    },
    [persistUpdate],
  )

  const saveWord = useCallback(
    (word: Omit<SavedWord, 'id' | 'savedAt'>) => {
      const key = word.word.trim().toLowerCase()
      const updated = !!(profile?.savedWords ?? []).find(
        (w) => w.word.trim().toLowerCase() === key,
      )
      persistUpdate((p) => {
        const existing = (p.savedWords ?? []).find(
          (w) => w.word.trim().toLowerCase() === key,
        )
        if (existing) {
          return {
            ...p,
            savedWords: p.savedWords.map((w) =>
              w.id === existing.id
                ? {
                    ...w,
                    ...word,
                    word: word.word.trim(),
                    savedAt: new Date().toISOString(),
                  }
                : w,
            ),
          }
        }
        const entry: SavedWord = {
          ...word,
          id: `sw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          word: word.word.trim(),
          savedAt: new Date().toISOString(),
        }
        return {
          ...p,
          savedWords: [entry, ...(p.savedWords ?? [])].slice(0, 500),
        }
      })
      return { ok: true, updated }
    },
    [profile?.savedWords, persistUpdate],
  )

  const removeSavedWord = useCallback(
    (id: string) => {
      persistUpdate((p) => ({
        ...p,
        savedWords: (p.savedWords ?? []).filter((w) => w.id !== id),
      }))
    },
    [persistUpdate],
  )

  const clearSavedWords = useCallback(() => {
    persistUpdate((p) => ({ ...p, savedWords: [] }))
  }, [persistUpdate])

  const exportData = useCallback(() => {
    if (!profile) return
    downloadBackup(profile)
  }, [profile])

  const importData = useCallback(
    (fileText: string) => {
      try {
        const imported = parseBackup(fileText)
        persist(imported)
        return { ok: true }
      } catch {
        return { ok: false, error: 'Backup ဖိုင် မမှန်ပါ' }
      }
    },
    [persist],
  )

  const resetAll = useCallback(() => {
    clearProfile()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      profile,
      ready,
      startOnboarding,
      completePlacement,
      completeWeekly,
      recordAttempt,
      completeLesson,
      saveWriting,
      setSpeakingBest,
      updateMasteryDelta,
      markQuestionsUsed,
      addVocabCards,
      reviewVocab,
      markStoryRead,
      markDailyDone,
      refreshDaily,
      generateAiDaily,
      ensureWeeklyAi,
      appendTutorMessages,
      clearTutorChat,
      updateTutorSettings,
      saveWord,
      removeSavedWord,
      clearSavedWords,
      exportData,
      importData,
      resetAll,
    }),
    [
      profile,
      ready,
      startOnboarding,
      completePlacement,
      completeWeekly,
      recordAttempt,
      completeLesson,
      saveWriting,
      setSpeakingBest,
      updateMasteryDelta,
      markQuestionsUsed,
      addVocabCards,
      reviewVocab,
      markStoryRead,
      markDailyDone,
      refreshDaily,
      generateAiDaily,
      ensureWeeklyAi,
      appendTutorMessages,
      clearTutorChat,
      updateTutorSettings,
      saveWord,
      removeSavedWord,
      clearSavedWords,
      exportData,
      importData,
      resetAll,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProfile() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProfile outside provider')
  return ctx
}
