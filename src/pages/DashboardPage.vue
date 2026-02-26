<script setup lang="ts">
import { computed } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import { usePracticeStore } from '@/stores/practice'
import { useGamificationStore } from '@/stores/gamification'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseProgress from '@/components/shared/BaseProgress.vue'

const syllabus = useSyllabusStore()
const progress = useProgressStore()
const practice = usePracticeStore()
const gamification = useGamificationStore()

const overall = computed(() => progress.overallProgress)
const totalHours = computed(() => Math.round(practice.totalPracticeMinutes / 60 * 10) / 10)
const recentLogs = computed(() => practice.recentLogs(5))
const recentAchievements = computed(() => gamification.recentUnlocks(4))
const isNewUser = computed(() => practice.logs.length === 0 && progress.completedLessons.length === 0)

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome / Streak -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">
          {{ isNewUser ? 'Welcome to Jazz Practice Buddy' : 'Welcome Back' }}
        </h1>
        <p class="text-jazz-smoke mt-1">
          {{ isNewUser ? 'Your personal Jens Larsen curriculum companion.' : `Day ${gamification.streakData.currentStreak} of your jazz journey` }}
        </p>
      </div>
      <div
        v-if="gamification.streakIsActive"
        class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200"
      >
        <span class="text-2xl">🔥</span>
        <div>
          <p class="text-lg font-bold text-orange-700">{{ gamification.streakData.currentStreak }}-day streak</p>
          <p class="text-xs text-orange-500">Best: {{ gamification.streakData.longestStreak }} days</p>
        </div>
      </div>
    </div>

    <!-- New user onboarding -->
    <BaseCard v-if="isNewUser">
      <div class="text-center py-6">
        <span class="text-5xl block mb-4">🎸</span>
        <h2 class="text-xl font-heading font-bold mb-2">Ready to Learn Jazz Guitar?</h2>
        <p class="text-jazz-smoke max-w-lg mx-auto mb-6">
          This app organizes Jens Larsen's 1,100+ YouTube lessons into a structured curriculum
          with practice tracking, achievements, and more.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link to="/syllabus" class="px-5 py-2.5 bg-jazz-gold text-white rounded-lg font-medium hover:bg-jazz-brass transition-colors">
            Start with Module 1
          </router-link>
          <router-link to="/videos" class="px-5 py-2.5 bg-jazz-cream-dark text-jazz-espresso rounded-lg font-medium hover:bg-jazz-cream transition-colors">
            Browse Videos
          </router-link>
        </div>
      </div>
    </BaseCard>

    <!-- Stats Grid -->
    <div v-if="!isNewUser" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard v-for="stat in [
        { label: 'Practice Hours', value: totalHours, icon: '⏱️' },
        { label: 'Videos Watched', value: progress.totalVideosWatched, icon: '🎬' },
        { label: 'Lessons Done', value: progress.totalLessonsCompleted, icon: '✅' },
        { label: 'Achievements', value: gamification.unlockedCount, icon: '🏆' },
      ]" :key="stat.label">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ stat.icon }}</span>
          <div>
            <p class="text-2xl font-bold text-jazz-espresso">{{ stat.value }}</p>
            <p class="text-xs text-jazz-smoke">{{ stat.label }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Progress Overview -->
    <BaseCard>
      <h2 class="text-lg font-heading font-bold mb-4">Curriculum Progress</h2>
      <div class="mb-4">
        <BaseProgress :percent="overall.percent" size="lg" show-label>
          <template #label>
            <span class="text-jazz-espresso font-medium">Overall: {{ overall.completed }}/{{ overall.total }}</span>
          </template>
        </BaseProgress>
      </div>
      <div class="space-y-3">
        <router-link
          v-for="mod in syllabus.modules"
          :key="mod.id"
          :to="{ name: 'module', params: { moduleId: mod.id } }"
          class="block hover:bg-jazz-cream/50 rounded-lg p-2 -mx-2 transition-colors"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-jazz-espresso">
              <span class="text-jazz-gold font-bold mr-1">{{ mod.id }}.</span>
              {{ mod.title }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-jazz-cream-dark text-jazz-smoke">
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
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-heading font-bold">Recent Practice</h2>
          <router-link to="/practice/log" class="text-xs text-jazz-blue hover:underline">View all</router-link>
        </div>
        <div v-if="recentLogs.length === 0" class="text-center py-6 text-jazz-smoke">
          <p class="text-3xl mb-2">📝</p>
          <p class="text-sm">No practice sessions yet.</p>
          <router-link to="/practice" class="text-sm text-jazz-blue hover:underline mt-1 inline-block">
            Start practicing
          </router-link>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center gap-3 text-sm"
          >
            <div class="w-8 h-8 rounded-full bg-jazz-cream-dark flex items-center justify-center text-xs">
              {{ '⭐'.repeat(log.rating) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-jazz-espresso truncate">{{ log.topic }}</p>
              <p class="text-xs text-jazz-smoke">{{ log.date }} &middot; {{ formatDuration(log.duration) }}</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Recent Achievements -->
      <BaseCard>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-heading font-bold">Achievements</h2>
          <router-link to="/achievements" class="text-xs text-jazz-blue hover:underline">View all</router-link>
        </div>
        <div v-if="recentAchievements.length === 0" class="text-center py-6 text-jazz-smoke">
          <p class="text-3xl mb-2">🏆</p>
          <p class="text-sm">Start practicing to unlock achievements!</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="a in recentAchievements"
            :key="a.id"
            class="flex items-center gap-2 p-2 rounded-lg bg-jazz-cream/50"
          >
            <span class="text-2xl">{{ a.icon }}</span>
            <div>
              <p class="text-xs font-semibold text-jazz-espresso">{{ a.title }}</p>
              <p class="text-[10px] text-jazz-smoke">{{ a.description }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
