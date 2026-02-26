<script setup lang="ts">
import { computed } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import { useVideosStore } from '@/stores/videos'
import BaseCard from '@/components/shared/BaseCard.vue'
import type { Video } from '@/types'

const props = defineProps<{ moduleId: string; unitId: string }>()
const syllabus = useSyllabusStore()
const progress = useProgressStore()
const videosStore = useVideosStore()

const mod = computed(() => syllabus.getModuleById(props.moduleId))
const unit = computed(() => syllabus.getUnitById(props.moduleId, props.unitId))

// Find related videos using fuzzy search for all recommended video queries
const relatedVideos = computed(() => {
  if (!unit.value || !videosStore.isLoaded) return []

  const seen = new Set<string>()
  const results: Video[] = []

  for (const recVideo of unit.value.recommendedVideos) {
    const matches = videosStore.searchVideos(recVideo.query, 6)
    for (const video of matches) {
      if (!seen.has(video.id)) {
        seen.add(video.id)
        results.push(video)
      }
      if (results.length >= 8) break
    }
    if (results.length >= 8) break
  }

  return results
})

// Find all units for navigation
const allUnits = computed(() => {
  const units: { moduleId: string; unitId: string; title: string }[] = []
  for (const m of syllabus.modules) {
    for (const u of m.units) {
      units.push({ moduleId: m.id, unitId: u.id, title: u.title })
    }
  }
  return units
})

