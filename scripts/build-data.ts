import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_DIR = path.resolve(__dirname, '../../')
const OUT_DIR = path.resolve(__dirname, '../src/data')

fs.mkdirSync(OUT_DIR, { recursive: true })

// ============================================================
// 1. Parse syllabus.md into structured JSON
// ============================================================

function parseSyllabus() {
  const raw = fs.readFileSync(path.join(SOURCE_DIR, 'syllabus.md'), 'utf-8')
  const lines = raw.split('\n')

  interface Module {
    id: string; title: string; level: string; duration: string
    prerequisites: string; description: string; units: Unit[]
  }
  interface Unit {
    id: string; title: string; estimatedTime: string
    learningObjectives: string[]; coreConcepts: { term: string; description: string }[]
    recommendedVideos: { type: string; query: string }[]
    exercises: { description: string; dailyTime: string }[]
    assessment: string[]; relatedGuideSlug: string | null
  }

  const modules: Module[] = []
  let currentModule: Module | null = null
  let currentUnit: Unit | null = null
  let currentSection = ''
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Module heading: ## Module N: Title
    const moduleMatch = line.match(/^## Module (\d+):\s*(.+)/)
    if (moduleMatch) {
      if (currentUnit && currentModule) currentModule.units.push(currentUnit)
      if (currentModule) modules.push(currentModule)

      currentUnit = null
      currentSection = ''

      // Parse the metadata line after module heading
      let level = '', duration = '', prerequisites = '', description = ''
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const metaMatch = lines[j].match(/^\*\*Level:\*\*\s*(.+?)\s*\|\s*\*\*Duration:\*\*\s*(.+?)\s*\|\s*\*\*Prerequisites:\*\*\s*(.+)/)
        if (metaMatch) {
          level = metaMatch[1].trim()
          duration = metaMatch[2].trim()
          prerequisites = metaMatch[3].trim()
        }
        const descMatch = lines[j].match(/^\*(.+)\*$/)
        if (descMatch) {
          description = descMatch[1].trim()
        }
      }

      currentModule = {
        id: moduleMatch[1],
        title: moduleMatch[2].trim(),
        level,
        duration,
        prerequisites,
        description,
        units: [],
      }
      i++
      continue
    }

    // Unit heading: ### Unit N.M: Title
    const unitMatch = line.match(/^### Unit ([\d.]+):\s*(.+)/)
    if (unitMatch && currentModule) {
      if (currentUnit) currentModule.units.push(currentUnit)
      currentSection = ''
      currentUnit = {
        id: unitMatch[1],
        title: unitMatch[2].replace(/\s*--\s*/g, ' - ').trim(),
        estimatedTime: '',
        learningObjectives: [],
        coreConcepts: [],
        recommendedVideos: [],
        exercises: [],
        assessment: [],
        relatedGuideSlug: null,
      }
      i++
      continue
    }

    // Estimated time
    if (currentUnit) {
      const timeMatch = line.match(/^\*\*Estimated time:\*\*\s*(.+)/)
      if (timeMatch) {
        currentUnit.estimatedTime = timeMatch[1].trim()
        i++
        continue
      }
    }

    // Section headers within a unit
    const sectionMatch = line.match(/^#### (.+)/)
    if (sectionMatch && currentUnit) {
      currentSection = sectionMatch[1].trim().toLowerCase()
      i++
      continue
    }

    // Parse content based on current section
    if (currentUnit && currentSection) {
      // Learning Objectives - bullet points
      if (currentSection.includes('learning objectives')) {
        const bullet = line.match(/^- (.+)/)
        if (bullet) {
          currentUnit.learningObjectives.push(bullet[1].trim())
        }
      }

      // Core Concepts - bold term + description
      if (currentSection.includes('core concepts')) {
        const conceptMatch = line.match(/^- \*\*(.+?):\*\*\s*(.+)/)
        if (conceptMatch) {
          currentUnit.coreConcepts.push({
            term: conceptMatch[1].trim(),
            description: conceptMatch[2].trim(),
          })
        }
      }

      // Recommended Videos - search and playlist entries
      if (currentSection.includes('recommended videos')) {
        const searchMatch = line.match(/^- \*\*Search:\*\*\s*(.+)/)
        if (searchMatch) {
          currentUnit.recommendedVideos.push({
            type: 'search',
            query: searchMatch[1].replace(/^Jens Larsen \+ /, '').trim(),
          })
        }
        const playlistMatch = line.match(/^- \*\*Playlist:\*\*\s*"?(.+?)"?\s*$/)
        if (playlistMatch) {
          currentUnit.recommendedVideos.push({
            type: 'playlist',
            query: playlistMatch[1].trim(),
          })
        }
      }

      // Practice Exercises - table rows
      if (currentSection.includes('practice exercises')) {
        const tableRow = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/)
        if (tableRow && !tableRow[1].includes('---') && !tableRow[1].toLowerCase().includes('exercise')) {
          currentUnit.exercises.push({
            description: tableRow[1].trim(),
            dailyTime: tableRow[2].trim(),
          })
        }
      }

      // Assessment - bullet points
      if (currentSection.includes('assessment')) {
        const bullet = line.match(/^- (.+)/)
        if (bullet) {
          currentUnit.assessment.push(bullet[1].trim())
        }
      }
    }

    i++
  }

  // Don't forget the last unit/module
  if (currentUnit && currentModule) currentModule.units.push(currentUnit)
  if (currentModule) modules.push(currentModule)

  // Cross-reference units to practice guides
  const guideMap: Record<string, string> = {
    'shell voicings': '01-shell-voicings',
    'drop 2': '02-drop2-voicings',
    'chord tone': '03-chord-tone-soloing',
    'first steps in improvisation': '03-chord-tone-soloing',
    'arpeggios': '04-arpeggios',
    'pentatonic': '05-pentatonic-jazz',
    'jazz blues': '06-jazz-blues',
    'ii-v-i': '07-ii-v-i',
    'bebop': '08-bebop-vocabulary',
    'altered': '09-altered-dominant',
    'melodic minor': '10-melodic-minor',
    'rhythm changes': '11-rhythm-changes',
    'walking bass': '12-walking-bass-chords',
    'chord melody': '13-chord-melody',
    'comping': '14-comping-patterns',
    'quartal': '15-quartal-harmony',
    'chromatic': '16-chromatic-enclosures',
    'outside': '17-outside-playing',
    'tritone': '18-tritone-substitution',
    'transcription': '19-transcription-method',
    'practice methodology': '20-practice-methodology',
  }

  for (const mod of modules) {
    for (const unit of mod.units) {
      const titleLower = unit.title.toLowerCase()
      for (const [keyword, slug] of Object.entries(guideMap)) {
        if (titleLower.includes(keyword)) {
          unit.relatedGuideSlug = slug
          break
        }
      }
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'syllabus.json'), JSON.stringify(modules, null, 2))
  console.log(`  Parsed ${modules.length} modules, ${modules.reduce((s, m) => s + m.units.length, 0)} units`)
  return modules
}

