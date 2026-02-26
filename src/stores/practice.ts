import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfWeek, isWithinInterval, subWeeks } from 'date-fns'
import type { PracticeLogEntry } from '@/types'

export const usePracticeStore = defineStore('practice', () => {
  const logs = ref<PracticeLogEntry[]>([])

  const totalPracticeMinutes = computed(() =>
    logs.value.reduce((sum, l) => sum + l.duration, 0)
  )

  const practiceMinutesToday = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return logs.value.filter(l => l.date === today).reduce((sum, l) => sum + l.duration, 0)
  })

  const practiceSessionCount = computed(() => logs.value.length)

  const recentLogs = computed(() => (n: number) =>
    [...logs.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
  )

  const weeklyPracticeData = computed(() => {
    const weeks: { week: string; minutes: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const weekLabel = format(weekStart, 'MMM d')
      const minutes = logs.value
        .filter(l => {
          const d = new Date(l.date)
          return isWithinInterval(d, { start: weekStart, end: weekEnd })
        })
        .reduce((sum, l) => sum + l.duration, 0)
      weeks.push({ week: weekLabel, minutes })
    }
    return weeks
  })

  function addLogEntry(entry: Omit<PracticeLogEntry, 'id'>) {
    logs.value.push({
      ...entry,
      id: crypto.randomUUID(),
    })
  }

  function deleteLogEntry(id: string) {
    const idx = logs.value.findIndex(l => l.id === id)
    if (idx >= 0) logs.value.splice(idx, 1)
  }

  return {
    logs,
    totalPracticeMinutes, practiceMinutesToday, practiceSessionCount,
    recentLogs, weeklyPracticeData,
    addLogEntry, deleteLogEntry,
  }
}, {
  persist: {
    key: 'jazz-buddy-practice',
  },
})
