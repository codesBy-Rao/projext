import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnalyticsOverview, type WeakTopic } from '../services/analyticsApi'

type TopicChallengeSeed = {
  topic: string
  weakness: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  bugCount: number
  challengeTitle: string
  description: string
  estimatedMinutes: number
}

const mockChallengeSeeds: TopicChallengeSeed[] = [
  {
    topic: 'Arrays',
    weakness: 74,
    difficulty: 'Intermediate',
    bugCount: 11,
    challengeTitle: 'Repair 5 Off-by-One Array Loops',
    description:
      'Fix boundary and indexing mistakes in five short snippets, then write safe edge-case tests for empty and single-item arrays.',
    estimatedMinutes: 20,
  },
  {
    topic: 'Loops',
    weakness: 63,
    difficulty: 'Intermediate',
    bugCount: 9,
    challengeTitle: 'Stabilize Loop Termination Logic',
    description:
      'Resolve infinite-loop and break-condition bugs across mixed while/for snippets while preserving expected output.',
    estimatedMinutes: 18,
  },
  {
    topic: 'Recursion',
    weakness: 68,
    difficulty: 'Advanced',
    bugCount: 10,
    challengeTitle: 'Refactor Recursive Base Cases',
    description:
      'Repair recursive functions with missing base cases and incorrect return propagation without changing function signatures.',
    estimatedMinutes: 25,
  },
  {
    topic: 'Null Safety',
    weakness: 81,
    difficulty: 'Beginner',
    bugCount: 14,
    challengeTitle: 'Fix 3 Broken Null-Check Snippets',
    description:
      'Patch null/undefined crashes in object access code using defensive guards, optional chaining, and safe defaults.',
    estimatedMinutes: 15,
  },
  {
    topic: 'DP',
    weakness: 49,
    difficulty: 'Advanced',
    bugCount: 6,
    challengeTitle: 'Complete Missing DP State Transitions',
    description:
      'Fill in broken state transitions and initialization logic in classic dynamic-programming templates.',
    estimatedMinutes: 28,
  },
  {
    topic: 'Graphs',
    weakness: 57,
    difficulty: 'Advanced',
    bugCount: 8,
    challengeTitle: 'Debug BFS/DFS Traversal Edge Cases',
    description:
      'Correct traversal order and visited-node bugs in graph exploration snippets with disconnected components.',
    estimatedMinutes: 24,
  },
]

const difficultyTone = (difficulty: TopicChallengeSeed['difficulty']) => {
  if (difficulty === 'Advanced') {
    return 'bg-rose-400/20 text-rose-200 ring-1 ring-rose-300/40'
  }
  if (difficulty === 'Intermediate') {
    return 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
  }
  return 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
}

const difficultyByWeakness = (weakness: number): TopicChallengeSeed['difficulty'] => {
  if (weakness >= 75) {
    return 'Advanced'
  }
  if (weakness >= 55) {
    return 'Intermediate'
  }
  return 'Beginner'
}

const challengeTitleByTopic = (topic: string) => {
  const lower = topic.toLowerCase()
  if (lower.includes('array')) {
    return 'Repair Array Boundary Logic Under Edge Cases'
  }
  if (lower.includes('recursion')) {
    return 'Refactor Recursive Base Cases and Return Paths'
  }
  if (lower.includes('graph')) {
    return 'Debug Traversal Order and Visited-State Bugs'
  }
  return `Stabilize ${topic} Bug Patterns`
}

const challengeDescriptionByTopic = (topic: string) => {
  return `Fix recurring ${topic} defects, add defensive edge-case handling, and validate with at least one targeted test.`
}

const PersonalizedChallengeWidget = () => {
  const navigate = useNavigate()
  const [liveTopics, setLiveTopics] = useState<WeakTopic[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoadError('')
        const overview = await getAnalyticsOverview()
        setLiveTopics(overview.weakTopics)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load personalized challenge')
      }
    }

    loadChallenges()
  }, [])

  const weakest = useMemo(() => {
    if (liveTopics.length === 0) {
      return [...mockChallengeSeeds].sort((a, b) => b.weakness - a.weakness)[0]
    }

    const top = [...liveTopics].sort((a, b) => b.weaknessScore - a.weaknessScore)[0]
    return {
      topic: top.topic,
      weakness: top.weaknessScore,
      difficulty: difficultyByWeakness(top.weaknessScore),
      bugCount: top.bugCount,
      challengeTitle: challengeTitleByTopic(top.topic),
      description: challengeDescriptionByTopic(top.topic),
      estimatedMinutes: Math.max(14, 14 + Math.round(top.weaknessScore / 7)),
    }
  }, [liveTopics])

  const handleStartChallenge = () => {
    const params = new URLSearchParams({
      source: 'personalized-challenge',
      practiceTask: weakest.challengeTitle,
      topic: weakest.topic,
      prompt: `Task: ${weakest.challengeTitle}\nTopic: ${weakest.topic}\nObjective: ${weakest.description}\n\nImplement a corrected solution and include one edge-case test.`,
    })

    navigate(`/code-submission?${params.toString()}`)
  }

  return (
    <section className="saas-card showcase-surface rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-blue-900/35 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Challenge Engine</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Personalized Challenge</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="brand-sticker brand-sticker-violet">FOCUS DRILL</span>
            <span className="brand-sticker brand-sticker-amber">WEAKEST TOPIC</span>
          </div>
        </div>
        <span className="brand-sticker brand-sticker-cyan">Top Priority Topic</span>
      </div>
      {loadError ? <p className="mb-3 text-xs text-amber-200">Live data unavailable, using fallback challenge.</p> : null}

      <div className="rounded-2xl border border-slate-600/60 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Topic</p>
            <p className="mt-1 text-lg font-semibold text-white">{weakest.topic}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Bug Count</p>
            <p className="mt-1 text-lg font-semibold text-cyan-200">{weakest.bugCount}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${difficultyTone(weakest.difficulty)}`}>
            {weakest.difficulty}
          </span>
          <span className="rounded-lg bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-100 ring-1 ring-violet-300/30">
            {weakest.estimatedMinutes} min{weakest.estimatedMinutes === 1 ? '' : 's'}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{weakest.challengeTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{weakest.description}</p>

        <button
          type="button"
          onClick={handleStartChallenge}
          className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(56,189,248,0.42)]"
        >
          Start Challenge Session
        </button>
      </div>
    </section>
  )
}

export default PersonalizedChallengeWidget
