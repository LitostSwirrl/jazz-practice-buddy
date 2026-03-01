<script setup lang="ts">
import { computed } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import { useVideosStore } from '@/stores/videos'
import BaseCard from '@/components/shared/BaseCard.vue'
import type { Video } from '@/types'
import { BookOpen } from 'lucide-vue-next'

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
    <nav class="text-xs text-jazz-smoke mb-6 font-mono uppercase tracking-wider">
      <router-link to="/syllabus" class="hover:text-jazz-blue">Syllabus</router-link>
      <span class="mx-2">/</span>
      <router-link :to="{ name: 'module', params: { moduleId } }" class="hover:text-jazz-blue">Module {{ moduleId }}</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">{{ unit.id }}</span>
    </nav>

    <!-- Unit Header -->
    <div class="mb-8">
      <span class="text-xs text-jazz-gold font-heading tracking-[0.15em] uppercase">Unit {{ unit.id }}</span>
      <h1 class="text-3xl sm:text-4xl font-heading text-jazz-espresso mt-1 tracking-tight leading-none">{{ unit.title.toUpperCase() }}</h1>
      <div class="h-1 w-12 bg-jazz-gold mt-3 mb-2"></div>
      <p class="text-xs text-jazz-smoke font-mono">Estimated time: {{ unit.estimatedTime }}</p>
    </div>

    <!-- Learning Objectives -->
    <div class="mb-8">
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">LEARNING OBJECTIVES</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="space-y-2">
        <label
          v-for="(obj, i) in unit.learningObjectives"
          :key="i"
          class="flex items-start gap-3 cursor-pointer group py-1"
        >
          <input
            type="checkbox"
            :checked="progress.isLessonCompleted(`${unit.id}.obj.${i}`)"
            class="mt-0.5 w-4 h-4 border-2 border-jazz-espresso text-jazz-gold focus:ring-jazz-gold accent-jazz-gold"
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
    </div>

    <!-- Core Concepts -->
    <div v-if="unit.coreConcepts.length > 0" class="mb-8">
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">CORE CONCEPTS</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="space-y-4">
        <div v-for="concept in unit.coreConcepts" :key="concept.term" class="border-l-4 border-jazz-espresso pl-4">
          <h3 class="font-heading text-lg text-jazz-espresso tracking-wide">{{ concept.term.toUpperCase() }}</h3>
          <p class="text-sm text-jazz-smoke mt-0.5">{{ concept.description }}</p>
        </div>
      </div>
    </div>

    <!-- Recommended Videos -->
    <div v-if="relatedVideos.length > 0" class="mb-8">
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">RECOMMENDED VIDEOS</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="grid sm:grid-cols-2 gap-2">
        <router-link
          v-for="v in relatedVideos"
          :key="v.id"
          :to="{ name: 'video-detail', params: { videoId: v.id } }"
          class="flex items-center gap-2 p-2 hover:bg-jazz-cream transition-colors"
        >
          <img
            :src="`https://img.youtube.com/vi/${v.id}/default.jpg`"
            :alt="v.title"
            class="w-16 h-12 object-cover"
            loading="lazy"
          >
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-jazz-espresso truncate">{{ v.title }}</p>
            <p class="text-[10px] text-jazz-smoke font-mono">{{ formatDuration(v.duration) }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Practice Guide Link -->
    <BaseCard v-if="unit.relatedGuideSlug" variant="warm" class="mb-8">
      <router-link
        :to="{ name: 'guide-detail', params: { slug: unit.relatedGuideSlug } }"
        class="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <BookOpen class="w-6 h-6 text-jazz-blue shrink-0" />
        <div>
          <p class="text-sm font-heading text-jazz-espresso uppercase tracking-wide">Practice Guide Available</p>
          <p class="text-xs text-jazz-smoke">Detailed exercises and 6-week practice routine</p>
        </div>
      </router-link>
    </BaseCard>

    <!-- Practice Exercises -->
    <div class="mb-8">
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">PRACTICE EXERCISES</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="space-y-0">
        <label
          v-for="(ex, i) in unit.exercises"
          :key="i"
          class="flex items-start gap-3 cursor-pointer py-3 border-b border-jazz-cream-dark last:border-0 hover:bg-jazz-cream/30 transition-colors px-2 -mx-2"
        >
          <input
            type="checkbox"
            :checked="progress.isLessonCompleted(`${unit.id}.ex.${i}`)"
            class="mt-0.5 w-4 h-4 border-2 border-jazz-espresso text-jazz-gold focus:ring-jazz-gold accent-jazz-gold"
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
          <span class="text-[10px] text-jazz-smoke bg-jazz-cream-dark px-2 py-0.5 font-mono shrink-0">
            {{ ex.dailyTime }}
          </span>
        </label>
      </div>
    </div>

    <!-- Assessment -->
    <div v-if="unit.assessment.length > 0" class="mb-8">
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">ASSESSMENT</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <ul class="space-y-2">
        <li v-for="item in unit.assessment" :key="item" class="flex items-start gap-3 text-sm text-jazz-espresso">
          <span class="text-jazz-gold font-heading text-lg leading-none mt-0.5">→</span>
          {{ item }}
        </li>
      </ul>
    </div>

    <!-- Unit Navigation -->
    <div class="h-[3px] bg-jazz-espresso mb-6"></div>
    <div class="flex justify-between">
      <router-link
        v-if="prevUnit"
        :to="{ name: 'unit', params: { moduleId: prevUnit.moduleId, unitId: prevUnit.unitId } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        ← {{ prevUnit.unitId }}
      </router-link>
      <div v-else />
      <router-link
        v-if="nextUnit"
        :to="{ name: 'unit', params: { moduleId: nextUnit.moduleId, unitId: nextUnit.unitId } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        {{ nextUnit.unitId }} →
      </router-link>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-16">
    <p class="text-4xl font-heading text-jazz-espresso mb-4">UNIT NOT FOUND</p>
    <p class="text-jazz-smoke mb-6">The unit you're looking for doesn't exist.</p>
    <router-link :to="{ name: 'module', params: { moduleId } }" class="px-6 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors">
      Back to Module
    </router-link>
  </div>
</template>
