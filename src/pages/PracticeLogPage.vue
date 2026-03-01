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
    <nav class="text-xs text-jazz-smoke mb-6 font-mono uppercase tracking-wider">
      <router-link to="/practice" class="hover:text-jazz-blue">Practice</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso">Practice Log</span>
    </nav>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-4xl sm:text-5xl font-heading text-jazz-espresso tracking-tight leading-none">PRACTICE LOG</h1>
        <div class="h-1 w-12 bg-jazz-gold mt-3 mb-2"></div>
        <p class="text-jazz-smoke font-mono text-sm">{{ practice.logs.length }} sessions · {{ totalHours }} total hours</p>
      </div>
      <router-link
        to="/practice"
        class="px-5 py-2.5 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-xs uppercase hover:bg-jazz-espresso-light transition-colors"
      >
        + New Session
      </router-link>
    </div>

    <div v-if="practice.logs.length === 0" class="text-center py-16">
      <PenLine class="w-12 h-12 mx-auto mb-4 text-jazz-smoke-light" />
      <h2 class="text-3xl font-heading text-jazz-espresso mb-2">NO SESSIONS YET</h2>
      <p class="text-jazz-smoke mb-6">Start your first session to begin tracking your progress.</p>
      <router-link to="/practice" class="px-6 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors">
        Start Practicing
      </router-link>
    </div>

    <div v-else class="space-y-8">
      <div v-for="[date, logs] in groupedLogs" :key="date">
        <h2 class="text-sm font-heading text-jazz-espresso uppercase tracking-[0.15em] mb-2 pb-2 border-b-2 border-jazz-espresso">{{ date }}</h2>
        <div class="space-y-0">
          <div
            v-for="log in logs"
            :key="log.id"
            class="flex items-start justify-between gap-4 py-3 border-b border-jazz-cream-dark last:border-0"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-jazz-espresso">{{ log.topic }}</h3>
                <div class="flex">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="w-2 h-2 mr-0.5"
                    :class="i <= log.rating ? 'bg-jazz-gold' : 'bg-jazz-cream-dark'"
                  />
                </div>
              </div>
              <p v-if="log.notes" class="text-sm text-jazz-smoke mt-1">{{ log.notes }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-sm font-mono text-jazz-espresso">{{ formatDuration(log.duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
