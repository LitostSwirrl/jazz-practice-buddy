import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, subDays } from 'date-fns'
import type { AchievementDefinition, UnlockInfo, StreakData } from '@/types'
import { useProgressStore } from './progress'
import { usePracticeStore } from './practice'

export const useGamificationStore = defineStore('gamification', () => {
  const achievementDefs = ref<AchievementDefinition[]>([])
  const unlockedAchievements = ref<Record<string, UnlockInfo>>({})
  const streakData = ref<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    practiceDates: [],
  })
  const pendingToast = ref<string | null>(null)

  const isUnlocked = computed(() => (id: string) => id in unlockedAchievements.value)
  const unlockedCount = computed(() => Object.keys(unlockedAchievements.value).length)
  const totalAchievements = computed(() => achievementDefs.value.length)

  const recentUnlocks = computed(() => (n: number) => {
    const entries = Object.entries(unlockedAchievements.value)
      .sort((a, b) => b[1].unlockedAt.localeCompare(a[1].unlockedAt))
      .slice(0, n)
    return entries.map(([id]) => achievementDefs.value.find(a => a.id === id)).filter(Boolean) as AchievementDefinition[]
  })

  const streakIsActive = computed(() => {
    if (!streakData.value.lastPracticeDate) return false
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    return streakData.value.lastPracticeDate === today || streakData.value.lastPracticeDate === yesterday
  })

  async function loadAchievements() {
    const data = await import('@/data/achievements.json').then(m => m.default)
    achievementDefs.value = data as AchievementDefinition[]
  }

  function updateStreak() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    if (streakData.value.lastPracticeDate === today) return

    if (!streakData.value.practiceDates.includes(today)) {
      streakData.value.practiceDates.push(today)
    }

    if (streakData.value.lastPracticeDate === yesterday) {
      streakData.value.currentStreak++
    } else if (streakData.value.lastPracticeDate !== today) {
      streakData.value.currentStreak = 1
    }

    streakData.value.longestStreak = Math.max(
      streakData.value.longestStreak,
      streakData.value.currentStreak
    )
    streakData.value.lastPracticeDate = today
  }

  function checkAchievements() {
    const progress = useProgressStore()
    const practice = usePracticeStore()

    for (const achievement of achievementDefs.value) {
      if (isUnlocked.value(achievement.id)) continue

      let met = false
      const { type, threshold, moduleId } = achievement.condition

      switch (type) {
        case 'practice_sessions':
          met = practice.practiceSessionCount >= threshold
          break
        case 'practice_minutes':
          met = practice.totalPracticeMinutes >= threshold
          break
        case 'streak_days':
          met = streakData.value.longestStreak >= threshold
          break
        case 'videos_watched':
          met = progress.totalVideosWatched >= threshold
          break
        case 'lessons_completed':
          met = progress.totalLessonsCompleted >= threshold
          break
        case 'units_completed':
          met = progress.totalUnitsCompleted >= threshold
          break
        case 'modules_completed':
          if (moduleId) {
            met = progress.completedModules.includes(moduleId)
          } else {
            met = progress.totalModulesCompleted >= threshold
          }
          break
        case 'guides_read':
          met = progress.totalGuidesRead >= threshold
          break
      }

      if (met) {
        unlockedAchievements.value[achievement.id] = {
          unlockedAt: new Date().toISOString(),
          notified: false,
        }
        pendingToast.value = achievement.id
      }
    }
  }

  function dismissToast() {
    if (pendingToast.value) {
      const unlock = unlockedAchievements.value[pendingToast.value]
      if (unlock) unlock.notified = true
    }
    pendingToast.value = null
  }

  return {
    achievementDefs, unlockedAchievements, streakData, pendingToast,
    isUnlocked, unlockedCount, totalAchievements, recentUnlocks, streakIsActive,
    loadAchievements, updateStreak, checkAchievements, dismissToast,
  }
}, {
  persist: {
    key: 'jazz-buddy-gamification',
    pick: ['unlockedAchievements', 'streakData'],
  },
})
