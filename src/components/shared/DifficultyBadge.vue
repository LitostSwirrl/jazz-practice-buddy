<script setup lang="ts">
defineProps<{ level: number }>()

const labels = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert']
</script>

<template>
  <div class="flex items-center gap-1" :title="labels[level]">
    <span
      v-for="i in 5"
      :key="i"
      class="w-1.5 h-1.5"
      :class="i <= level ? 'bg-jazz-espresso' : 'bg-jazz-cream-dark'"
    />
    <span class="text-[10px] text-jazz-smoke ml-1 uppercase tracking-widest font-mono">{{ labels[level] }}</span>
  </div>
</template>
