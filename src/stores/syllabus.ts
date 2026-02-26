import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Module, PracticeGuide } from '@/types'

export const useSyllabusStore = defineStore('syllabus', () => {
  const modules = ref<Module[]>([])
  const practiceGuides = ref<PracticeGuide[]>([])
  const isLoaded = ref(false)

  const getModuleById = computed(() => (id: string) =>
    modules.value.find(m => m.id === id)
  )

  const getUnitById = computed(() => (moduleId: string, unitId: string) => {
    const mod = modules.value.find(m => m.id === moduleId)
    return mod?.units.find(u => u.id === unitId)
  })

  const getGuideBySlug = computed(() => (slug: string) =>
    practiceGuides.value.find(g => g.slug === slug)
  )

  const totalLessons = computed(() =>
    modules.value.reduce((sum, m) =>
      sum + m.units.reduce((s, u) => s + u.exercises.length + u.learningObjectives.length, 0), 0)
  )

  const totalUnits = computed(() =>
    modules.value.reduce((sum, m) => sum + m.units.length, 0)
  )

  async function loadSyllabus() {
    if (isLoaded.value) return
    const [syllabusData, guidesData] = await Promise.all([
      import('@/data/syllabus.json').then(m => m.default),
      import('@/data/practice-guides.json').then(m => m.default),
    ])
    modules.value = syllabusData as Module[]
    practiceGuides.value = guidesData as PracticeGuide[]
    isLoaded.value = true
  }

  return {
    modules, practiceGuides, isLoaded,
    getModuleById, getUnitById, getGuideBySlug,
    totalLessons, totalUnits,
    loadSyllabus,
  }
})
