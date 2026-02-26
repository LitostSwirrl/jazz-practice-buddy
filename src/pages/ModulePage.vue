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
    <nav class="text-sm text-jazz-smoke mb-4">
      <router-link to="/syllabus" class="hover:text-jazz-blue">Syllabus</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">Module {{ mod.id }}: {{ mod.title }}</span>
    </nav>

    <!-- Module Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm text-jazz-gold font-bold">Module {{ mod.id }}</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-jazz-cream-dark text-jazz-smoke">{{ mod.level }}</span>
      </div>
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso mb-2">{{ mod.title }}</h1>
      <p class="text-jazz-smoke">{{ mod.description }}</p>
      <div class="flex items-center gap-4 mt-3 text-sm text-jazz-smoke">
        <span>{{ mod.duration }}</span>
        <span>{{ mod.units.length }} units</span>
      </div>
      <div class="mt-4 max-w-md">
        <BaseProgress :percent="moduleProgress.percent" size="md" show-label>
          <template #label>
            <span class="text-jazz-espresso font-medium">{{ moduleProgress.completed }}/{{ moduleProgress.total }} items</span>
          </template>
        </BaseProgress>
      </div>
    </div>

    <!-- Units List -->
    <div class="space-y-4">
      <router-link
        v-for="(unit, idx) in mod.units"
        :key="unit.id"
        :to="{ name: 'unit', params: { moduleId: mod.id, unitId: unit.id } }"
        class="block group"
      >
        <BaseCard>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-jazz-cream-dark flex items-center justify-center text-jazz-gold font-bold text-sm shrink-0">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-jazz-smoke">Unit {{ unit.id }}</span>
                <span class="text-xs text-jazz-smoke">&middot; {{ unit.estimatedTime }}</span>
              </div>
              <h3 class="font-heading font-bold text-jazz-espresso group-hover:text-jazz-blue transition-colors">
                {{ unit.title }}
              </h3>
              <div class="flex items-center gap-4 mt-2 text-xs text-jazz-smoke">
                <span>{{ unit.learningObjectives.length }} objectives</span>
                <span>{{ unit.exercises.length }} exercises</span>
                <span v-if="unit.relatedGuideSlug" class="text-jazz-blue">Has practice guide</span>
              </div>
            </div>
            <svg class="w-5 h-5 text-jazz-smoke group-hover:text-jazz-blue transition-colors shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </BaseCard>
      </router-link>
    </div>

    <!-- Module Navigation -->
    <div class="flex justify-between mt-8">
      <router-link
        v-if="parseInt(mod.id) > 1"
        :to="{ name: 'module', params: { moduleId: String(parseInt(mod.id) - 1) } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark rounded-lg transition-colors"
      >
        &larr; Module {{ parseInt(mod.id) - 1 }}
      </router-link>
      <div v-else />
      <router-link
        v-if="parseInt(mod.id) < 6"
        :to="{ name: 'module', params: { moduleId: String(parseInt(mod.id) + 1) } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark rounded-lg transition-colors"
      >
        Module {{ parseInt(mod.id) + 1 }} &rarr;
      </router-link>
    </div>
  </div>
</template>
