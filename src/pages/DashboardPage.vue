<script setup lang="ts">
import { computed } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import { usePracticeStore } from '@/stores/practice'
import { useGamificationStore } from '@/stores/gamification'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseProgress from '@/components/shared/BaseProgress.vue'
import AchievementIcon from '@/components/icons/AchievementIcon.vue'
import { Clock, MonitorPlay, CheckCircle2, Trophy, Flame, Guitar, PenLine, Star } from 'lucide-vue-next'

const syllabus = useSyllabusStore()
const progress = useProgressStore()
const practice = usePracticeStore()
const gamification = useGamificationStore()

const overall = computed(() => progress.overallProgress)
const totalHours = computed(() => Math.round(practice.totalPracticeMinutes / 60 * 10) / 10)
const recentLogs = computed(() => practice.recentLogs(5))
const recentAchievements = computed(() => gamification.recentUnlocks(4))
const isNewUser = computed(() => practice.logs.length === 0 && progress.completedLessons.length === 0)

const stats = computed(() => [
  { label: 'Practice Hours', value: totalHours.value, icon: Clock },
  { label: 'Videos Watched', value: progress.totalVideosWatched, icon: MonitorPlay },
  { label: 'Lessons Done', value: progress.totalLessonsCompleted, icon: CheckCircle2 },
  { label: 'Achievements', value: gamification.unlockedCount, icon: Trophy },
])

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome / Streak -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading text-jazz-espresso tracking-tight leading-none">
          {{ isNewUser ? 'WELCOME' : 'WELCOME BACK' }}
        </h1>
        <p class="text-jazz-smoke mt-2">
          {{ isNewUser ? 'Your personal Jens Larsen curriculum companion.' : `Day ${gamification.streakData.currentStreak} of your jazz journey` }}
        </p>
      </div>
      <div
        v-if="gamification.streakIsActive"
        class="flex items-center gap-3 px-4 py-3 border-2 border-jazz-gold"
      >
        <Flame class="w-6 h-6 text-jazz-gold" />
        <div>
          <p class="text-2xl font-heading text-jazz-espresso leading-none">{{ gamification.streakData.currentStreak }}-DAY STREAK</p>
          <p class="text-xs text-jazz-smoke font-mono mt-0.5">Best: {{ gamification.streakData.longestStreak }} days</p>
        </div>
      </div>
    </div>

    <div class="h-1 bg-jazz-espresso"></div>

    <!-- New user onboarding -->
    <BaseCard v-if="isNewUser" variant="featured">
      <div class="py-6">
        <h2 class="text-3xl font-heading text-jazz-espresso mb-3">READY TO LEARN JAZZ GUITAR?</h2>
        <p class="text-jazz-smoke max-w-lg mb-6">
          This app organizes Jens Larsen's 1,100+ YouTube lessons into a structured curriculum
          with practice tracking, achievements, and more.
        </p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/syllabus" class="px-6 py-3 bg-jazz-gold text-white font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-brass transition-colors">
            Start with Module 1
          </router-link>
          <router-link to="/videos" class="px-6 py-3 border-2 border-jazz-espresso text-jazz-espresso font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso hover:text-jazz-cream transition-colors">
            Browse Videos
          </router-link>
        </div>
      </div>
    </BaseCard>

    <!-- Stats Grid -->
    <div v-if="!isNewUser" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard v-for="stat in stats" :key="stat.label">
        <div class="text-center">
          <p class="text-4xl font-heading text-jazz-espresso leading-none">{{ stat.value }}</p>
          <p class="text-xs text-jazz-smoke uppercase tracking-[0.15em] font-mono mt-2">{{ stat.label }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- Progress Overview -->
    <BaseCard>
      <h2 class="text-2xl font-heading text-jazz-espresso mb-1">CURRICULUM PROGRESS</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="mb-5">
        <BaseProgress :percent="overall.percent" size="lg" show-label>
          <template #label>
            <span class="text-jazz-espresso font-mono text-xs">Overall: {{ overall.completed }}/{{ overall.total }}</span>
          </template>
        </BaseProgress>
      </div>
      <div class="space-y-3">
        <router-link
          v-for="mod in syllabus.modules"
          :key="mod.id"
          :to="{ name: 'module', params: { moduleId: mod.id } }"
          class="block hover:bg-jazz-cream/50 p-2 -mx-2 transition-colors"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-jazz-espresso">
              <span class="text-jazz-gold font-heading text-lg mr-1.5">{{ mod.id }}</span>
              {{ mod.title }}
            </span>
            <span class="text-[10px] px-2 py-0.5 bg-jazz-cream-dark text-jazz-smoke uppercase tracking-wider font-mono">
              {{ mod.level }}
            </span>
          </div>
          <BaseProgress :percent="progress.moduleProgress(mod.id).percent" size="sm" />
        </router-link>
      </div>
    </BaseCard>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <BaseCard>
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-2xl font-heading text-jazz-espresso">RECENT PRACTICE</h2>
          <router-link to="/practice/log" class="text-xs text-jazz-blue hover:underline font-mono uppercase tracking-wider">View all</router-link>
        </div>
        <div class="h-px bg-jazz-cream-dark mb-4"></div>
        <div v-if="recentLogs.length === 0" class="text-center py-8 text-jazz-smoke">
          <PenLine class="w-10 h-10 mx-auto mb-2 text-jazz-smoke-light" />
          <p class="text-sm">No practice sessions yet.</p>
          <router-link to="/practice" class="text-sm text-jazz-blue hover:underline mt-1 inline-block">
            Start practicing
          </router-link>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center gap-3 text-sm py-2 border-b border-jazz-cream-dark last:border-0"
          >
            <div class="w-8 h-8 bg-jazz-gold/10 flex items-center justify-center gap-0.5 text-xs font-mono font-medium text-jazz-gold">
              {{ log.rating }}<Star class="w-3 h-3" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-jazz-espresso truncate">{{ log.topic }}</p>
              <p class="text-xs text-jazz-smoke font-mono">{{ log.date }} · {{ formatDuration(log.duration) }}</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Recent Achievements -->
      <BaseCard>
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-2xl font-heading text-jazz-espresso">ACHIEVEMENTS</h2>
          <router-link to="/achievements" class="text-xs text-jazz-blue hover:underline font-mono uppercase tracking-wider">View all</router-link>
        </div>
        <div class="h-px bg-jazz-cream-dark mb-4"></div>
        <div v-if="recentAchievements.length === 0" class="text-center py-8 text-jazz-smoke">
          <Trophy class="w-10 h-10 mx-auto mb-2 text-jazz-smoke-light" />
          <p class="text-sm">Start practicing to unlock achievements!</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="a in recentAchievements"
            :key="a.id"
            class="flex items-center gap-2 p-3 border-2 border-jazz-cream-dark"
          >
            <div class="w-8 h-8 bg-jazz-gold/10 flex items-center justify-center text-jazz-gold shrink-0">
              <AchievementIcon :name="a.icon" :size="18" />
            </div>
            <div>
              <p class="text-xs font-heading text-jazz-espresso uppercase tracking-wide">{{ a.title }}</p>
              <p class="text-[10px] text-jazz-smoke">{{ a.description }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
