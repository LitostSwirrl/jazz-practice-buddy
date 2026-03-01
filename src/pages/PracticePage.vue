<script setup lang="ts">
import { ref, computed, onUnmounted, type Component } from 'vue'
import { format } from 'date-fns'
import { usePracticeStore } from '@/stores/practice'
import { useGamificationStore } from '@/stores/gamification'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import BaseCard from '@/components/shared/BaseCard.vue'
import {
  Timer, PenLine, ClipboardList, Target, BookMarked,
  Music, Music2, Ear, Play, CircleCheck, Star,
} from 'lucide-vue-next'

const practice = usePracticeStore()
const gamification = useGamificationStore()
const syllabus = useSyllabusStore()
const progressStore = useProgressStore()

// Timer state
const timerRunning = ref(false)
const timerSeconds = ref(0)
const targetMinutes = ref(30)
const timerTopic = ref('')
let timerInterval: ReturnType<typeof setInterval> | null = null

// Log form
const logTopic = ref('')
const logDuration = ref(30)
const logNotes = ref('')
const logRating = ref<1 | 2 | 3 | 4 | 5>(3)
const logSaved = ref(false)

// Active tab
const activeTab = ref<'timer' | 'log' | 'planner'>('timer')

const tabs: { id: 'timer' | 'log' | 'planner'; label: string; icon: Component }[] = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'log', label: 'Quick Log', icon: PenLine },
  { id: 'planner', label: 'Daily Plan', icon: ClipboardList },
]

// Timer computed
const timerDisplay = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const timerProgress = computed(() => {
  const target = targetMinutes.value * 60
  return target > 0 ? Math.min((timerSeconds.value / target) * 100, 100) : 0
})

// SVG circle math
const circleRadius = 90
const circumference = 2 * Math.PI * circleRadius
const strokeDashoffset = computed(() =>
  circumference - (timerProgress.value / 100) * circumference
)

function startTimer() {
  if (timerRunning.value) return
  timerRunning.value = true
  timerInterval = setInterval(() => {
    timerSeconds.value++
  }, 1000)
}

function pauseTimer() {
  timerRunning.value = false
  if (timerInterval) clearInterval(timerInterval)
}

function stopTimer() {
  pauseTimer()
  if (timerSeconds.value > 0) {
    const duration = Math.ceil(timerSeconds.value / 60)
    logTopic.value = timerTopic.value
    logDuration.value = duration
    activeTab.value = 'log'
  }
  timerSeconds.value = 0
}

function saveLog() {
  if (!logTopic.value.trim()) return

  practice.addLogEntry({
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: logDuration.value,
    topic: logTopic.value.trim(),
    unitId: null,
    guideSlug: null,
    notes: logNotes.value.trim(),
    rating: logRating.value,
  })

  gamification.updateStreak()
  gamification.checkAchievements()

  logSaved.value = true
  setTimeout(() => {
    logSaved.value = false
    logTopic.value = ''
    logDuration.value = 30
    logNotes.value = ''
    logRating.value = 3
  }, 2000)
}

// Daily plan generation
const currentUnit = computed(() => {
  return syllabus.getUnitById(
    progressStore.currentModuleId,
    progressStore.currentUnitId
  )
})

interface PlanBlock {
  label: string
  duration: number
  description: string
  icon: Component
  color: string
}

