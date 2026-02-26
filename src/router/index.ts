import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
        { path: 'syllabus', name: 'syllabus', component: () => import('@/pages/SyllabusPage.vue') },
        { path: 'syllabus/:moduleId', name: 'module', component: () => import('@/pages/ModulePage.vue'), props: true },
        { path: 'syllabus/:moduleId/:unitId', name: 'unit', component: () => import('@/pages/UnitPage.vue'), props: true },
        { path: 'videos', name: 'videos', component: () => import('@/pages/VideosPage.vue') },
        { path: 'videos/:videoId', name: 'video-detail', component: () => import('@/pages/VideoDetailPage.vue'), props: true },
        { path: 'guides', name: 'guides', component: () => import('@/pages/PracticeGuidesPage.vue') },
        { path: 'guides/:slug', name: 'guide-detail', component: () => import('@/pages/PracticeGuideDetailPage.vue'), props: true },
        { path: 'practice', name: 'practice', component: () => import('@/pages/PracticePage.vue') },
        { path: 'practice/log', name: 'practice-log', component: () => import('@/pages/PracticeLogPage.vue') },
        { path: 'achievements', name: 'achievements', component: () => import('@/pages/AchievementsPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
