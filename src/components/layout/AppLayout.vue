<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-jazz-cream">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <div class="flex">
      <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

      <main class="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:ml-64">
        <div class="max-w-6xl mx-auto">
          <router-view v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active {
  transition: opacity 0.15s ease;
}
.page-leave-active {
  transition: opacity 0.1s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
