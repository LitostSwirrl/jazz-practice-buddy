<script setup lang="ts">
withDefaults(defineProps<{
  percent: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
}>(), {
  size: 'md',
  color: 'jazz-gold',
  showLabel: false,
})
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between text-xs mb-1 font-mono">
      <slot name="label" />
      <span class="text-jazz-smoke font-medium tracking-wide">{{ percent }}%</span>
    </div>
    <div
      class="w-full bg-jazz-cream-dark overflow-hidden"
      :class="{
        'h-1': size === 'sm',
        'h-2': size === 'md',
        'h-3': size === 'lg',
      }"
    >
      <div
        class="h-full transition-all duration-500 ease-out"
        :class="`bg-${color}`"
        :style="{ width: `${Math.min(percent, 100)}%` }"
      />
    </div>
  </div>
</template>
