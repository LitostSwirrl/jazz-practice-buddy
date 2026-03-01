<script setup lang="ts">
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseProgress from '@/components/shared/BaseProgress.vue'

const syllabus = useSyllabusStore()
const progress = useProgressStore()

const levelColors: Record<string, string> = {
  'Beginner': 'bg-jazz-blue',
  'Early Intermediate': 'bg-jazz-blue',
  'Intermediate': 'bg-jazz-smoke',
  'Advanced Intermediate': 'bg-jazz-gold',
  'Advanced': 'bg-jazz-gold',
  'Ongoing': 'bg-jazz-espresso',
}

const levelBg: Record<string, string> = {
  'Beginner': 'bg-jazz-blue/10 text-jazz-blue',
  'Early Intermediate': 'bg-jazz-blue/10 text-jazz-blue',
  'Intermediate': 'bg-jazz-smoke/10 text-jazz-smoke',
  'Advanced Intermediate': 'bg-jazz-gold/10 text-jazz-gold',
  'Advanced': 'bg-jazz-gold/10 text-jazz-gold',
  'Ongoing': 'bg-jazz-espresso/10 text-jazz-espresso',
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-heading text-jazz-espresso tracking-tight leading-none">SYLLABUS</h1>
      <div class="h-1 w-16 bg-jazz-gold mt-3 mb-2"></div>
      <p class="text-jazz-smoke">6 progressive modules spanning 15–20 months of study</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <router-link
        v-for="mod in syllabus.modules"
        :key="mod.id"
        :to="{ name: 'module', params: { moduleId: mod.id } }"
        class="block group"
      >
        <BaseCard :padding="false">
          <div
            class="h-2"
            :class="levelColors[mod.level] || 'bg-gray-400'"
          />
          <div class="p-5 relative">
            <span class="absolute top-2 right-4 text-7xl font-heading text-jazz-espresso/[0.04] leading-none select-none">{{ mod.id }}</span>
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="text-xs text-jazz-gold font-heading tracking-[0.15em] uppercase">Module {{ mod.id }}</span>
                <h2 class="text-xl font-heading text-jazz-espresso group-hover:text-jazz-blue transition-colors tracking-wide">
                  {{ mod.title }}
                </h2>
              </div>
              <span
                class="text-[10px] px-2 py-1 font-mono uppercase tracking-wider"
                :class="levelBg[mod.level] || 'bg-gray-100 text-gray-600'"
              >
                {{ mod.level }}
              </span>
            </div>

            <p class="text-sm text-jazz-smoke mb-3 line-clamp-2">{{ mod.description }}</p>

            <div class="flex items-center gap-4 text-xs text-jazz-smoke font-mono mb-3">
              <span>{{ mod.duration }}</span>
              <span>{{ mod.units.length }} units</span>
            </div>

            <BaseProgress :percent="progress.moduleProgress(mod.id).percent" size="sm" show-label>
              <template #label>
                <span class="text-jazz-smoke font-mono">Progress</span>
              </template>
            </BaseProgress>
          </div>
        </BaseCard>
      </router-link>
    </div>
  </div>
</template>
