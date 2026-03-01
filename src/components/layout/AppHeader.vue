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
  <header class="sticky top-0 z-40 bg-jazz-espresso text-jazz-cream">
    <div class="flex items-center justify-between h-14 px-4 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden p-2 hover:bg-jazz-espresso-light transition-colors"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="w-5 h-5" />
        </button>

        <router-link to="/" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Guitar class="w-6 h-6 text-jazz-gold" />
          <div>
            <h1 class="text-lg font-heading tracking-[0.2em] leading-tight text-jazz-cream">JAZZ PRACTICE BUDDY</h1>
            <p class="text-[10px] text-jazz-smoke-light leading-tight hidden sm:block tracking-[0.15em] uppercase">Jens Larsen Curriculum</p>
          </div>
        </router-link>
      </div>

      <nav class="hidden md:flex items-center gap-0">
        <router-link
          v-for="link in desktopNav"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-heading tracking-[0.15em] transition-colors border-b-2 border-transparent"
          :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'text-jazz-gold border-b-jazz-gold' : 'text-jazz-cream/70 hover:text-jazz-cream'"
        >
          {{ link.label.toUpperCase() }}
        </router-link>
      </nav>

      <div class="flex items-center gap-3">
        <router-link
          to="/achievements"
          class="flex items-center gap-1.5 px-3 py-1 transition-colors border-2"
          :class="gamification.streakIsActive ? 'border-jazz-gold text-jazz-gold' : 'border-jazz-smoke/30 text-jazz-smoke'"
        >
          <Flame v-if="gamification.streakIsActive" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
          <span class="text-sm font-heading tracking-wider">{{ gamification.streakData.currentStreak }}</span>
        </router-link>
      </div>
    </div>

    <!-- Thin accent line -->
    <div class="h-px bg-jazz-smoke/20" />

    <!-- Mobile nav -->
    <nav class="md:hidden flex overflow-x-auto border-t border-jazz-espresso-light">
      <router-link
        v-for="link in mobileNav"
        :key="link.to"
        :to="link.to"
        class="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] text-center transition-colors font-heading tracking-[0.12em] uppercase"
        :class="$route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/') ? 'text-jazz-gold border-b-2 border-jazz-gold' : 'text-jazz-smoke-light'"
      >
        <component :is="link.icon" class="w-4 h-4" />
        {{ link.label }}
      </router-link>
    </nav>
  </header>
</template>
