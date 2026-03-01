<script setup lang="ts">
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseProgress from '@/components/shared/BaseProgress.vue'

const syllabus = useSyllabusStore()
const progress = useProgressStore()

const levelColors: Record<string, string> = {
  'Beginner': 'from-green-400 to-emerald-500',
  'Early Intermediate': 'from-blue-400 to-cyan-500',
  'Intermediate': 'from-yellow-400 to-amber-500',
  'Advanced Intermediate': 'from-orange-400 to-red-400',
  'Advanced': 'from-red-500 to-rose-600',
  'Ongoing': 'from-purple-400 to-violet-500',
}

const levelBg: Record<string, string> = {
  'Beginner': 'bg-green-50 text-green-700 border-green-200',
  'Early Intermediate': 'bg-blue-50 text-blue-700 border-blue-200',
  'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
  'Advanced Intermediate': 'bg-orange-50 text-orange-700 border-orange-200',
  'Advanced': 'bg-red-50 text-red-700 border-red-200',
  'Ongoing': 'bg-purple-50 text-purple-700 border-purple-200',
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">Course Syllabus</h1>
      <p class="font-heading italic text-jazz-smoke mt-1">6 progressive modules spanning 15-20 months of study</p>
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
            class="h-2 rounded-t-xl bg-gradient-to-r"
            :class="levelColors[mod.level] || 'from-gray-400 to-gray-500'"
          />
          <div class="p-5 relative">
            <span class="absolute top-3 right-4 text-5xl font-heading font-bold text-jazz-espresso/5 leading-none select-none">{{ mod.id }}</span>
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="text-sm text-jazz-gold font-bold">Module {{ mod.id }}</span>
                <h2 class="text-lg font-heading font-bold text-jazz-espresso group-hover:text-jazz-blue transition-colors">
                  {{ mod.title }}
                </h2>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full border font-medium"
                :class="levelBg[mod.level] || 'bg-gray-50 text-gray-600 border-gray-200'"
              >
                {{ mod.level }}
              </span>
            </div>

            <p class="text-sm text-jazz-smoke mb-3 line-clamp-2">{{ mod.description }}</p>

            <div class="flex items-center gap-4 text-xs text-jazz-smoke mb-3">
              <span>{{ mod.duration }}</span>
              <span>{{ mod.units.length }} units</span>
            </div>

            <BaseProgress :percent="progress.moduleProgress(mod.id).percent" size="sm" show-label>
              <template #label>
                <span class="text-jazz-smoke">Progress</span>
              </template>
            </BaseProgress>
          </div>
        </BaseCard>
      </router-link>
    </div>
  </div>
</template>
