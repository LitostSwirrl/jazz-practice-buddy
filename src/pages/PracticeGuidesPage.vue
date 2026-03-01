<script setup lang="ts">
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import { Play, CheckCircle2 } from 'lucide-vue-next'

const syllabus = useSyllabusStore()
const progress = useProgressStore()
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-heading text-jazz-espresso tracking-tight leading-none">PRACTICE GUIDES</h1>
      <div class="h-1 w-16 bg-jazz-gold mt-3 mb-2"></div>
      <p class="text-jazz-smoke font-mono text-sm">20 topic-specific guides with structured 6-week routines</p>
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
            <span class="font-heading text-3xl text-jazz-espresso/20 w-8 text-center shrink-0 leading-none">
              {{ String(guide.order).padStart(2, '0') }}
            </span>
            <div class="flex-1 min-w-0">
              <h3 class="font-heading text-lg text-jazz-espresso group-hover:text-jazz-blue transition-colors tracking-wide">
                {{ guide.title.toUpperCase() }}
              </h3>
              <p class="text-xs text-jazz-smoke mt-1 line-clamp-2">{{ guide.overview.slice(0, 120) }}...</p>
              <div class="flex items-center gap-3 mt-2 text-[10px] text-jazz-smoke font-mono uppercase tracking-wider">
                <span v-if="guide.videoReferences.length > 0" class="flex items-center gap-1">
                  <Play class="w-3 h-3" /> {{ guide.videoReferences.length }} videos
                </span>
                <span v-if="progress.isGuideRead(guide.slug)" class="text-jazz-green font-medium flex items-center gap-0.5">
                  <CheckCircle2 class="w-3 h-3" /> Read
                </span>
              </div>
            </div>
          </div>
        </BaseCard>
      </router-link>
    </div>
  </div>
</template>
