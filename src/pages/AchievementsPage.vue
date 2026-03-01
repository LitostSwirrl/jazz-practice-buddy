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
  { label: 'Total Hours', value: totalHours.value, icon: Clock, color: 'bg-jazz-blue/10 text-jazz-blue' },
  { label: 'Current Streak', value: `${gamification.streakData.currentStreak} days`, icon: Flame, color: 'bg-orange-100 text-orange-600' },
  { label: 'Longest Streak', value: `${gamification.streakData.longestStreak} days`, icon: Trophy, color: 'bg-jazz-gold/10 text-jazz-gold' },
  { label: 'Videos Watched', value: progress.totalVideosWatched, icon: MonitorPlay, color: 'bg-jazz-green/10 text-jazz-green' },
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
    backgroundColor: '#D4A843',
    borderRadius: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#F5EDDA' } },
    x: { grid: { display: false } },
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

const intensityColors = ['bg-jazz-cream-dark', 'bg-green-200', 'bg-green-300', 'bg-green-500', 'bg-green-700']
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-heading font-bold text-jazz-espresso">Achievements & Stats</h1>
      <p class="font-heading italic text-jazz-smoke mt-1">
        {{ gamification.unlockedCount }} of {{ gamification.totalAchievements }} unlocked
      </p>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <BaseCard v-for="stat in statItems" :key="stat.label">
        <div class="text-center">
          <div class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" :class="stat.color">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <p class="text-xl font-heading font-bold text-jazz-espresso mt-1">{{ stat.value }}</p>
          <p class="text-xs text-jazz-smoke">{{ stat.label }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- Streak Calendar -->
    <BaseCard class="mb-8">
      <h2 class="text-lg font-heading font-bold mb-3">Practice Calendar (90 days)</h2>
      <div class="flex flex-wrap gap-1">
        <div
          v-for="day in streakCalendar"
          :key="day.date"
          class="w-3 h-3 rounded-sm"
          :class="intensityColors[day.intensity]"
          :title="`${day.date}${day.practiced ? ' - Practiced' : ''}`"
        />
      </div>
      <div class="flex items-center gap-2 mt-2 text-[10px] text-jazz-smoke">
        <span>Less</span>
        <div v-for="(color, i) in intensityColors" :key="i" class="w-3 h-3 rounded-sm" :class="color" />
        <span>More</span>
      </div>
    </BaseCard>

    <!-- Weekly Practice Chart -->
    <BaseCard class="mb-8">
      <h2 class="text-lg font-heading font-bold mb-3">Weekly Practice Time</h2>
      <div class="h-48">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </BaseCard>

    <!-- Achievement Grid by Category -->
    <div class="space-y-8">
      <div v-for="[category, achievements] in achievementsByCategory" :key="category">
        <h2 class="text-lg font-heading font-bold mb-3">{{ category }}</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="a in achievements"
            :key="a.id"
            class="flex items-center gap-3 p-3 rounded-xl border transition-colors"
            :class="gamification.isUnlocked(a.id)
              ? 'bg-white border-jazz-gold/30 shadow-sm'
              : 'bg-jazz-cream-dark/50 border-transparent opacity-60'"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              :class="gamification.isUnlocked(a.id) ? 'bg-jazz-gold/10 text-jazz-gold' : 'bg-jazz-smoke/10 text-jazz-smoke/30'"
            >
              <AchievementIcon :name="a.icon" :size="22" :locked="!gamification.isUnlocked(a.id)" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-jazz-espresso">{{ a.title }}</h3>
              <p class="text-xs text-jazz-smoke">{{ a.description }}</p>
              <p
                v-if="gamification.isUnlocked(a.id) && gamification.unlockedAchievements[a.id]"
                class="text-[10px] text-jazz-green mt-0.5"
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
