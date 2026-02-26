<script setup lang="ts">
import { useGamificationStore } from '@/stores/gamification'
import { useRouter } from 'vue-router'
import {
  Guitar, LayoutDashboard, BookOpen, Play, FileText, Timer,
  Award, Flame, Moon, Menu,
} from 'lucide-vue-next'

defineEmits<{ 'toggle-sidebar': [] }>()

const gamification = useGamificationStore()
const router = useRouter()

const desktopNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/videos', label: 'Videos', icon: Play },
  { to: '/guides', label: 'Guides', icon: FileText },
  { to: '/practice', label: 'Practice', icon: Timer },
]

const mobileNav = [
  ...desktopNav,
  { to: '/achievements', label: 'Awards', icon: Award },
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-jazz-espresso text-jazz-cream shadow-lg">
    <div class="flex items-center justify-between h-16 px-4 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-jazz-espresso-light transition-colors"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="w-6 h-6" />
        </button>

        <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Guitar class="w-7 h-7 text-jazz-gold" />
          <div>
            <h1 class="text-lg font-heading font-bold leading-tight text-jazz-gold">Jazz Practice Buddy</h1>
            <p class="text-xs text-jazz-smoke-light leading-tight hidden sm:block">Jens Larsen Curriculum</p>
          </div>
        </router-link>
      </div>

      <nav class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in desktopNav"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-jazz-espresso-light"
          :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'bg-jazz-espresso-light text-jazz-gold' : 'text-jazz-cream'"
        >
          <component :is="link.icon" class="w-4 h-4" />
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-3">
        <router-link
          to="/achievements"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
          :class="gamification.streakIsActive ? 'bg-orange-900/30 text-orange-300' : 'bg-jazz-espresso-light text-jazz-smoke'"
        >
          <Flame v-if="gamification.streakIsActive" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
          <span class="text-sm font-semibold">{{ gamification.streakData.currentStreak }}</span>
        </router-link>
      </div>
    </div>

    <!-- Gold accent line -->
    <div class="h-px bg-gradient-to-r from-transparent via-jazz-gold/40 to-transparent" />

    <!-- Mobile nav -->
    <nav class="md:hidden flex overflow-x-auto border-t border-jazz-espresso-light">
      <router-link
        v-for="link in mobileNav"
        :key="link.to"
        :to="link.to"
        class="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 text-xs text-center transition-colors"
        :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'text-jazz-gold border-b-2 border-jazz-gold' : 'text-jazz-smoke-light'"
      >
        <component :is="link.icon" class="w-4 h-4" />
        {{ link.label }}
      </router-link>
    </nav>
  </header>
</template>
