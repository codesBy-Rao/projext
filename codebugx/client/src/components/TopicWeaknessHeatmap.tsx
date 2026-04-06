import { useEffect, useMemo, useState } from 'react'
import { getAnalyticsOverview, type WeakTopic } from '../services/analyticsApi'

type TopicWeakness = {
  topic: string
  weakness: number
  suggestion: string
}

const mockWeaknessData: TopicWeakness[] = [
  { topic: 'Arrays', weakness: 80, suggestion: 'Needs immediate practice' },
  { topic: 'Loops', weakness: 64, suggestion: 'Review loop bounds and break conditions' },
  { topic: 'Recursion', weakness: 72, suggestion: 'Strengthen base case handling' },
  { topic: 'Null Safety', weakness: 58, suggestion: 'Add null guards and optional chaining' },
  { topic: 'DP', weakness: 46, suggestion: 'Practice state definition and transitions' },
  { topic: 'Graphs', weakness: 69, suggestion: 'Revisit BFS/DFS traversal patterns' },
]

const barColorByWeakness = (weakness: number) => {
  if (weakness >= 75) {
    return 'rgba(239, 68, 68, 0.95)'
  }
  if (weakness >= 60) {
    return 'rgba(249, 115, 22, 0.9)'
  }
  if (weakness >= 45) {
    return 'rgba(250, 204, 21, 0.88)'
  }
  return 'rgba(74, 222, 128, 0.85)'
}

const suggestionByWeakness = (topic: string, weakness: number, trend?: WeakTopic['trend']) => {
  if (weakness >= 75) {
    return `Critical: prioritize ${topic} daily until error rate stabilizes.`
  }
  if (trend === 'declining') {
    return `Declining trend: add focused ${topic} drills with boundary-case testing.`
  }
  if (weakness >= 60) {
    return `High priority: improve ${topic} with targeted bug-fix repetitions.`
  }
  return `Maintain momentum in ${topic} with short weekly refresh practice.`
}

const TopicWeaknessHeatmap = () => {
  const [liveTopics, setLiveTopics] = useState<WeakTopic[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadWeakness = async () => {
      try {
        setLoadError('')
        const overview = await getAnalyticsOverview()
        setLiveTopics(overview.weakTopics)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load weakness heatmap')
      }
    }

    loadWeakness()
  }, [])

  const heatmapRows = useMemo(() => {
    if (liveTopics.length === 0) {
      return mockWeaknessData
    }

    return liveTopics.slice(0, 6).map((topic) => ({
      topic: topic.topic,
      weakness: topic.weaknessScore,
      suggestion: suggestionByWeakness(topic.topic, topic.weaknessScore, topic.trend),
    }))
  }, [liveTopics])

  return (
    <section className="saas-card showcase-surface rounded-2xl p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-white">Weakness Heatmap</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="brand-sticker brand-sticker-cyan">SIGNAL VIEW</span>
        <span className="brand-sticker brand-sticker-emerald">ACTIONABLE INSIGHTS</span>
      </div>
      <p className="mt-1 text-sm text-slate-300">Topic-level weakness intensity with action-oriented guidance.</p>
      {loadError ? <p className="mt-2 text-xs text-amber-200">Live data unavailable, showing fallback preview.</p> : null}

      <div className="mt-5 space-y-4">
        {heatmapRows.map((item) => (
          <div key={item.topic} className="rounded-xl border border-slate-600/60 bg-slate-900/35 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-100">{item.topic}</p>
              <p className="text-sm font-semibold text-cyan-200">{item.weakness}%</p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.weakness}%`,
                  background: `linear-gradient(90deg, ${barColorByWeakness(item.weakness)}, rgba(99,102,241,0.88))`,
                  boxShadow: '0 0 12px rgba(56,189,248,0.25)',
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-300">{item.suggestion}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TopicWeaknessHeatmap
