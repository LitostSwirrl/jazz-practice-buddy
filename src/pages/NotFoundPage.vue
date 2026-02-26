<script setup lang="ts">
import { Guitar } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-jazz-cream">
    <div class="text-center px-4">
      <Guitar class="w-16 h-16 text-jazz-gold mx-auto mb-4" />
      <h1 class="text-4xl font-heading font-bold text-jazz-espresso mb-2">404</h1>
      <p class="text-jazz-smoke mb-6 font-heading italic">This page hit a wrong note.</p>
      <router-link
        to="/"
        class="px-6 py-2.5 bg-jazz-gold text-white rounded-lg font-medium hover:bg-jazz-brass transition-colors"
      >
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>
