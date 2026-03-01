<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { useSyllabusStore } from '@/stores/syllabus'
import { useProgressStore } from '@/stores/progress'
import { useGamificationStore } from '@/stores/gamification'
import BaseCard from '@/components/shared/BaseCard.vue'

const props = defineProps<{ slug: string }>()
const syllabus = useSyllabusStore()
const progress = useProgressStore()
const gamification = useGamificationStore()

const guide = computed(() => syllabus.getGuideBySlug(props.slug))

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

// Transform guide content for rendering
const renderedContent = computed(() => {
  if (!guide.value) return ''
  let content = guide.value.content
  // Strip "Recommended Video Sequence" section — already shown via videoReferences card above
  content = content.replace(/## Recommended Video Sequence\n\n[\s\S]*?(?=\n## |\n*$)/, '')
  // Replace guide cross-links (.md files) with app routes
  content = content.replace(
    /\((\d{2}-[\w-]+)\.md\)/g,
    '(#/guides/$1)'
  )
  // Replace any remaining YouTube links with clickable internal links
  content = content.replace(
    /https:\/\/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    '[Watch ▶](#/videos/$1)'
  )
  return md.render(content)
})

const allGuides = computed(() => syllabus.practiceGuides)
const currentIndex = computed(() =>
  allGuides.value.findIndex(g => g.slug === props.slug)
)
const prevGuide = computed(() => currentIndex.value > 0 ? allGuides.value[currentIndex.value - 1] : null)
const nextGuide = computed(() => currentIndex.value < allGuides.value.length - 1 ? allGuides.value[currentIndex.value + 1] : null)

onMounted(() => {
  if (guide.value) {
    progress.markGuideRead(props.slug)
    gamification.checkAchievements()
  }
})
</script>

<template>
  <div v-if="guide">
    <!-- Breadcrumb -->
    <nav class="text-xs text-jazz-smoke mb-6 font-mono uppercase tracking-wider">
      <router-link to="/guides" class="hover:text-jazz-blue">Practice Guides</router-link>
      <span class="mx-2">/</span>
      <span class="text-jazz-espresso normal-case tracking-normal">{{ guide.title }}</span>
    </nav>

    <!-- Header -->
    <div class="mb-8">
      <span class="text-xs text-jazz-gold font-heading tracking-[0.15em] uppercase">Guide {{ String(guide.order).padStart(2, '0') }}</span>
      <h1 class="text-3xl sm:text-4xl font-heading text-jazz-espresso mt-1 tracking-tight leading-none">{{ guide.title.toUpperCase() }}</h1>
      <div class="h-1 w-12 bg-jazz-gold mt-3"></div>
    </div>

    <!-- Video References -->
    <BaseCard v-if="guide.videoReferences.length > 0" class="mb-6">
      <h2 class="text-sm font-heading text-jazz-espresso uppercase tracking-[0.15em] mb-3">RECOMMENDED VIDEOS</h2>
      <div class="h-px bg-jazz-cream-dark mb-3"></div>
      <div class="space-y-2">
        <router-link
          v-for="vref in guide.videoReferences"
          :key="vref.videoId"
          :to="{ name: 'video-detail', params: { videoId: vref.videoId } }"
          class="flex items-center gap-3 p-2 hover:bg-jazz-cream transition-colors"
        >
          <img
            :src="`https://img.youtube.com/vi/${vref.videoId}/default.jpg`"
            :alt="vref.title"
            class="w-20 h-14 object-cover"
            loading="lazy"
          >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-jazz-espresso truncate">{{ vref.title }}</p>
            <p class="text-xs text-jazz-smoke truncate">{{ vref.description }}</p>
          </div>
        </router-link>
      </div>
    </BaseCard>

    <!-- Rendered Guide Content -->
    <BaseCard>
      <div class="markdown-content" v-html="renderedContent" />
    </BaseCard>

    <!-- Navigation -->
    <div class="h-[3px] bg-jazz-espresso mt-8 mb-6"></div>
    <div class="flex justify-between">
      <router-link
        v-if="prevGuide"
        :to="{ name: 'guide-detail', params: { slug: prevGuide.slug } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        ← {{ prevGuide.title }}
      </router-link>
      <div v-else />
      <router-link
        v-if="nextGuide"
        :to="{ name: 'guide-detail', params: { slug: nextGuide.slug } }"
        class="px-4 py-2 text-sm text-jazz-blue hover:bg-jazz-cream-dark transition-colors font-heading tracking-wider uppercase"
      >
        {{ nextGuide.title }} →
      </router-link>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-16">
    <p class="text-4xl font-heading text-jazz-espresso mb-4">GUIDE NOT FOUND</p>
    <p class="text-jazz-smoke mb-6">The practice guide you're looking for doesn't exist.</p>
    <router-link to="/guides" class="px-6 py-3 bg-jazz-espresso text-jazz-cream font-heading tracking-[0.15em] text-sm uppercase hover:bg-jazz-espresso-light transition-colors">
      Back to Practice Guides
    </router-link>
  </div>
</template>
