<script setup lang="ts">
import { onMounted } from 'vue'
import { useSyllabusStore } from '@/stores/syllabus'
import { useVideosStore } from '@/stores/videos'
import { useGamificationStore } from '@/stores/gamification'
import AchievementToast from '@/components/gamification/AchievementToast.vue'

const syllabus = useSyllabusStore()
const videosStore = useVideosStore()
const gamification = useGamificationStore()

onMounted(async () => {
  await Promise.all([
    syllabus.loadSyllabus(),
    videosStore.loadVideos(),
    gamification.loadAchievements(),
  ])
})
</script>

<template>
  <router-view />
  <AchievementToast />
</template>
