<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js'
import { useGamificationStore } from '@/stores/gamification'
import { usePracticeStore } from '@/stores/practice'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import AchievementIcon from '@/components/icons/AchievementIcon.vue'
import { Clock, Flame, Trophy, MonitorPlay } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip)

const gamification = useGamificationStore()
const practice = usePracticeStore()
const progress = useProgressStore()

const totalHours = computed(() => Math.round(practice.totalPracticeMinutes / 60 * 10) / 10)

const statItems = computed(() => [
  { label: 'Total Hours', value: totalHours.value, icon: Clock },
  { label: 'Current Streak', value: `${gamification.streakData.currentStreak}d`, icon: Flame },
  { label: 'Longest Streak', value: `${gamification.streakData.longestStreak}d`, icon: Trophy },
  { label: 'Videos Watched', value: progress.totalVideosWatched, icon: MonitorPlay },
])

// Group achievements by category
const achievementsByCategory = computed(() => {
  const categories = new Map<string, typeof gamification.achievementDefs>()
  const categoryLabels: Record<string, string> = {
    practice: 'Practice',
    streak: 'Streaks',
    curriculum: 'Curriculum',
    videos: 'Videos',
    explorer: 'Explorer',
  }

  for (const a of gamification.achievementDefs) {
    const label = categoryLabels[a.category] || a.category
    if (!categories.has(label)) categories.set(label, [])
    categories.get(label)!.push(a)
  }
  return categories
})

// Weekly chart data
const chartData = computed(() => ({
  labels: practice.weeklyPracticeData.map(w => w.week),
  datasets: [{
    label: 'Minutes Practiced',
    data: practice.weeklyPracticeData.map(w => w.minutes),
    backgroundColor: '#D64541',
    borderRadius: 0,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#E8E0D4' },
      ticks: { font: { family: 'IBM Plex Mono', size: 10 } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { family: 'IBM Plex Mono', size: 10 } },
    },
  },
}

// Streak calendar (last 90 days)
const streakCalendar = computed(() => {
  const days: { date: string; practiced: boolean; intensity: number }[] = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]!
    const practiced = gamification.streakData.practiceDates.includes(dateStr)
    // Calculate intensity based on minutes practiced that day
    const dayMinutes = practice.logs
      .filter(l => l.date === dateStr)
      .reduce((s, l) => s + l.duration, 0)
    const intensity = dayMinutes === 0 ? 0 : dayMinutes < 15 ? 1 : dayMinutes < 30 ? 2 : dayMinutes < 60 ? 3 : 4
    days.push({ date: dateStr!, practiced, intensity })
  }
  return days
})

const intensityColors = ['bg-jazz-cream-dark', 'bg-jazz-gold/20', 'bg-jazz-gold/40', 'bg-jazz-gold/70', 'bg-jazz-gold']
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-heading text-jazz-espresso tracking-tight leading-none">ACHIEVEMENTS</h1>
      <div class="h-1 w-16 bg-jazz-gold mt-3 mb-2"></div>
      <p class="text-jazz-smoke font-mono text-sm">
        {{ gamification.unlockedCount }} of {{ gamification.totalAchievements }} unlocked
      </p>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <BaseCard v-for="stat in statItems" :key="stat.label">
        <div class="text-center">
          <p class="text-4xl font-heading text-jazz-espresso leading-none">{{ stat.value }}</p>
          <p class="text-[10px] text-jazz-smoke uppercase tracking-[0.15em] font-mono mt-2">{{ stat.label }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- Streak Calendar -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-heading text-jazz-espresso mb-1">PRACTICE CALENDAR</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="flex flex-wrap gap-1">
        <div
          v-for="day in streakCalendar"
          :key="day.date"
          class="w-3 h-3"
          :class="intensityColors[day.intensity]"
          :title="`${day.date}${day.practiced ? ' - Practiced' : ''}`"
        />
      </div>
      <div class="flex items-center gap-1.5 mt-3 text-[10px] text-jazz-smoke font-mono uppercase tracking-wider">
        <span>Less</span>
        <div v-for="(color, i) in intensityColors" :key="i" class="w-3 h-3" :class="color" />
        <span>More</span>
      </div>
    </BaseCard>

    <!-- Weekly Practice Chart -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-heading text-jazz-espresso mb-1">WEEKLY PRACTICE TIME</h2>
      <div class="h-px bg-jazz-cream-dark mb-4"></div>
      <div class="h-48">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </BaseCard>

    <!-- Achievement Grid by Category -->
    <div class="space-y-8">
      <div v-for="[category, achievements] in achievementsByCategory" :key="category">
        <h2 class="text-xl font-heading text-jazz-espresso mb-1">{{ category.toUpperCase() }}</h2>
        <div class="h-px bg-jazz-cream-dark mb-4"></div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="a in achievements"
            :key="a.id"
            class="flex items-center gap-3 p-3 border-2 transition-colors"
            :class="gamification.isUnlocked(a.id)
              ? 'bg-white border-jazz-cream-dark'
              : 'bg-jazz-cream-dark/30 border-jazz-cream-dark opacity-50'"
          >
            <div
              class="w-10 h-10 flex items-center justify-center shrink-0"
              :class="gamification.isUnlocked(a.id) ? 'bg-jazz-gold/10 text-jazz-gold' : 'bg-jazz-smoke/10 text-jazz-smoke/30'"
            >
              <AchievementIcon :name="a.icon" :size="22" :locked="!gamification.isUnlocked(a.id)" />
            </div>
            <div>
              <h3 class="text-sm font-heading text-jazz-espresso uppercase tracking-wide">{{ a.title }}</h3>
              <p class="text-xs text-jazz-smoke">{{ a.description }}</p>
              <p
                v-if="gamification.isUnlocked(a.id) && gamification.unlockedAchievements[a.id]"
                class="text-[10px] text-jazz-green font-mono mt-0.5"
              >
                Unlocked {{ new Date(gamification.unlockedAchievements[a.id]!.unlockedAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
