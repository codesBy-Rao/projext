import { useNavigate } from 'react-router-dom'
import type { CoachInsights } from '../services/analyticsApi'

type DailyMissionCardProps = {
  mission: CoachInsights['dailyMission']
}

const DailyMissionCard = ({ mission }: DailyMissionCardProps) => {
  const navigate = useNavigate()
  const progress = Math.min(100, Math.round((mission.completedToday / Math.max(1, mission.targetSubmissions)) * 100))

  return (
    <section className="saas-card rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Adaptive Coach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Daily Mission</h2>
        </div>
        <span className="rounded-xl bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-cyan-300/30">
          Topic: {mission.topic}
        </span>
      </div>

      <p className="text-sm text-slate-300">{mission.message}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Target submissions</p>
          <p className="mt-1 text-xl font-semibold text-white">{mission.targetSubmissions}</p>
        </div>
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Completed today</p>
          <p className="mt-1 text-xl font-semibold text-cyan-200">{mission.completedToday}</p>
        </div>
        <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Bug reduction target</p>
          <p className="mt-1 text-xl font-semibold text-emerald-200">{mission.targetBugReductionPercent}%</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>Mission progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/code-submission')}
        className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(56,189,248,0.42)]"
      >
        Start Mission Now
      </button>
    </section>
  )
}

export default DailyMissionCard
