import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSyllabusStore } from './syllabus'

export const useProgressStore = defineStore('progress', () => {
  const completedLessons = ref<string[]>([])
  const completedUnits = ref<string[]>([])
  const completedModules = ref<string[]>([])
  const watchedVideos = ref<string[]>([])
  const readGuides = ref<string[]>([])
  const currentModuleId = ref('1')
  const currentUnitId = ref('1.1')

  const isLessonCompleted = computed(() => (key: string) =>
    completedLessons.value.includes(key)
  )

  const isVideoWatched = computed(() => (videoId: string) =>
    watchedVideos.value.includes(videoId)
  )

  const isGuideRead = computed(() => (slug: string) =>
    readGuides.value.includes(slug)
  )

  const totalVideosWatched = computed(() => watchedVideos.value.length)
  const totalLessonsCompleted = computed(() => completedLessons.value.length)
  const totalUnitsCompleted = computed(() => completedUnits.value.length)
  const totalModulesCompleted = computed(() => completedModules.value.length)
  const totalGuidesRead = computed(() => readGuides.value.length)

  const moduleProgress = computed(() => (moduleId: string) => {
    const syllabus = useSyllabusStore()
    const mod = syllabus.getModuleById(moduleId)
    if (!mod) return { completed: 0, total: 0, percent: 0 }

    let total = 0
    let completed = 0
    for (const unit of mod.units) {
      const items = unit.exercises.length + unit.learningObjectives.length
      total += items
      for (let i = 0; i < unit.learningObjectives.length; i++) {
        if (completedLessons.value.includes(`${unit.id}.obj.${i}`)) completed++
      }
      for (let i = 0; i < unit.exercises.length; i++) {
        if (completedLessons.value.includes(`${unit.id}.ex.${i}`)) completed++
      }
    }
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })

  const overallProgress = computed(() => {
    const syllabus = useSyllabusStore()
    let total = 0, completed = 0
    for (const mod of syllabus.modules) {
      const p = moduleProgress.value(mod.id)
      total += p.total
      completed += p.completed
    }
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })

  function toggleLessonComplete(key: string) {
    const idx = completedLessons.value.indexOf(key)
    if (idx >= 0) {
      completedLessons.value.splice(idx, 1)
    } else {
      completedLessons.value.push(key)
    }
  }

  function toggleVideoWatched(videoId: string) {
    const idx = watchedVideos.value.indexOf(videoId)
    if (idx >= 0) {
      watchedVideos.value.splice(idx, 1)
    } else {
      watchedVideos.value.push(videoId)
    }
  }

  function markGuideRead(slug: string) {
    if (!readGuides.value.includes(slug)) {
      readGuides.value.push(slug)
    }
  }

  function setCurrentPosition(moduleId: string, unitId: string) {
    currentModuleId.value = moduleId
    currentUnitId.value = unitId
  }

  return {
    completedLessons, completedUnits, completedModules,
    watchedVideos, readGuides, currentModuleId, currentUnitId,
    isLessonCompleted, isVideoWatched, isGuideRead,
    totalVideosWatched, totalLessonsCompleted, totalUnitsCompleted,
    totalModulesCompleted, totalGuidesRead,
    moduleProgress, overallProgress,
    toggleLessonComplete, toggleVideoWatched, markGuideRead, setCurrentPosition,
  }
}, {
  persist: {
    key: 'jazz-buddy-progress',
  },
})
