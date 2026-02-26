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
  default: 'bg-white border-jazz-cream-dark',
  featured: 'bg-gradient-to-b from-jazz-gold/[0.03] to-white border-jazz-cream-dark border-t-2 border-t-jazz-gold',
  warm: 'bg-jazz-cream/50 border-jazz-cream-dark border-l-4 border-l-jazz-gold',
}
</script>

<template>
  <div
    class="rounded-xl border shadow-sm hover:shadow-md transition-shadow"
    :class="[variantClasses[variant], padding ? 'p-5' : '']"
  >
    <slot />
  </div>
</template>
