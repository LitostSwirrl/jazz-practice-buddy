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
    class="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-jazz-cream/50 border-r border-jazz-cream-dark overflow-y-auto transition-transform lg:translate-x-0 flex flex-col"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-4 flex-1">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-4 h-px bg-jazz-gold"></div>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-jazz-smoke">Curriculum</h2>
      </div>

      <div v-for="mod in syllabus.modules" :key="mod.id" class="mb-1">
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-jazz-cream-dark transition-colors"
          :class="expandedModule === mod.id ? 'bg-jazz-cream-dark' : ''"
          @click="toggleModule(mod.id)"
        >
          <span class="font-heading text-sm font-bold text-jazz-gold w-5">{{ mod.id }}</span>
          <span class="flex-1 truncate font-medium text-jazz-espresso">{{ mod.title }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="levelColors[mod.level] || 'bg-gray-100 text-gray-600'"
          >
            {{ progress.moduleProgress(mod.id).percent }}%
          </span>
          <ChevronRight
            class="w-4 h-4 text-jazz-smoke transition-transform"
            :class="expandedModule === mod.id ? 'rotate-90' : ''"
          />
        </button>

        <!-- Mini progress bar -->
        <div class="h-0.5 bg-jazz-cream-dark rounded-full mx-3 mt-0.5">
          <div
            class="h-full bg-jazz-gold rounded-full transition-all duration-500"
            :style="{ width: progress.moduleProgress(mod.id).percent + '%' }"
          ></div>
        </div>

        <div v-if="expandedModule === mod.id" class="ml-5 mt-1 space-y-0.5 border-l-2 border-jazz-gold/30 pl-3">
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

      <StaffDivider />

      <div class="flex items-center gap-2 mb-3">
        <div class="w-4 h-px bg-jazz-gold"></div>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-jazz-smoke">Practice Guides</h2>
      </div>
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

    <!-- Jazz quote -->
    <div class="p-4 border-t border-jazz-cream-dark">
      <blockquote class="text-xs italic text-jazz-smoke leading-relaxed font-heading">
        "There are no wrong notes in jazz, only wrong resolutions."
        <cite class="block mt-1 not-italic text-jazz-brass text-[10px] font-semibold font-body">-- Joe Pass</cite>
      </blockquote>
    </div>
  </aside>
</template>
