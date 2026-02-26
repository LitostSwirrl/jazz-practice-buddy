<script setup lang="ts">
import { watch } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import confetti from 'canvas-confetti'

const gamification = useGamificationStore()

watch(() => gamification.pendingToast, (achievementId) => {
  if (!achievementId) return
  const achievement = gamification.achievementDefs.find(a => a.id === achievementId)
  if (!achievement) return

  // Fire confetti for big achievements
  if (achievement.category === 'curriculum' || achievement.id.includes('streak-30')) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  setTimeout(() => gamification.dismissToast(), 5000)
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="gamification.pendingToast"
      class="fixed bottom-6 right-6 z-50 max-w-sm bg-jazz-espresso text-jazz-cream rounded-xl shadow-2xl p-4 cursor-pointer border border-jazz-gold/30"
      @click="gamification.dismissToast()"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl">
          {{ gamification.achievementDefs.find(a => a.id === gamification.pendingToast)?.icon }}
        </span>
        <div>
          <p class="text-xs text-jazz-gold font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
          <p class="font-heading font-bold">
            {{ gamification.achievementDefs.find(a => a.id === gamification.pendingToast)?.title }}
          </p>
          <p class="text-xs text-jazz-smoke-light">
            {{ gamification.achievementDefs.find(a => a.id === gamification.pendingToast)?.description }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
