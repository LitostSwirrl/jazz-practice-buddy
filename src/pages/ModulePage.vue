<script setup lang="ts">
import { computed } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseProgress from '@/components/shared/BaseProgress.vue'

const props = defineProps<{ moduleId: string }>()
const syllabus = useSyllabusStore()
const progress = useProgressStore()

const mod = computed(() => syllabus.getModuleById(props.moduleId))
const moduleProgress = computed(() => progress.moduleProgress(props.moduleId))
</script>

<template>
  <div v-if="mod">
    <!-- Breadcrumb -->
    <nav class="text-xs text-jazz-smoke mb-6 font-mono uppercase tracking-wider">
      <router-link to="/syllabus" class="hover:text-jazz-blue">Syllabus</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">Module {{ mod.id }}</span>
    </nav>

    <!-- Module Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-xs text-jazz-gold font-heading tracking-[0.15em] uppercase">Module {{ mod.id }}</span>
        <span class="text-[10px] px-2 py-0.5 bg-jazz-cream-dark text-jazz-smoke font-mono uppercase tracking-wider">{{ mod.level }}</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-heading text-jazz-espresso tracking-tight leading-none">{{ mod.title.toUpperCase() }}</h1>
      <div class="h-1 w-12 bg-jazz-gold mt-3 mb-3"></div>
      <p class="text-jazz-smoke">{{ mod.description }}</p>
      <div class="flex items-center gap-4 mt-3 text-xs text-jazz-smoke font-mono">
        <span>{{ mod.duration }}</span>
        <span>{{ mod.units.length }} units</span>
      </div>
      <div class="mt-4 max-w-md">
        <BaseProgress :percent="moduleProgress.percent" size="md" show-label>
          <template #label>
            <span class="text-jazz-espresso font-mono text-xs">{{ moduleProgress.completed }}/{{ moduleProgress.total }} items</span>
          </template>
        </BaseProgress>
      </div>
    </div>

    <!-- Units List -->
    <div class="space-y-0">
      <router-link
        v-for="(unit, idx) in mod.units"
        :key="unit.id"
        :to="{ name: 'unit', params: { moduleId: mod.id, unitId: unit.id } }"
        class="block group"
      >
        <div class="flex items-start gap-4 py-5 border-b-2 border-jazz-cream-dark hover:bg-jazz-cream/30 transition-colors px-2 -mx-2">
          <span class="font-heading text-3xl text-jazz-espresso/20 w-10 text-center shrink-0 leading-none pt-1">{{ idx + 1 }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <span class="text-[10px] text-jazz-smoke font-mono uppercase tracking-wider">Unit {{ unit.id }}</span>
              <span class="text-[10px] text-jazz-smoke font-mono">{{ unit.estimatedTime }}</span>
            </div>
            <h3 class="font-heading text-lg text-jazz-espresso group-hover:text-jazz-blue transition-colors tracking-wide">
              {{ unit.title.toUpperCase() }}
            </h3>
            <div class="flex items-center gap-4 mt-1 text-xs text-jazz-smoke font-mono">
              <span>{{ unit.learningObjectives.length }} objectives</span>
              <span>{{ unit.exercises.length }} exercises</span>
              <span v-if="unit.relatedGuideSlug" class="text-jazz-blue">Has guide</span>
            </div>
          </div>
          <svg class="w-5 h-5 text-jazz-smoke group-hover:text-jazz-blue transition-colors shrink-0 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Module Navigation -->
    <div class="flex justify-between mt-8">
      <router-link
        v-if="parseInt(mod.id) > 1"
        :to="{ name: 'module', params: { moduleId: String(parseInt(mod.id) - 1) } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        ← Module {{ parseInt(mod.id) - 1 }}
      </router-link>
      <div v-else />
      <router-link
        v-if="parseInt(mod.id) < 6"
        :to="{ name: 'module', params: { moduleId: String(parseInt(mod.id) + 1) } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        Module {{ parseInt(mod.id) + 1 }} →
      </router-link>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-16">
    <p class="text-5xl font-heading text-jazz-espresso mb-4">MODULE NOT FOUND</p>
    <p class="text-jazz-smoke mb-6">The module you're looking for doesn't exist.</p>
    <router-link to="/syllabus" class="px-6 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors">
      Back to Syllabus
    </router-link>
  </div>
</template>
