import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { getAnalyticsOverview, type OverviewData, type WeakTopic } from '../services/analyticsApi'
import { extractApiErrorMessage } from '../services/errorUtils'

const challengePromptByTopic = (topic: string) => {
  const lower = topic.toLowerCase()
  if (lower.includes('array')) {
    return 'Solve an array boundary challenge. Avoid off-by-one errors and add edge-case tests.'
  }
  if (lower.includes('recursion')) {
    return 'Refactor a recursive solution with explicit base cases and stack-depth safety.'
  }
  if (lower.includes('null') || lower.includes('object')) {
    return 'Harden object handling with null-safe guards and optional chaining checks.'
  }
  if (lower.includes('loop')) {
    return 'Debug a loop-heavy snippet and fix iterator bounds plus break conditions.'
  }
  return `Create a targeted challenge for ${topic}: include edge cases, failure mode analysis, and a corrected solution.`
}

const riskLabel = (score: number) => {
  if (score >= 75) {
    return 'Critical focus'
  }
  if (score >= 50) {
    return 'High focus'
  }
  if (score >= 30) {
    return 'Medium focus'
  }
  return 'Low focus'
}

const trendToneClass = (trend: WeakTopic['trend']) => {
  if (trend === 'declining') {
    return 'text-red-300'
  }
  if (trend === 'improving') {
    return 'text-emerald-300'
  }
  return 'text-amber-200'
}

const sprintGrade = (score: number) => {
  if (score >= 85) {
    return 'A'
  }
  if (score >= 70) {
    return 'B'
  }
  if (score >= 55) {
    return 'C'
  }
  if (score >= 40) {
    return 'D'
  }
  return 'E'
}

