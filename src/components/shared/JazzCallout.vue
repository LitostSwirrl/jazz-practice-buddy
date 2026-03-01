<template>
  <div class="relative pl-5 py-4 pr-4 bg-jazz-cream-dark/50 border-l-4 border-jazz-gold rounded-r-lg overflow-hidden">
    <div class="absolute top-2 left-5 right-4 flex flex-col gap-[3px] opacity-[0.06] pointer-events-none">
      <div class="h-px bg-jazz-espresso"></div>
      <div class="h-px bg-jazz-espresso"></div>
      <div class="h-px bg-jazz-espresso"></div>
      <div class="h-px bg-jazz-espresso"></div>
      <div class="h-px bg-jazz-espresso"></div>
    </div>
    <p class="font-heading italic text-jazz-espresso/80 text-sm leading-relaxed relative z-10">
      <slot />
    </p>
    <cite v-if="$slots.attribution" class="block mt-2 text-xs text-jazz-brass not-italic font-semibold relative z-10">
      <slot name="attribution" />
    </cite>
  </div>
</template>
