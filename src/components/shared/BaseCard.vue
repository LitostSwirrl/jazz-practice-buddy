<script setup lang="ts">
withDefaults(defineProps<{
  padding?: boolean
}>(), {
  padding: true,
})
</script>

<template>
  <div
    class="bg-white rounded-xl border border-jazz-cream-dark shadow-sm hover:shadow-md transition-shadow"
    :class="padding ? 'p-5' : ''"
  >
    <slot />
  </div>
</template>
