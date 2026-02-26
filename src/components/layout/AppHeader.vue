<script setup lang="ts">
import { useGamificationStore } from '@/stores/gamification'
import { useRouter } from 'vue-router'

defineEmits<{ 'toggle-sidebar': [] }>()

const gamification = useGamificationStore()
const router = useRouter()
</script>

<template>
  <header class="sticky top-0 z-40 bg-jazz-espresso text-jazz-cream shadow-lg">
    <div class="flex items-center justify-between h-16 px-4 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-jazz-espresso-light transition-colors"
          @click="$emit('toggle-sidebar')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span class="text-2xl">🎸</span>
          <div>
            <h1 class="text-lg font-heading font-bold leading-tight text-jazz-gold">Jazz Practice Buddy</h1>
            <p class="text-xs text-jazz-smoke-light leading-tight hidden sm:block">Jens Larsen Curriculum</p>
          </div>
        </router-link>
      </div>

      <nav class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in [
            { to: '/', label: 'Dashboard', icon: '📊' },
            { to: '/syllabus', label: 'Syllabus', icon: '📖' },
            { to: '/videos', label: 'Videos', icon: '🎬' },
            { to: '/guides', label: 'Guides', icon: '📝' },
            { to: '/practice', label: 'Practice', icon: '⏱️' },
          ]"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 rounded-lg text-sm transition-colors hover:bg-jazz-espresso-light"
          :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'bg-jazz-espresso-light text-jazz-gold' : 'text-jazz-cream'"
        >
          <span class="mr-1">{{ link.icon }}</span>
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-3">
        <!-- Streak indicator -->
        <router-link
          to="/achievements"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
          :class="gamification.streakIsActive ? 'bg-orange-900/30 text-orange-300' : 'bg-jazz-espresso-light text-jazz-smoke'"
        >
          <span class="text-lg">{{ gamification.streakIsActive ? '🔥' : '💤' }}</span>
          <span class="text-sm font-semibold">{{ gamification.streakData.currentStreak }}</span>
        </router-link>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav class="md:hidden flex overflow-x-auto border-t border-jazz-espresso-light">
      <router-link
        v-for="link in [
          { to: '/', label: 'Home', icon: '📊' },
          { to: '/syllabus', label: 'Syllabus', icon: '📖' },
          { to: '/videos', label: 'Videos', icon: '🎬' },
          { to: '/guides', label: 'Guides', icon: '📝' },
          { to: '/practice', label: 'Practice', icon: '⏱️' },
          { to: '/achievements', label: 'Awards', icon: '🏆' },
        ]"
        :key="link.to"
        :to="link.to"
        class="flex-shrink-0 px-4 py-2.5 text-xs text-center transition-colors"
        :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'text-jazz-gold border-b-2 border-jazz-gold' : 'text-jazz-smoke-light'"
      >
        <div>{{ link.icon }}</div>
        {{ link.label }}
      </router-link>
    </nav>
  </header>
</template>
