import type { CoachInsights } from '../services/analyticsApi'

type WeeklyProgressWidgetProps = {
  weeklyProgress: CoachInsights['weeklyProgress']
}

const trendTone = (trend: CoachInsights['weeklyProgress']['trend']) => {
  if (trend === 'improving') {
    return 'text-emerald-300'
  }
  if (trend === 'declining') {
    return 'text-rose-300'
  }
  return 'text-amber-200'
}

const WeeklyProgressWidget = ({ weeklyProgress }: WeeklyProgressWidgetProps) => {
  return (
    <section className="saas-card showcase-surface rounded-2xl border border-violet-300/25 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-violet-900/35 p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Adaptive Coach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Weekly Progress 🏁</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="brand-sticker brand-sticker-cyan">SCOREBOARD</span>
            <span className="brand-sticker brand-sticker-emerald">TREND SIGNAL</span>
          </div>
        </div>
        <span className="brand-sticker brand-sticker-amber">
          🏆 Grade {weeklyProgress.grade}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Coach score</p>
          <p className="mt-1 text-xl font-semibold text-white">{weeklyProgress.score}</p>
        </div>
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Consistency</p>
          <p className="mt-1 text-xl font-semibold text-cyan-200">{weeklyProgress.consistency}%</p>
        </div>
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current streak</p>
          <p className="mt-1 text-xl font-semibold text-emerald-200">{weeklyProgress.streakDays} days</p>
        </div>
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Trend</p>
          <p className={`mt-1 text-xl font-semibold capitalize ${trendTone(weeklyProgress.trend)}`}>{weeklyProgress.trend}</p>
        </div>
      </div>
    </section>
  )
}

export default WeeklyProgressWidget
