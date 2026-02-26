<script setup lang="ts">
import { ref } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const syllabus = useSyllabusStore()
const progress = useProgressStore()
const expandedModule = ref<string | null>(null)

function toggleModule(id: string) {
  expandedModule.value = expandedModule.value === id ? null : id
}

const levelColors: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-800',
  'Early Intermediate': 'bg-blue-100 text-blue-800',
  'Intermediate': 'bg-yellow-100 text-yellow-800',
  'Advanced Intermediate': 'bg-orange-100 text-orange-800',
  'Advanced': 'bg-red-100 text-red-800',
  'Ongoing': 'bg-purple-100 text-purple-800',
}
</script>

<template>
  <!-- Backdrop for mobile -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="$emit('close')"
  />

  <aside
    class="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-jazz-cream-dark overflow-y-auto transition-transform lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-4">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-jazz-smoke mb-3">Curriculum</h2>

      <div v-for="mod in syllabus.modules" :key="mod.id" class="mb-1">
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-jazz-cream transition-colors"
          :class="expandedModule === mod.id ? 'bg-jazz-cream' : ''"
          @click="toggleModule(mod.id)"
        >
          <span class="text-xs font-bold text-jazz-gold w-5">{{ mod.id }}</span>
          <span class="flex-1 truncate font-medium text-jazz-espresso">{{ mod.title }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="levelColors[mod.level] || 'bg-gray-100 text-gray-600'"
          >
            {{ progress.moduleProgress(mod.id).percent }}%
          </span>
          <svg
            class="w-4 h-4 text-jazz-smoke transition-transform"
            :class="expandedModule === mod.id ? 'rotate-90' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div v-if="expandedModule === mod.id" class="ml-7 mt-1 space-y-0.5">
          <router-link
            v-for="unit in mod.units"
            :key="unit.id"
            :to="{ name: 'unit', params: { moduleId: mod.id, unitId: unit.id } }"
            class="block px-3 py-1.5 rounded text-xs text-jazz-espresso hover:bg-jazz-cream-dark transition-colors truncate"
            @click="$emit('close')"
          >
            <span class="text-jazz-smoke">{{ unit.id }}</span>
            {{ unit.title }}
          </router-link>
        </div>
      </div>

      <hr class="my-4 border-jazz-cream-dark">

      <h2 class="text-xs font-semibold uppercase tracking-wider text-jazz-smoke mb-3">Practice Guides</h2>
      <router-link
        v-for="guide in syllabus.practiceGuides"
        :key="guide.slug"
        :to="{ name: 'guide-detail', params: { slug: guide.slug } }"
        class="block px-3 py-1.5 rounded text-xs text-jazz-espresso hover:bg-jazz-cream-dark transition-colors truncate"
        @click="$emit('close')"
      >
        <span class="text-jazz-smoke">{{ String(guide.order).padStart(2, '0') }}</span>
        {{ guide.title }}
      </router-link>
    </div>
  </aside>
</template>
