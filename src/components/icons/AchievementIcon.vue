<script setup lang="ts">
import {
  Award, Footprints, Music, Music2, Music3, Music4,
  Flame, Trophy, Clock, Clock4, Star, Guitar, Hash,
  Calendar, Dumbbell, Crown, Zap, Medal, BookOpen,
  CheckCircle2, GraduationCap, Library, Sparkles,
  MonitorPlay, Clapperboard, Eye, Film, Scroll, Search,
  Lock,
} from 'lucide-vue-next'
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  locked?: boolean
}>(), {
  size: 24,
  locked: false,
})

const iconMap: Record<string, Component> = {
  'footprints': Footprints,
  'music': Music,
  'music-2': Music2,
  'music-3': Music3,
  'music-4': Music4,
  'flame': Flame,
  'trophy': Trophy,
  'clock': Clock,
  'clock-4': Clock4,
  'star': Star,
  'guitar': Guitar,
  'hash': Hash,
  'calendar': Calendar,
  'dumbbell': Dumbbell,
  'crown': Crown,
  'zap': Zap,
  'medal': Medal,
  'book-open': BookOpen,
  'check-circle-2': CheckCircle2,
  'graduation-cap': GraduationCap,
  'library': Library,
  'sparkles': Sparkles,
  'monitor-play': MonitorPlay,
  'clapperboard': Clapperboard,
  'eye': Eye,
  'film': Film,
  'scroll': Scroll,
  'search': Search,
  'award': Award,
  'lock': Lock,
}

const resolvedIcon = computed(() => iconMap[props.name] ?? Award)
</script>

<template>
  <component
    v-if="!locked"
    :is="resolvedIcon"
    :size="size"
  />
  <Lock
    v-else
    :size="size"
    class="text-jazz-smoke/20"
  />
</template>
