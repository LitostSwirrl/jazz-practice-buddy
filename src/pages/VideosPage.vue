<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVideosStore } from '@/stores/videos'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import DifficultyBadge from '@/components/shared/DifficultyBadge.vue'

const videosStore = useVideosStore()
const progress = useProgressStore()

const displayCount = ref(48)

const displayedVideos = computed(() =>
  videosStore.filteredVideos.slice(0, displayCount.value)
)

const hasMore = computed(() =>
  displayCount.value < videosStore.filteredVideos.length
)

function loadMore() {
  displayCount.value += 48
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return m < 60 ? `${m}:${String(s).padStart(2, '0')}` : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function clearCategory() {
  videosStore.setFilter('categoryId', null)
  videosStore.setFilter('subCategoryId', null)
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">Video Catalog</h1>
      <p class="text-jazz-smoke mt-1">{{ videosStore.videos.length }} lessons from Jens Larsen</p>
    </div>

    <!-- Filters -->
    <BaseCard class="mb-6">
      <div class="flex flex-wrap gap-3">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <input
            :value="videosStore.filters.searchQuery"
            @input="videosStore.setFilter('searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search videos..."
            class="w-full px-3 py-2 rounded-lg border border-jazz-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-jazz-gold/50 focus:border-jazz-gold"
          >
        </div>

        <!-- Category -->
        <select
          :value="videosStore.filters.categoryId || ''"
          @change="videosStore.setFilter('categoryId', ($event.target as HTMLSelectElement).value || null); videosStore.setFilter('subCategoryId', null)"
          class="px-3 py-2 rounded-lg border border-jazz-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-jazz-gold/50"
        >
          <option value="">All Categories</option>
          <option v-for="cat in videosStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }} ({{ cat.videoCount }})
          </option>
        </select>

        <!-- Sub-category (when a category is selected) -->
        <select
          v-if="videosStore.filters.categoryId"
          :value="videosStore.filters.subCategoryId || ''"
          @change="videosStore.setFilter('subCategoryId', ($event.target as HTMLSelectElement).value || null)"
          class="px-3 py-2 rounded-lg border border-jazz-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-jazz-gold/50"
        >
          <option value="">All Subcategories</option>
          <option
            v-for="sub in videosStore.categories.find(c => c.id === videosStore.filters.categoryId)?.subcategories"
            :key="sub.id"
            :value="sub.id"
          >
            {{ sub.name }} ({{ sub.videoCount }})
          </option>
        </select>

        <!-- Difficulty -->
        <select
          @change="
            const v = ($event.target as HTMLSelectElement).value;
            if (v === 'all') videosStore.setFilter('difficulty', [1, 5]);
            else videosStore.setFilter('difficulty', [parseInt(v), parseInt(v)]);
          "
          class="px-3 py-2 rounded-lg border border-jazz-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-jazz-gold/50"
        >
          <option value="all">All Levels</option>
          <option value="1">Beginner (1)</option>
          <option value="2">Easy (2)</option>
          <option value="3">Intermediate (3)</option>
          <option value="4">Advanced (4)</option>
          <option value="5">Expert (5)</option>
        </select>

        <!-- Sort -->
        <select
          :value="videosStore.filters.sortBy"
          @change="videosStore.setFilter('sortBy', ($event.target as HTMLSelectElement).value as 'title')"
          class="px-3 py-2 rounded-lg border border-jazz-cream-dark bg-white text-sm focus:outline-none focus:ring-2 focus:ring-jazz-gold/50"
        >
          <option value="title">Sort by Title</option>
          <option value="views">Sort by Views</option>
          <option value="duration">Sort by Duration</option>
          <option value="difficulty">Sort by Difficulty</option>
        </select>
      </div>

      <!-- Active filters -->
      <div v-if="videosStore.filters.searchQuery || videosStore.filters.categoryId" class="flex items-center gap-2 mt-3 text-xs">
        <span class="text-jazz-smoke">Active:</span>
        <span v-if="videosStore.filters.categoryId" class="px-2 py-0.5 bg-jazz-gold/10 text-jazz-brass rounded-full flex items-center gap-1">
          {{ videosStore.categories.find(c => c.id === videosStore.filters.categoryId)?.name }}
          <button @click="clearCategory" class="hover:text-jazz-red">&times;</button>
        </span>
        <span class="text-jazz-smoke">{{ videosStore.filteredVideos.length }} results</span>
      </div>
    </BaseCard>

    <!-- Video Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <router-link
        v-for="video in displayedVideos"
        :key="video.id"
        :to="{ name: 'video-detail', params: { videoId: video.id } }"
        class="group"
      >
        <BaseCard :padding="false">
          <!-- Thumbnail -->
          <div class="relative">
            <img
              :src="`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`"
              :alt="video.title"
              class="w-full aspect-video object-cover rounded-t-xl"
              loading="lazy"
            >
            <span class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 text-white text-xs rounded">
              {{ formatDuration(video.duration) }}
            </span>
            <span
              v-if="progress.isVideoWatched(video.id)"
              class="absolute top-2 right-2 w-6 h-6 bg-jazz-green text-white rounded-full flex items-center justify-center text-xs"
            >
              ✓
            </span>
          </div>
          <div class="p-3">
            <h3 class="text-sm font-medium text-jazz-espresso group-hover:text-jazz-blue transition-colors line-clamp-2 mb-2">
              {{ video.title }}
            </h3>
            <div class="flex items-center justify-between">
              <span class="text-[10px] px-1.5 py-0.5 bg-jazz-cream-dark text-jazz-smoke rounded-full truncate max-w-[60%]">
                {{ video.categoryName }}
              </span>
              <DifficultyBadge :level="video.level" />
            </div>
          </div>
        </BaseCard>
      </router-link>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center mt-8">
      <button
        @click="loadMore"
        class="px-6 py-2.5 bg-jazz-espresso text-jazz-cream rounded-lg hover:bg-jazz-espresso-light transition-colors text-sm font-medium"
      >
        Load More ({{ videosStore.filteredVideos.length - displayCount }} remaining)
      </button>
    </div>
  </div>
</template>
