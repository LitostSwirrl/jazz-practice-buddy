<script setup lang="ts">
import { computed } from 'vue'
import { usePracticeStore } from '@/stores/practice'
import BaseCard from '@/components/shared/BaseCard.vue'
import { PenLine, Star } from 'lucide-vue-next'

const practice = usePracticeStore()

const sortedLogs = computed(() =>
  [...practice.logs].sort((a, b) => b.date.localeCompare(a.date))
)

// Group by date
const groupedLogs = computed(() => {
  const groups = new Map<string, typeof practice.logs>()
  for (const log of sortedLogs.value) {
    if (!groups.has(log.date)) groups.set(log.date, [])
    groups.get(log.date)!.push(log)
  }
  return groups
})

const totalHours = computed(() => Math.round(practice.totalPracticeMinutes / 60 * 10) / 10)

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
</script>

<template>
  <div>
    <nav class="text-sm text-jazz-smoke mb-4">
      <router-link to="/practice" class="hover:text-jazz-blue">Practice</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">Practice Log</span>
    </nav>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">Practice Log</h1>
        <p class="text-jazz-smoke mt-1">{{ practice.logs.length }} sessions &middot; {{ totalHours }} total hours</p>
      </div>
      <router-link
        to="/practice"
        class="px-4 py-2 bg-jazz-gold text-white rounded-lg text-sm font-medium hover:bg-jazz-brass active:scale-[0.98] transition-all"
      >
        + New Session
      </router-link>
    </div>

    <div v-if="practice.logs.length === 0" class="text-center py-16">
      <PenLine class="w-12 h-12 mx-auto mb-4 text-jazz-smoke-light" />
      <h2 class="text-xl font-heading italic text-jazz-espresso mb-2">No practice sessions yet</h2>
      <p class="text-jazz-smoke mb-4">Start your first session to begin tracking your progress.</p>
      <router-link to="/practice" class="px-5 py-2.5 bg-jazz-gold text-white rounded-lg font-medium hover:bg-jazz-brass active:scale-[0.98] transition-all">
        Start Practicing
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <div v-for="[date, logs] in groupedLogs" :key="date">
        <h2 class="text-sm font-semibold text-jazz-smoke uppercase tracking-wider mb-2">{{ date }}</h2>
        <div class="space-y-2">
          <BaseCard v-for="log in logs" :key="log.id">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-jazz-espresso">{{ log.topic }}</h3>
                  <div class="flex text-jazz-gold">
                    <Star v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= log.rating ? 'opacity-100' : 'opacity-20'" />
                  </div>
                </div>
                <p v-if="log.notes" class="text-sm text-jazz-smoke mt-1">{{ log.notes }}</p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-sm font-semibold text-jazz-espresso">{{ formatDuration(log.duration) }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
