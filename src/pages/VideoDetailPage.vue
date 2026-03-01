<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVideosStore } from '@/stores/videos'
import { useProgressStore } from '@/stores/progress'
import { useGamificationStore } from '@/stores/gamification'
import BaseCard from '@/components/shared/BaseCard.vue'
import DifficultyBadge from '@/components/shared/DifficultyBadge.vue'
import { Check } from 'lucide-vue-next'

const props = defineProps<{ videoId: string }>()
const videosStore = useVideosStore()
const progress = useProgressStore()
const gamification = useGamificationStore()

const video = computed(() => videosStore.videoById(props.videoId))
const playerLoaded = ref(false)

const transcript = computed(() =>
  videosStore.transcriptSummaries[props.videoId]
)

const showTranscript = ref(false)

const relatedVideos = computed(() => {
  if (!video.value) return []
  return videosStore.videos
    .filter(v => v.category === video.value!.category && v.id !== props.videoId)
    .slice(0, 6)
})

function toggleWatched() {
  progress.toggleVideoWatched(props.videoId)
  gamification.updateStreak()
  gamification.checkAchievements()
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatViews(n: number): string {
  if (n === 0) return 'N/A'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<template>
  <div v-if="video">
    <!-- Breadcrumb -->
    <nav class="text-sm text-jazz-smoke mb-4">
      <router-link to="/videos" class="hover:text-jazz-blue">Videos</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso truncate">{{ video.title }}</span>
    </nav>

    <!-- Player -->
    <div class="mb-6">
      <div class="relative w-full aspect-video bg-jazz-espresso rounded-xl overflow-hidden">
        <iframe
          v-if="playerLoaded"
          :src="`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <button
          v-else
          class="absolute inset-0 flex items-center justify-center group cursor-pointer"
          @click="playerLoaded = true"
        >
          <img
            :src="`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`"
            :alt="video.title"
            class="absolute inset-0 w-full h-full object-cover"
          >
          <div class="relative z-10 w-16 h-16 bg-jazz-red/90 rounded-full flex items-center justify-center group-hover:bg-jazz-red transition-colors shadow-lg">
            <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Video Info -->
    <BaseCard class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-xl font-heading font-bold text-jazz-espresso mb-2">{{ video.title }}</h1>
          <div class="flex flex-wrap items-center gap-3 text-sm text-jazz-smoke">
            <span class="px-2 py-0.5 bg-jazz-cream-dark rounded-full text-xs">{{ video.categoryName }}</span>
            <DifficultyBadge :level="video.level" />
            <span>{{ formatDuration(video.duration) }}</span>
            <span v-if="video.view_count">{{ formatViews(video.view_count) }} views</span>
          </div>
        </div>
        <button
          @click="toggleWatched"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          :class="progress.isVideoWatched(video.id)
            ? 'bg-jazz-green text-white'
            : 'bg-jazz-cream-dark text-jazz-espresso hover:bg-jazz-gold hover:text-white'"
        >
          <template v-if="progress.isVideoWatched(video.id)"><Check class="w-4 h-4 inline" /> Watched</template>
          <template v-else>Mark as Watched</template>
        </button>
      </div>
    </BaseCard>

    <!-- Transcript Summary -->
    <BaseCard v-if="transcript" class="mb-6">
      <button
        class="w-full flex items-center justify-between"
        @click="showTranscript = !showTranscript"
      >
        <h2 class="text-lg font-heading font-bold">Transcript Summary</h2>
        <svg
          class="w-5 h-5 text-jazz-smoke transition-transform"
          :class="showTranscript ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="showTranscript" class="mt-3 text-sm text-jazz-espresso leading-relaxed max-h-96 overflow-y-auto">
        {{ transcript.text }}
      </div>
    </BaseCard>

    <!-- Related Videos -->
    <div v-if="relatedVideos.length > 0">
      <h2 class="text-lg font-heading font-bold mb-3">Related Videos</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="v in relatedVideos"
          :key="v.id"
          :to="{ name: 'video-detail', params: { videoId: v.id } }"
          class="group"
        >
          <BaseCard :padding="false">
            <img
              :src="`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`"
              :alt="v.title"
              class="w-full aspect-video object-cover rounded-t-xl"
              loading="lazy"
            >
            <div class="p-3">
              <h3 class="text-sm font-medium text-jazz-espresso group-hover:text-jazz-blue line-clamp-2">
                {{ v.title }}
              </h3>
            </div>
          </BaseCard>
        </router-link>
      </div>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-16">
    <p class="text-2xl font-heading font-bold text-jazz-espresso mb-2">Video not found</p>
    <p class="text-jazz-smoke mb-6">The video you're looking for doesn't exist.</p>
    <router-link to="/videos" class="px-4 py-2 bg-jazz-blue text-white rounded-lg hover:bg-jazz-blue/90 transition-colors">
      Back to Videos
    </router-link>
  </div>
</template>
