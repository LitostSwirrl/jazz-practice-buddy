<script setup lang="ts">
import { Guitar } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-jazz-cream">
    <div class="text-center px-4">
      <h1 class="text-[10rem] sm:text-[14rem] font-heading text-jazz-espresso leading-none tracking-tight select-none">404</h1>
      <div class="h-1 w-24 bg-jazz-gold mx-auto my-6"></div>
      <p class="text-jazz-smoke text-lg">This page hit a wrong note.</p>
      <router-link
        to="/"
        class="inline-block mt-8 px-8 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.2em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors"
      >
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>
