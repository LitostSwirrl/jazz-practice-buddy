<script setup lang="ts">
type Variant = 'default' | 'featured' | 'warm'

const props = withDefaults(defineProps<{
  padding?: boolean
  variant?: Variant
}>(), {
  padding: true,
  variant: 'default',
})

const variantClasses: Record<Variant, string> = {
  default: 'bg-white border-jazz-cream-dark hover:border-jazz-smoke-light',
  featured: 'bg-white border-jazz-cream-dark border-t-4 border-t-jazz-gold',
  warm: 'bg-jazz-cream/30 border-jazz-cream-dark border-l-4 border-l-jazz-espresso',
}
</script>

<template>
  <div
    class="border-2 transition-colors"
    :class="[variantClasses[variant], padding ? 'p-5' : '']"
  >
    <slot />
  </div>
</template>