const Analytics = () => {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getAnalyticsOverview()
        setOverview(data)
      } catch (err) {
        setError(extractApiErrorMessage(err, 'Failed to load analytics'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const sprintInsight = useMemo(() => {
    if (!overview) {
      return null
    }

    const topWeak = overview.weakTopics[0]
    const decliningCount = overview.weakTopics.filter((topic) => topic.trend === 'declining').length
    const totalAttempts = overview.weeklyTrend.reduce((sum, point) => sum + point.count, 0)
    const dailyTarget = Math.max(2, Math.ceil(totalAttempts / 7) + 1)

    return {
      topWeak,
      decliningCount,
      dailyTarget,
      message: topWeak
        ? `Your biggest improvement opportunity is ${topWeak.topic}. Lock a 7-day sprint and target ${dailyTarget} focused submissions/day.`
        : 'No weak-topic data yet. Start analyzing code submissions to unlock your personalized sprint plan.',
    }
  }, [overview])

  const sprintProgress = useMemo(() => {
    if (!overview) {
      return { score: 0, grade: 'E', consistency: 0, riskPenalty: 0, trendBonus: 0 }
    }

    const points = overview.weeklyTrend
    const activeDays = points.filter((point) => point.count > 0).length
    const consistency = Math.round((activeDays / 7) * 100)

    let trendBonus = 0
    for (let i = 1; i < points.length; i += 1) {
      if (points[i].count > points[i - 1].count) {
        trendBonus += 4
      } else if (points[i].count < points[i - 1].count) {
        trendBonus -= 3
      }
    }

    const weak = overview.weakTopics.slice(0, 3)
    const weightedRisk =
      weak.length > 0
        ? weak.reduce((sum, topic) => sum + topic.weaknessScore, 0) / weak.length
        : 0
    const riskPenalty = Math.round(weightedRisk * 0.45)

    const rawScore = 45 + consistency * 0.45 + trendBonus - riskPenalty
    const score = Math.max(0, Math.min(100, Math.round(rawScore)))

    return {
      score,
      grade: sprintGrade(score),
      consistency,
      riskPenalty,
      trendBonus,
    }
  }, [overview])

  const weeklyChartData = useMemo(() => {
    if (!overview) {
      return []
    }
    return overview.weeklyTrend.map((point) => ({
      day: point.date.slice(5),
      submissions: point.count,
    }))
  }, [overview])

  const weaknessBars = useMemo(() => {
    if (!overview) {
      return []
    }
    return overview.weakTopics.slice(0, 5).map((topic) => ({
      topic: topic.topic,
      weakness: topic.weaknessScore,
    }))
  }, [overview])

  const handleStartChallenge = (topic: string) => {
    const prompt = challengePromptByTopic(topic)
    navigate(`/code-submission?topic=${encodeURIComponent(topic)}&prompt=${encodeURIComponent(prompt)}`)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-slate-100">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Lab</p>
        <h1 className="mb-2 mt-3 text-4xl font-bold tracking-tight">Focus Sprint Studio</h1>
        <p className="text-sm text-slate-300">Building your personalized analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-slate-100">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Lab</p>
        <h1 className="mb-2 mt-3 text-4xl font-bold tracking-tight">Focus Sprint Studio</h1>
        <div className="saas-card space-y-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p>{error}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/code-submission')}
              className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Analyze New Code
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-slate-500/70 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
            >
              Back To Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasWeakTopics = Boolean((overview?.weakTopics || []).length)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-slate-100">
      <header className="showcase-surface rounded-2xl p-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Lab</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Focus Sprint Studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Transform weak-topic data into a weekly execution plan with measurable outcomes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="brand-sticker brand-sticker-cyan">MISSION CONTROL</span>
          <span className="brand-sticker brand-sticker-amber">WEEKLY SPRINT</span>
        </div>
      </header>

      <div className="saas-card rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-slate-900/65 via-slate-900/40 to-cyan-900/30 p-6">
        <p className="text-sm text-cyan-100/90">{sprintInsight?.message}</p>
        <div className="mt-4 rounded-2xl border border-cyan-300/30 bg-black/20 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-200">Sprint Progress Score</p>
              <div className="mt-1 flex items-end gap-3">
                <p className="text-4xl font-black text-cyan-300">{sprintProgress.score}</p>
                <p className="mb-1 rounded-md bg-cyan-400/20 px-2 py-1 text-sm font-semibold text-cyan-100">
                  Grade {sprintProgress.grade}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-cyan-100/90">
              <p>Consistency: {sprintProgress.consistency}%</p>
              <p>Trend boost: {sprintProgress.trendBonus >= 0 ? `+${sprintProgress.trendBonus}` : sprintProgress.trendBonus}</p>
              <p>Risk penalty: -{sprintProgress.riskPenalty}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-600/50 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Total submissions</p>
            <p className="mt-1 text-2xl font-semibold">{overview?.totalSubmissions ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-600/50 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Declining topics</p>
            <p className="mt-1 text-2xl font-semibold">{sprintInsight?.decliningCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-600/50 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Daily sprint target</p>
            <p className="mt-1 text-2xl font-semibold">{sprintInsight?.dailyTarget ?? 2} tasks</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="saas-card hover-lift rounded-2xl p-5">
          <h2 className="mb-4 text-xl font-semibold">7-Day Submission Rhythm</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#cbd5e1" />
                <YAxis allowDecimals={false} stroke="#cbd5e1" />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#22d3ee" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="saas-card hover-lift rounded-2xl p-5">
          <h2 className="mb-4 text-xl font-semibold">Weakness Heat</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weaknessBars} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#cbd5e1" />
                <YAxis type="category" dataKey="topic" width={110} stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="weakness" fill="#38bdf8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="saas-card hover-lift rounded-2xl p-5">
        <h2 className="mb-4 text-xl font-semibold">Challenge Generator</h2>
        {!hasWeakTopics ? (
          <div className="space-y-3 rounded-xl border border-slate-600/50 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-300">
              No weak-topic analytics yet. Submit a few code analyses to unlock personalized challenges.
            </p>
            <button
              type="button"
              onClick={() => navigate('/code-submission')}
              className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Start First Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(overview?.weakTopics || []).slice(0, 3).map((topic) => (
            <div key={topic.topic} className="rounded-2xl border border-slate-600/50 bg-slate-900/40 p-4">
              <p className="text-lg font-semibold">{topic.topic}</p>
              <p className={`mt-1 text-sm ${trendToneClass(topic.trend)}`}>Trend: {topic.trend}</p>
              <p className="mt-2 text-xs text-slate-300">
                {riskLabel(topic.weaknessScore)} • score {topic.weaknessScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {topic.bugCount} bugs in {topic.totalSubmissions} submissions
              </p>
              <button
                type="button"
                onClick={() => handleStartChallenge(topic.topic)}
                className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
              >
                Start challenge
              </button>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
