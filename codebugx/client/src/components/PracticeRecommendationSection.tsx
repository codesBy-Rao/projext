import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnalyticsOverview, type WeakTopic } from '../services/analyticsApi'

type WeaknessTopic = {
  topic: string
  weaknessScore: number
}

type PracticeTask = {
  title: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedMinutes: number
  objective: string
}

const weaknessMap: WeaknessTopic[] = [
  { topic: 'Arrays', weaknessScore: 82 },
  { topic: 'Recursion', weaknessScore: 74 },
  { topic: 'Graphs', weaknessScore: 69 },
  { topic: 'Two Pointers', weaknessScore: 51 },
  { topic: 'Dynamic Programming', weaknessScore: 48 },
]

const allTasks: PracticeTask[] = [
  {
    title: 'Fix Off-by-One Windows',
    topic: 'Arrays',
    difficulty: 'Medium',
    estimatedMinutes: 20,
    objective: 'Patch broken sliding-window and boundary loops in 5 snippets.',
  },
  {
    title: 'Base Case Recovery Drill',
    topic: 'Recursion',
    difficulty: 'Hard',
    estimatedMinutes: 25,
    objective: 'Repair missing base cases and return propagation in recursive functions.',
  },
  {
    title: 'Disconnected Graph Hunt',
    topic: 'Graphs',
    difficulty: 'Medium',
    estimatedMinutes: 22,
    objective: 'Correct DFS/BFS traversal bugs with visited-state and component handling.',
  },
  {
    title: 'Pointer Bounds Tune-up',
    topic: 'Two Pointers',
    difficulty: 'Easy',
    estimatedMinutes: 16,
    objective: 'Resolve crossing-pointer and invalid index updates in two-pointer loops.',
  },
]

const getDifficulty = (weaknessScore: number): PracticeTask['difficulty'] => {
  if (weaknessScore >= 75) {
    return 'Hard'
  }
  if (weaknessScore >= 55) {
    return 'Medium'
  }
  return 'Easy'
}

const buildTitle = (topic: string, difficulty: PracticeTask['difficulty']) => {
  if (difficulty === 'Hard') {
    return `${topic} Failure-Mode Sprint`
  }
  if (difficulty === 'Medium') {
    return `${topic} Stability Drill`
  }
  return `${topic} Core Practice`
}

const difficultyTone = (difficulty: PracticeTask['difficulty']) => {
  if (difficulty === 'Hard') {
    return 'bg-rose-400/20 text-rose-100 ring-1 ring-rose-300/40'
  }
  if (difficulty === 'Medium') {
    return 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
  }
  return 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
}

const PracticeRecommendationSection = () => {
  const navigate = useNavigate()
  const [liveTopics, setLiveTopics] = useState<WeakTopic[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoadError('')
        const overview = await getAnalyticsOverview()
        setLiveTopics(overview.weakTopics)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load live recommendations')
      }
    }

    loadRecommendations()
  }, [])

  const fallbackTopics = [...weaknessMap]
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 3)

  const recommendedTopics = useMemo(() => {
    if (liveTopics.length === 0) {
      return fallbackTopics
    }

    return [...liveTopics]
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 3)
      .map((topic) => ({
        topic: topic.topic,
        weaknessScore: topic.weaknessScore,
      }))
  }, [liveTopics])

  const recommendedTopicNames = new Set(recommendedTopics.map((topic) => topic.topic))

  const recommendedTasks = useMemo(() => {
    if (liveTopics.length === 0) {
      return allTasks
        .filter((task) => recommendedTopicNames.has(task.topic))
        .slice(0, 3)
    }

    return liveTopics
      .filter((topic) => recommendedTopicNames.has(topic.topic))
      .slice(0, 3)
      .map((topic, index) => {
        const difficulty = getDifficulty(topic.weaknessScore)
        return {
          title: buildTitle(topic.topic, difficulty),
          topic: topic.topic,
          difficulty,
          estimatedMinutes: Math.max(14, 14 + index * 3 + Math.round(topic.weaknessScore / 18)),
          objective: `Resolve ${topic.bugCount} recurring bug patterns and submit a corrected solution with edge-case coverage.`,
        }
      })
  }, [liveTopics, recommendedTopicNames])

  const startPracticeSession = (task: PracticeTask) => {
    const params = new URLSearchParams({
      source: 'practice-recommendations',
      practiceTask: task.title,
      topic: task.topic,
      prompt: `Task: ${task.title}\nTopic: ${task.topic}\nObjective: ${task.objective}\n\nWrite your solution below and include at least one edge-case test.`,
    })

    navigate(`/code-submission?${params.toString()}`)
  }

  return (
    <section className="saas-card rounded-2xl p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Practice Coach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Practice Recommendations</h2>
        </div>
        <span className="rounded-xl border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
          Weakness-Based
        </span>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-600/60 bg-slate-900/40 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Recommended DSA Topics</p>
        {loadError ? <p className="mt-2 text-xs text-amber-200">Live data unavailable, showing fallback recommendations.</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendedTopics.map((topic) => (
            <span
              key={topic.topic}
              className="rounded-lg bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-100 ring-1 ring-violet-300/30"
            >
              {topic.topic} ({topic.weaknessScore})
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {recommendedTasks.map((task) => (
          <article key={task.title} className="rounded-2xl border border-slate-600/60 bg-slate-900/45 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-300/80">{task.topic}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{task.objective}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${difficultyTone(task.difficulty)}`}>
                {task.difficulty}
              </span>
              <span className="rounded-lg bg-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-slate-500/60">
                {task.estimatedMinutes} mins
              </span>
            </div>

            <button
              type="button"
              onClick={() => startPracticeSession(task)}
              aria-label={`Start ${task.title} practice task`}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(56,189,248,0.38)]"
            >
              Start Practice Session
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PracticeRecommendationSection
