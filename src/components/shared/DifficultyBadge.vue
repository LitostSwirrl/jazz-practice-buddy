<script setup lang="ts">
defineProps<{ level: number }>()

const labels = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert']
</script>

<template>
  <div class="flex items-center gap-1" :title="labels[level]">
    <span
      v-for="i in 5"
      :key="i"
      class="w-1.5 h-1.5 rounded-full"
      :class="i <= level ? 'bg-jazz-gold' : 'bg-jazz-cream-dark'"
    />
    <span class="text-[10px] text-jazz-smoke ml-0.5">{{ labels[level] }}</span>
  </div>
</template>
