// === Syllabus Types ===

export interface Module {
  id: string
  title: string
  level: string
  duration: string
  prerequisites: string
  description: string
  units: Unit[]
}

export interface Unit {
  id: string
  title: string
  estimatedTime: string
  learningObjectives: string[]
  coreConcepts: CoreConcept[]
  recommendedVideos: VideoReference[]
  exercises: Exercise[]
  assessment: string[]
  relatedGuideSlug: string | null
}

export interface CoreConcept {
  term: string
  description: string
}

export interface VideoReference {
  type: 'search' | 'playlist'
  query: string
}

export interface Exercise {
  description: string
  dailyTime: string
}

// === Video Types ===

export interface Video {
  id: string
  title: string
  category: string
  categoryName: string
  level: number
  duration: number
  view_count: number
  url: string
}

export interface TopCategory {
  id: string
  name: string
  subcategories: SubCategory[]
  videoCount: number
}

export interface SubCategory {
  id: string
  name: string
  videoCount: number
}

export interface VideoFilters {
  searchQuery: string
  categoryId: string | null
  subCategoryId: string | null
  difficulty: [number, number]
  sortBy: 'title' | 'views' | 'duration' | 'difficulty'
  sortOrder: 'asc' | 'desc'
}

// === Practice Guide Types ===

export interface PracticeGuide {
  slug: string
  title: string
  overview: string
  content: string
  prerequisites: string[]
  videoReferences: GuideVideoRef[]
  order: number
}

export interface GuideVideoRef {
  title: string
  url: string
  videoId: string
  description: string
}

// === Practice Types ===

export interface PracticeLogEntry {
  id: string
  date: string
  duration: number
  topic: string
  unitId: string | null
  guideSlug: string | null
  notes: string
  rating: 1 | 2 | 3 | 4 | 5
}

export interface DailyPlanBlock {
  label: string
  duration: number
  description: string
  relatedUnitId: string | null
  relatedGuideSlug: string | null
}

// === Progress Types ===

export interface VideoProgress {
  lastWatchedAt: string
  completed: boolean
}

// === Gamification Types ===

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'practice' | 'streak' | 'curriculum' | 'videos' | 'explorer'
  condition: AchievementCondition
}

export interface AchievementCondition {
  type: 'practice_sessions' | 'practice_minutes' | 'streak_days' | 'videos_watched' |
        'lessons_completed' | 'units_completed' | 'modules_completed' | 'guides_read' |
        'first_action'
  threshold: number
  moduleId?: string
}

export interface UnlockInfo {
  unlockedAt: string
  notified: boolean
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastPracticeDate: string | null
  practiceDates: string[]
}

// === Transcript Types ===

export interface TranscriptSummary {
  title: string
  text: string
  full_length: number
}