const currentIndex = computed(() =>
  allUnits.value.findIndex(u => u.unitId === props.unitId)
)
const prevUnit = computed(() => currentIndex.value > 0 ? allUnits.value[currentIndex.value - 1] : null)
const nextUnit = computed(() => currentIndex.value < allUnits.value.length - 1 ? allUnits.value[currentIndex.value + 1] : null)

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`
}
</script>

<template>
  <div v-if="unit && mod">
    <!-- Breadcrumb -->
    <nav class="text-sm text-jazz-smoke mb-4">
      <router-link to="/syllabus" class="hover:text-jazz-blue">Syllabus</router-link>
      <span class="mx-2">/</span>
      <router-link :to="{ name: 'module', params: { moduleId } }" class="hover:text-jazz-blue">Module {{ moduleId }}</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">{{ unit.title }}</span>
    </nav>

    <!-- Unit Header -->
    <div class="mb-8">
      <span class="text-sm text-jazz-gold font-bold">Unit {{ unit.id }}</span>
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso mt-1">{{ unit.title }}</h1>
      <p class="text-sm text-jazz-smoke mt-2">Estimated time: {{ unit.estimatedTime }}</p>
    </div>

    <!-- Learning Objectives -->
    <BaseCard class="mb-6">
      <h2 class="text-lg font-heading font-bold mb-3">Learning Objectives</h2>
      <div class="space-y-2">
        <label
          v-for="(obj, i) in unit.learningObjectives"
          :key="i"
          class="flex items-start gap-3 cursor-pointer group"
        >
          <input
            type="checkbox"
            :checked="progress.isLessonCompleted(`${unit.id}.obj.${i}`)"
            class="mt-0.5 w-4 h-4 rounded border-jazz-smoke-light text-jazz-gold focus:ring-jazz-gold"
            @change="progress.toggleLessonComplete(`${unit.id}.obj.${i}`)"
          >
          <span
            class="text-sm transition-colors"
            :class="progress.isLessonCompleted(`${unit.id}.obj.${i}`) ? 'text-jazz-smoke line-through' : 'text-jazz-espresso'"
          >
            {{ obj }}
          </span>
        </label>
      </div>
    </BaseCard>

    <!-- Core Concepts -->
    <BaseCard v-if="unit.coreConcepts.length > 0" class="mb-6">
      <h2 class="text-lg font-heading font-bold mb-3">Core Concepts</h2>
      <div class="space-y-3">
        <div v-for="concept in unit.coreConcepts" :key="concept.term" class="border-l-2 border-jazz-gold pl-3">
          <h3 class="font-semibold text-sm text-jazz-espresso">{{ concept.term }}</h3>
          <p class="text-sm text-jazz-smoke mt-0.5">{{ concept.description }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Recommended Videos -->
    <BaseCard class="mb-6">
      <h2 class="text-lg font-heading font-bold mb-3">Recommended Videos</h2>
      <div class="space-y-2 mb-4">
        <div
          v-for="ref in unit.recommendedVideos"
          :key="ref.query"
          class="flex items-center gap-2 text-sm"
        >
          <span class="text-xs px-1.5 py-0.5 rounded bg-jazz-cream-dark text-jazz-smoke">
            {{ ref.type === 'search' ? '🔍' : '📋' }}
          </span>
          <span class="text-jazz-espresso">{{ ref.query }}</span>
        </div>
      </div>

      <!-- Related videos from catalog -->
      <div v-if="relatedVideos.length > 0" class="mt-4">
        <h3 class="text-sm font-semibold text-jazz-smoke mb-2">From the catalog:</h3>
        <div class="grid sm:grid-cols-2 gap-2">
          <router-link
            v-for="v in relatedVideos"
            :key="v.id"
            :to="{ name: 'video-detail', params: { videoId: v.id } }"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-jazz-cream transition-colors"
          >
            <img
              :src="`https://img.youtube.com/vi/${v.id}/default.jpg`"
              :alt="v.title"
              class="w-16 h-12 object-cover rounded"
              loading="lazy"
            >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-jazz-espresso truncate">{{ v.title }}</p>
              <p class="text-[10px] text-jazz-smoke">{{ formatDuration(v.duration) }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </BaseCard>

    <!-- Practice Guide Link -->
    <BaseCard v-if="unit.relatedGuideSlug" class="mb-6">
      <router-link
        :to="{ name: 'guide-detail', params: { slug: unit.relatedGuideSlug } }"
        class="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <span class="text-2xl">📝</span>
        <div>
          <p class="text-sm font-semibold text-jazz-blue">Practice Guide Available</p>
          <p class="text-xs text-jazz-smoke">Detailed exercises and 6-week practice routine</p>
        </div>
      </router-link>
    </BaseCard>

    <!-- Practice Exercises -->
    <BaseCard class="mb-6">
      <h2 class="text-lg font-heading font-bold mb-3">Practice Exercises</h2>
      <div class="space-y-2">
        <label
          v-for="(ex, i) in unit.exercises"
          :key="i"
          class="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-jazz-cream/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="progress.isLessonCompleted(`${unit.id}.ex.${i}`)"
            class="mt-0.5 w-4 h-4 rounded border-jazz-smoke-light text-jazz-gold focus:ring-jazz-gold"
            @change="progress.toggleLessonComplete(`${unit.id}.ex.${i}`)"
          >
          <div class="flex-1">
            <span
              class="text-sm"
              :class="progress.isLessonCompleted(`${unit.id}.ex.${i}`) ? 'text-jazz-smoke line-through' : 'text-jazz-espresso'"
            >
              {{ ex.description }}
            </span>
          </div>
          <span class="text-xs text-jazz-smoke bg-jazz-cream-dark px-2 py-0.5 rounded-full shrink-0">
            {{ ex.dailyTime }}
          </span>
        </label>
      </div>
    </BaseCard>

    <!-- Assessment -->
    <BaseCard v-if="unit.assessment.length > 0" class="mb-6">
      <h2 class="text-lg font-heading font-bold mb-3">Assessment</h2>
      <ul class="space-y-2">
        <li v-for="item in unit.assessment" :key="item" class="flex items-start gap-2 text-sm text-jazz-espresso">
          <span class="text-jazz-gold mt-0.5">&#9654;</span>
          {{ item }}
        </li>
      </ul>
    </BaseCard>

    <!-- Unit Navigation -->
    <div class="flex justify-between">
      <router-link
        v-if="prevUnit"
        :to="{ name: 'unit', params: { moduleId: prevUnit.moduleId, unitId: prevUnit.unitId } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark rounded-lg transition-colors"
      >
        &larr; {{ prevUnit.unitId }}: {{ prevUnit.title }}
      </router-link>
      <div v-else />
      <router-link
        v-if="nextUnit"
        :to="{ name: 'unit', params: { moduleId: nextUnit.moduleId, unitId: nextUnit.unitId } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark rounded-lg transition-colors"
      >
        {{ nextUnit.unitId }}: {{ nextUnit.title }} &rarr;
      </router-link>
    </div>
  </div>
</template>