// ============================================================
// 2. Copy and derive video/category data
// ============================================================

function processVideos() {
  const videos = JSON.parse(
    fs.readFileSync(path.join(SOURCE_DIR, 'categorized-videos.json'), 'utf-8')
  )

  // Derive categories
  const catMap = new Map<string, { name: string; subs: Map<string, { name: string; count: number }> }>()

  const topCategoryNames: Record<string, string> = {
    '1': 'Fundamentals',
    '2': 'Chord Voicings',
    '3': 'Comping & Accompaniment',
    '4': 'Improvisation Foundations',
    '5': 'Advanced Improvisation',
    '6': 'Standards & Repertoire',
    '7': 'Technical Development',
    '8': 'Phrasing & Musicianship',
    '9': 'Music Theory & Analysis',
    '10': 'Artist Studies',
    '11': 'Gear & Performance',
  }

  for (const video of videos) {
    const topId = video.category.split('.')[0]
    if (!catMap.has(topId)) {
      catMap.set(topId, {
        name: topCategoryNames[topId] || `Category ${topId}`,
        subs: new Map(),
      })
    }
    const cat = catMap.get(topId)!
    if (!cat.subs.has(video.category)) {
      cat.subs.set(video.category, { name: video.categoryName, count: 0 })
    }
    cat.subs.get(video.category)!.count++
  }

  const categories = Array.from(catMap.entries())
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([id, data]) => {
      const subcategories = Array.from(data.subs.entries())
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .map(([subId, sub]) => ({ id: subId, name: sub.name, videoCount: sub.count }))
      return {
        id,
        name: data.name,
        subcategories,
        videoCount: subcategories.reduce((s, sc) => s + sc.videoCount, 0),
      }
    })

  fs.writeFileSync(path.join(OUT_DIR, 'videos.json'), JSON.stringify(videos, null, 2))
  fs.writeFileSync(path.join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2))
  console.log(`  Copied ${videos.length} videos, derived ${categories.length} top categories`)
}

