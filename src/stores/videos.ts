import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import type { Video, TopCategory, VideoFilters, TranscriptSummary } from '@/types'

export const useVideosStore = defineStore('videos', () => {
  const videos = ref<Video[]>([])
  const categories = ref<TopCategory[]>([])
  const transcriptSummaries = ref<Record<string, TranscriptSummary>>({})
  const isLoaded = ref(false)
  let fuseIndex: Fuse<Video> | null = null

  const filters = ref<VideoFilters>({
    searchQuery: '',
    categoryId: null,
    subCategoryId: null,
    difficulty: [1, 5],
    sortBy: 'title',
    sortOrder: 'asc',
  })

  const filteredVideos = computed(() => {
    let result = videos.value

    if (filters.value.searchQuery && fuseIndex) {
      const searchResults = fuseIndex.search(filters.value.searchQuery)
      result = searchResults.map(r => r.item)
    }

    if (filters.value.subCategoryId) {
      result = result.filter(v => v.category === filters.value.subCategoryId)
    } else if (filters.value.categoryId) {
      result = result.filter(v => v.category.startsWith(filters.value.categoryId + '.'))
    }

    const [minDiff, maxDiff] = filters.value.difficulty
    result = result.filter(v => v.level >= minDiff && v.level <= maxDiff)

    if (!filters.value.searchQuery) {
      const sortBy = filters.value.sortBy
      const order = filters.value.sortOrder === 'asc' ? 1 : -1
      result = [...result].sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title) * order
        if (sortBy === 'views') return (a.view_count - b.view_count) * order
        if (sortBy === 'duration') return (a.duration - b.duration) * order
        if (sortBy === 'difficulty') return (a.level - b.level) * order
        return 0
      })
    }

    return result
  })

  const videoById = computed(() => (id: string) =>
    videos.value.find(v => v.id === id)
  )

  const videosByCategory = computed(() => (catId: string) =>
    videos.value.filter(v => v.category === catId || v.category.startsWith(catId + '.'))
  )

  const hasTranscript = computed(() => (videoId: string) =>
    videoId in transcriptSummaries.value
  )

  function setFilter<K extends keyof VideoFilters>(key: K, value: VideoFilters[K]) {
    filters.value[key] = value
  }

  function resetFilters() {
    filters.value = {
      searchQuery: '',
      categoryId: null,
      subCategoryId: null,
      difficulty: [1, 5],
      sortBy: 'title',
      sortOrder: 'asc',
    }
  }

  async function loadVideos() {
    if (isLoaded.value) return
    const [videosData, catsData, transcriptsData] = await Promise.all([
      import('@/data/videos.json').then(m => m.default),
      import('@/data/categories.json').then(m => m.default),
      import('@/data/transcript-summaries.json').then(m => m.default),
    ])
    videos.value = videosData as Video[]
    categories.value = catsData as TopCategory[]
    transcriptSummaries.value = transcriptsData as Record<string, TranscriptSummary>

    fuseIndex = new Fuse(videos.value, {
      keys: ['title', 'categoryName'],
      threshold: 0.3,
      includeScore: true,
    })
    isLoaded.value = true
  }

  return {
    videos, categories, transcriptSummaries, isLoaded, filters,
    filteredVideos, videoById, videosByCategory, hasTranscript,
    setFilter, resetFilters, loadVideos,
  }
})
