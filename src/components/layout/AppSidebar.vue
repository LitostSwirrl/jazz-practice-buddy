<script setup lang="ts">
import { ref } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import StaffDivider from '@/components/shared/StaffDivider.vue'
import { ChevronRight } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const syllabus = useSyllabusStore()
const progress = useProgressStore()
const expandedModule = ref<string | null>(null)

function toggleModule(id: string) {
  expandedModule.value = expandedModule.value === id ? null : id
}

const levelColors: Record<string, string> = {
  'Beginner': 'bg-jazz-blue/10 text-jazz-blue',
  'Early Intermediate': 'bg-jazz-blue/10 text-jazz-blue',
  'Intermediate': 'bg-jazz-smoke/10 text-jazz-smoke',
  'Advanced Intermediate': 'bg-jazz-gold/10 text-jazz-gold',
  'Advanced': 'bg-jazz-gold/10 text-jazz-gold',
  'Ongoing': 'bg-jazz-espresso/10 text-jazz-espresso',
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
    class="fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-white border-r-2 border-jazz-espresso overflow-y-auto transition-transform lg:translate-x-0 flex flex-col"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-4 flex-1">
      <h2 class="text-sm font-heading tracking-[0.2em] text-jazz-espresso mb-3 pb-2 border-b-2 border-jazz-espresso">CURRICULUM</h2>

      <div v-for="mod in syllabus.modules" :key="mod.id" class="mb-1">
        <button
          class="w-full flex items-center gap-2 px-2 py-2 text-left text-sm hover:bg-jazz-cream transition-colors"
          :class="expandedModule === mod.id ? 'bg-jazz-cream' : ''"
          @click="toggleModule(mod.id)"
        >
          <span class="font-heading text-xl text-jazz-espresso w-6 text-center">{{ mod.id }}</span>
          <span class="flex-1 truncate text-jazz-espresso text-xs">{{ mod.title }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 font-mono tracking-wide"
            :class="levelColors[mod.level] || 'bg-gray-100 text-gray-600'"
          >
            {{ progress.moduleProgress(mod.id).percent }}%
          </span>
          <ChevronRight
            class="w-3 h-3 text-jazz-smoke transition-transform"
            :class="expandedModule === mod.id ? 'rotate-90' : ''"
          />
        </button>

        <!-- Mini progress bar -->
        <div class="h-[2px] bg-jazz-cream-dark mx-2 mt-0.5">
          <div
            class="h-full bg-jazz-gold transition-all duration-500"
            :style="{ width: progress.moduleProgress(mod.id).percent + '%' }"
          ></div>
        </div>

        <div v-if="expandedModule === mod.id" class="ml-8 mt-1 space-y-0.5 border-l-2 border-jazz-espresso/20 pl-3">
          <router-link
            v-for="unit in mod.units"
            :key="unit.id"
            :to="{ name: 'unit', params: { moduleId: mod.id, unitId: unit.id } }"
            class="block px-2 py-1 text-xs text-jazz-espresso hover:bg-jazz-cream transition-colors"
            @click="$emit('close')"
          >
            <span class="text-jazz-smoke font-mono text-[10px]">{{ unit.id }}</span>
            {{ unit.title }}
          </router-link>
        </div>
      </div>

      <StaffDivider />

      <h2 class="text-sm font-heading tracking-[0.2em] text-jazz-espresso mb-3 pb-2 border-b-2 border-jazz-espresso">PRACTICE GUIDES</h2>
      <router-link
        v-for="guide in syllabus.practiceGuides"
        :key="guide.slug"
        :to="{ name: 'guide-detail', params: { slug: guide.slug } }"
        class="block px-2 py-1.5 text-xs text-jazz-espresso hover:bg-jazz-cream transition-colors"
        @click="$emit('close')"
      >
        <span class="text-jazz-smoke font-mono text-[10px]">{{ String(guide.order).padStart(2, '0') }}</span>
        {{ guide.title }}
      </router-link>
    </div>

    <!-- Jazz quote -->
    <div class="p-4 border-t-2 border-jazz-espresso">
      <blockquote class="text-xs italic text-jazz-smoke leading-relaxed">
        "There are no wrong notes in jazz, only wrong resolutions."
        <cite class="block mt-1 not-italic text-jazz-espresso text-[10px] font-heading tracking-[0.15em] uppercase">— Joe Pass</cite>
      </blockquote>
    </div>
  </aside>
</template>
