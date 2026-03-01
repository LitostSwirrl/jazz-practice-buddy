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
    <div v-if="showLabel" class="flex justify-between text-xs mb-1">
      <slot name="label" />
      <span class="text-jazz-smoke font-medium">{{ percent }}%</span>
    </div>
    <div
      class="w-full bg-jazz-cream-dark rounded-full overflow-hidden"
      :class="{
        'h-1.5': size === 'sm',
        'h-2.5': size === 'md',
        'h-4': size === 'lg',
      }"
    >
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="`bg-${color}`"
        :style="{ width: `${Math.min(percent, 100)}%` }"
      />
    </div>
  </div>
</template>
