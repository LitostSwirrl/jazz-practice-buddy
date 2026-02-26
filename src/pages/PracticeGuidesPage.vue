<script setup lang="ts">
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'

const syllabus = useSyllabusStore()
const progress = useProgressStore()
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">Practice Guides</h1>
      <p class="text-jazz-smoke mt-1">20 topic-specific guides with structured 6-week routines</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="guide in syllabus.practiceGuides"
        :key="guide.slug"
        :to="{ name: 'guide-detail', params: { slug: guide.slug } }"
        class="group"
      >
        <BaseCard>
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-jazz-gold/10 flex items-center justify-center text-jazz-gold font-bold text-sm shrink-0">
              {{ String(guide.order).padStart(2, '0') }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-heading font-bold text-jazz-espresso group-hover:text-jazz-blue transition-colors">
                {{ guide.title }}
              </h3>
              <p class="text-xs text-jazz-smoke mt-1 line-clamp-2">{{ guide.overview.slice(0, 120) }}...</p>
              <div class="flex items-center gap-3 mt-2 text-[10px] text-jazz-smoke">
                <span v-if="guide.videoReferences.length > 0">
                  🎬 {{ guide.videoReferences.length }} videos
                </span>
                <span v-if="progress.isGuideRead(guide.slug)" class="text-jazz-green font-medium">✓ Read</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </router-link>
    </div>
  </div>
</template>