const dailyPlan = computed<PlanBlock[]>(() => {
  const unit = currentUnit.value
  if (!unit) return []

  const blocks: PlanBlock[] = [
    { label: 'Warm-up / Technique', duration: 10, description: 'Scales and arpeggios in the key of the current standard', icon: Target, color: 'bg-jazz-blue/10 text-jazz-blue' },
  ]

  if (unit.exercises.length > 0) {
    const ex = unit.exercises[0]!
    blocks.push({ label: 'Focused Practice', duration: 15, description: ex.description, icon: BookMarked, color: 'bg-jazz-green/10 text-jazz-green' })
  }
  if (unit.exercises.length > 1) {
    const ex = unit.exercises[1]!
    blocks.push({ label: 'Application', duration: 15, description: ex.description, icon: Music, color: 'bg-jazz-gold/10 text-jazz-gold' })
  }

  blocks.push({ label: 'Repertoire', duration: 10, description: 'Play through a standard applying concepts from this unit', icon: Music2, color: 'bg-jazz-gold/10 text-jazz-espresso' })
  blocks.push({ label: 'Free Play / Ear Training', duration: 10, description: 'Improvise freely or transcribe a short phrase', icon: Ear, color: 'bg-jazz-smoke/10 text-jazz-smoke' })

  return blocks
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-4xl sm:text-5xl font-heading text-jazz-espresso tracking-tight leading-none">PRACTICE SESSION</h1>
      <div class="h-1 w-12 bg-jazz-gold mt-3 mb-2"></div>
      <p class="text-jazz-smoke text-sm">Timer, planner, and quick log</p>
    </div>

    <!-- Tabs -->
    <div class="flex mb-6 border-b-2 border-jazz-cream-dark">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-1.5 py-3 px-5 text-sm font-heading tracking-[0.12em] uppercase transition-colors border-b-2 -mb-[2px]"
        :class="activeTab === tab.id ? 'border-jazz-gold text-jazz-espresso' : 'border-transparent text-jazz-smoke hover:text-jazz-espresso'"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Timer Tab -->
    <div v-if="activeTab === 'timer'">
      <BaseCard>
        <div class="text-center">
          <!-- Duration presets -->
          <div class="flex justify-center gap-2 mb-6">
            <button
              v-for="mins in [15, 30, 45, 60]"
              :key="mins"
              @click="targetMinutes = mins"
              class="px-5 py-2 text-sm font-heading tracking-wider transition-colors"
              :class="targetMinutes === mins ? 'bg-jazz-espresso text-jazz-cream' : 'bg-jazz-cream-dark text-jazz-espresso hover:bg-jazz-cream'"
            >
              {{ mins }}M
            </button>
          </div>

          <!-- Topic input -->
          <input
            v-model="timerTopic"
            type="text"
            placeholder="What are you practicing?"
            class="w-full max-w-sm mx-auto px-4 py-2 border-2 border-jazz-cream-dark text-center text-sm focus:outline-none focus:border-jazz-espresso mb-6 block transition-colors"
          >

          <!-- Circular Timer -->
          <div class="relative w-56 h-56 mx-auto mb-6">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" :r="circleRadius" fill="none" stroke="#E8E0D4" stroke-width="8" />
              <circle
                cx="100" cy="100" :r="circleRadius" fill="none"
                stroke="#D64541" stroke-width="8" stroke-linecap="butt"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                class="transition-all duration-1000"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-mono font-bold text-jazz-espresso tracking-wider">{{ timerDisplay }}</span>
              <span class="text-xs text-jazz-smoke font-mono mt-1">/ {{ targetMinutes }}:00</span>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex justify-center gap-3">
            <button
              v-if="!timerRunning"
              @click="startTimer"
              class="px-8 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors"
            >
              {{ timerSeconds > 0 ? 'Resume' : 'Start' }}
            </button>
            <button
              v-if="timerRunning"
              @click="pauseTimer"
              class="px-8 py-3 bg-jazz-smoke text-white font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso transition-colors"
            >
              Pause
            </button>
            <button
              v-if="timerSeconds > 0"
              @click="stopTimer"
              class="px-6 py-3 bg-jazz-gold text-white font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-brass transition-colors"
            >
              Stop & Log
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Quick Log Tab -->
    <div v-if="activeTab === 'log'">
      <BaseCard>
        <h2 class="text-xl font-heading text-jazz-espresso mb-1">LOG A PRACTICE SESSION</h2>
        <div class="h-px bg-jazz-cream-dark mb-4"></div>

        <div v-if="logSaved" class="text-center py-8">
          <CircleCheck class="w-12 h-12 text-jazz-green mx-auto mb-2" />
          <p class="text-lg font-heading text-jazz-green uppercase tracking-wider">Session Logged</p>
        </div>

        <form v-else @submit.prevent="saveLog" class="space-y-5">
          <div>
            <label class="block text-xs font-heading text-jazz-espresso mb-1.5 uppercase tracking-[0.15em]">What did you practice?</label>
            <input
              v-model="logTopic"
              type="text"
              required
              placeholder="e.g., Shell voicings over Autumn Leaves"
              class="w-full px-3 py-2 border-2 border-jazz-cream-dark text-sm focus:outline-none focus:border-jazz-espresso transition-colors"
            >
          </div>

          <div>
            <label class="block text-xs font-heading text-jazz-espresso mb-1.5 uppercase tracking-[0.15em]">Duration (minutes)</label>
            <input
              v-model.number="logDuration"
              type="number"
              min="1"
              max="480"
              class="w-full px-3 py-2 border-2 border-jazz-cream-dark text-sm focus:outline-none focus:border-jazz-espresso transition-colors"
            >
          </div>

          <div>
            <label class="block text-xs font-heading text-jazz-espresso mb-1.5 uppercase tracking-[0.15em]">How did it go?</label>
            <div class="flex gap-1">
              <button
                v-for="r in ([1, 2, 3, 4, 5] as const)"
                :key="r"
                type="button"
                @click="logRating = r"
                class="w-10 h-10 flex items-center justify-center transition-colors"
                :class="logRating >= r ? 'bg-jazz-gold text-white' : 'bg-jazz-cream-dark text-jazz-smoke hover:bg-jazz-cream'"
              >
                <Star class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-heading text-jazz-espresso mb-1.5 uppercase tracking-[0.15em]">Notes (optional)</label>
            <textarea
              v-model="logNotes"
              rows="3"
              placeholder="Anything you want to remember..."
              class="w-full px-3 py-2 border-2 border-jazz-cream-dark text-sm focus:outline-none focus:border-jazz-espresso resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="!logTopic.trim()"
            class="w-full py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Practice Session
          </button>
        </form>
      </BaseCard>
    </div>

    <!-- Daily Planner Tab -->
    <div v-if="activeTab === 'planner'">
      <BaseCard>
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-xl font-heading text-jazz-espresso">TODAY'S PRACTICE PLAN</h2>
          <span class="text-xs text-jazz-smoke font-mono">
            {{ dailyPlan.reduce((s, b) => s + b.duration, 0) }} min total
          </span>
        </div>
        <div class="h-px bg-jazz-cream-dark mb-4"></div>

        <div v-if="currentUnit" class="mb-4 p-3 border-l-4 border-l-jazz-espresso bg-jazz-cream/30">
          <p class="text-[10px] text-jazz-smoke font-mono uppercase tracking-wider">Current focus</p>
          <p class="text-sm text-jazz-espresso mt-0.5">
            Unit {{ currentUnit.id }}: {{ currentUnit.title }}
          </p>
        </div>

        <div class="space-y-0">
          <div
            v-for="(block, i) in dailyPlan"
            :key="i"
            class="flex items-start gap-3 py-4 border-b border-jazz-cream-dark last:border-0"
          >
            <div class="w-8 h-8 flex items-center justify-center shrink-0" :class="block.color">
              <component :is="block.icon" class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-heading text-jazz-espresso uppercase tracking-wide">{{ block.label }}</h3>
                <span class="text-[10px] text-jazz-smoke font-mono">
                  {{ block.duration }} min
                </span>
              </div>
              <p class="text-xs text-jazz-smoke mt-1">{{ block.description }}</p>
            </div>
            <button
              @click="timerTopic = block.label; targetMinutes = block.duration; activeTab = 'timer'"
              class="shrink-0 w-7 h-7 flex items-center justify-center text-jazz-blue hover:bg-jazz-cream transition-colors"
              title="Start timer"
            >
              <Play class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- Quick link to full log -->
      <div class="mt-4 text-center">
        <router-link to="/practice/log" class="text-sm text-jazz-blue hover:underline font-mono uppercase tracking-wider">
          View full practice history →
        </router-link>
      </div>
    </div>
  </div>
</template>
