<template>
  <div class="relative pl-6 py-4 pr-4 bg-jazz-cream-dark/40 border-l-4 border-jazz-espresso">
    <span class="absolute top-2 left-6 text-4xl leading-none text-jazz-espresso/10 font-heading select-none">"</span>
    <p class="text-jazz-espresso/80 text-sm leading-relaxed relative z-10 italic">
      <slot />
    </p>
    <cite v-if="$slots.attribution" class="block mt-2 text-xs text-jazz-smoke not-italic font-mono uppercase tracking-widest relative z-10">
      <slot name="attribution" />
    </cite>
  </div>
</template>