// ============================================================
// 3. Compile practice guides
// ============================================================

function processGuides() {
  const guidesDir = path.join(SOURCE_DIR, 'practice-guides')
  const files = fs.readdirSync(guidesDir).filter(f => f.endsWith('.md')).sort()

  const guides = files.map((file, idx) => {
    const content = fs.readFileSync(path.join(guidesDir, file), 'utf-8')
    const slug = file.replace('.md', '')

    // Parse title
    const titleMatch = content.match(/^# Practice Guide:\s*(.+)/m)
    const title = titleMatch ? titleMatch[1].trim() : slug

    // Parse overview
    const overviewMatch = content.match(/## Overview\n\n([\s\S]*?)(?=\n## )/)
    const overview = overviewMatch ? overviewMatch[1].trim() : ''

    // Parse prerequisites
    const prereqMatch = content.match(/## Prerequisites\n\n([\s\S]*?)(?=\n## )/)
    const prerequisites: string[] = []
    if (prereqMatch) {
      const lines = prereqMatch[1].trim().split('\n')
      for (const line of lines) {
        const bullet = line.match(/^- (.+)/)
        if (bullet) prerequisites.push(bullet[1].trim())
      }
    }

    // Parse video references
    const videoRefs: { title: string; url: string; videoId: string; description: string }[] = []
    const videoSection = content.match(/## Recommended Video Sequence\n\n([\s\S]*?)(?=\n## )/)
    if (videoSection) {
      const videoRegex = /\d+\.\s+\*\*(.+?)\*\*\s*-\s*(https:\/\/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\s*--\s*(.+)/g
      let match
      while ((match = videoRegex.exec(videoSection[1])) !== null) {
        videoRefs.push({
          title: match[1].trim(),
          url: match[2].trim(),
          videoId: match[3].trim(),
          description: match[4].trim(),
        })
      }
    }

    return {
      slug,
      title,
      overview,
      content,
      prerequisites,
      videoReferences: videoRefs,
      order: idx + 1,
    }
  })

  fs.writeFileSync(path.join(OUT_DIR, 'practice-guides.json'), JSON.stringify(guides, null, 2))
  console.log(`  Compiled ${guides.length} practice guides`)
}

// ============================================================
// 4. Copy transcript summaries
// ============================================================

function copyTranscripts() {
  const src = path.join(SOURCE_DIR, 'transcript-summaries.json')
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT_DIR, 'transcript-summaries.json'))
    const data = JSON.parse(fs.readFileSync(src, 'utf-8'))
    console.log(`  Copied ${Object.keys(data).length} transcript summaries`)
  }
}

// ============================================================
// 5. Create achievements.json
// ============================================================

function createAchievements() {
  const achievements = [
    // Practice
    { id: 'first-session', title: 'First Steps', description: 'Log your first practice session', icon: '👣', category: 'practice', condition: { type: 'practice_sessions', threshold: 1 } },
    { id: 'practice-10', title: 'Getting Serious', description: 'Log 10 practice sessions', icon: '🎵', category: 'practice', condition: { type: 'practice_sessions', threshold: 10 } },
    { id: 'practice-50', title: 'Dedicated Student', description: 'Log 50 practice sessions', icon: '🔥', category: 'practice', condition: { type: 'practice_sessions', threshold: 50 } },
    { id: 'practice-100', title: 'Centurion', description: 'Log 100 practice sessions', icon: '🏆', category: 'practice', condition: { type: 'practice_sessions', threshold: 100 } },
    { id: 'hours-1', title: 'One Hour Down', description: 'Practice for 1 total hour', icon: '🕐', category: 'practice', condition: { type: 'practice_minutes', threshold: 60 } },
    { id: 'hours-10', title: 'Ten Hour Club', description: 'Practice for 10 total hours', icon: '🕙', category: 'practice', condition: { type: 'practice_minutes', threshold: 600 } },
    { id: 'hours-50', title: 'Fifty Hours', description: 'Practice for 50 total hours', icon: '⭐', category: 'practice', condition: { type: 'practice_minutes', threshold: 3000 } },
    { id: 'hours-100', title: '100 Hour Guitarist', description: 'Practice for 100 total hours', icon: '🎸', category: 'practice', condition: { type: 'practice_minutes', threshold: 6000 } },

    // Streaks
    { id: 'streak-3', title: "Three's a Charm", description: 'Maintain a 3-day practice streak', icon: '3️⃣', category: 'streak', condition: { type: 'streak_days', threshold: 3 } },
    { id: 'streak-7', title: 'One Week Strong', description: 'Maintain a 7-day practice streak', icon: '📅', category: 'streak', condition: { type: 'streak_days', threshold: 7 } },
    { id: 'streak-14', title: 'Two Week Warrior', description: 'Maintain a 14-day practice streak', icon: '💪', category: 'streak', condition: { type: 'streak_days', threshold: 14 } },
    { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day practice streak', icon: '👑', category: 'streak', condition: { type: 'streak_days', threshold: 30 } },
    { id: 'streak-60', title: 'Relentless', description: 'Maintain a 60-day practice streak', icon: '⚡', category: 'streak', condition: { type: 'streak_days', threshold: 60 } },
    { id: 'streak-100', title: 'The Hundred', description: 'Maintain a 100-day practice streak', icon: '💯', category: 'streak', condition: { type: 'streak_days', threshold: 100 } },

    // Curriculum
    { id: 'first-lesson', title: 'Student of Jazz', description: 'Complete your first lesson', icon: '📖', category: 'curriculum', condition: { type: 'lessons_completed', threshold: 1 } },
    { id: 'first-unit', title: 'Unit Complete', description: 'Complete a full unit', icon: '✅', category: 'curriculum', condition: { type: 'units_completed', threshold: 1 } },
    { id: 'module-1', title: 'Jazz Foundations', description: 'Complete Module 1', icon: '🎓', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '1' } },
    { id: 'module-2', title: 'Vocabulary Builder', description: 'Complete Module 2', icon: '📚', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '2' } },
    { id: 'module-3', title: 'Intermediate Jazzcat', description: 'Complete Module 3', icon: '🎷', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '3' } },
    { id: 'module-4', title: 'Advanced Harmonist', description: 'Complete Module 4', icon: '🎹', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '4' } },
    { id: 'module-5', title: 'Modern Jazz Explorer', description: 'Complete Module 5', icon: '🌟', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '5' } },
    { id: 'module-6', title: 'Jazz Master', description: 'Complete Module 6', icon: '👨‍🎓', category: 'curriculum', condition: { type: 'modules_completed', threshold: 1, moduleId: '6' } },
    { id: 'all-modules', title: 'Curriculum Complete', description: 'Complete all 6 modules', icon: '🎓', category: 'curriculum', condition: { type: 'modules_completed', threshold: 6 } },

    // Videos
    { id: 'video-1', title: 'First Lesson Watched', description: 'Watch your first video', icon: '📺', category: 'videos', condition: { type: 'videos_watched', threshold: 1 } },
    { id: 'video-25', title: 'Quarter Century', description: 'Watch 25 videos', icon: '🎬', category: 'videos', condition: { type: 'videos_watched', threshold: 25 } },
    { id: 'video-100', title: 'Century of Lessons', description: 'Watch 100 videos', icon: '💯', category: 'videos', condition: { type: 'videos_watched', threshold: 100 } },
    { id: 'video-250', title: 'Dedicated Viewer', description: 'Watch 250 videos', icon: '👀', category: 'videos', condition: { type: 'videos_watched', threshold: 250 } },
    { id: 'video-500', title: 'Half the Catalog', description: 'Watch 500 videos', icon: '🍿', category: 'videos', condition: { type: 'videos_watched', threshold: 500 } },

    // Explorer
    { id: 'guide-1', title: 'Guide Reader', description: 'Read your first practice guide', icon: '📜', category: 'explorer', condition: { type: 'guides_read', threshold: 1 } },
    { id: 'guide-10', title: 'Deep Diver', description: 'Read 10 practice guides', icon: '🔍', category: 'explorer', condition: { type: 'guides_read', threshold: 10 } },
    { id: 'guide-all', title: 'Study Complete', description: 'Read all 20 practice guides', icon: '📚', category: 'explorer', condition: { type: 'guides_read', threshold: 20 } },
  ]

  fs.writeFileSync(path.join(OUT_DIR, 'achievements.json'), JSON.stringify(achievements, null, 2))
  console.log(`  Created ${achievements.length} achievements`)
}

// ============================================================
// Run all
// ============================================================

console.log('Building data files...')
parseSyllabus()
processVideos()
processGuides()
copyTranscripts()
createAchievements()
console.log('Done!')
