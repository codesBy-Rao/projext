import { useMemo, useState } from 'react'
import type { CoachInsights } from '../services/analyticsApi'

type TieredHintPanelProps = {
  hintPlan: CoachInsights['hintPlan'] | null
  latestBugs: Array<{ type: string; severity: 'low' | 'medium' | 'high'; topic: string }>
}

const TieredHintPanel = ({ hintPlan, latestBugs }: TieredHintPanelProps) => {
  const [unlockedLevel, setUnlockedLevel] = useState(1)

  const headline = useMemo(() => {
    if (!latestBugs.length) {
      return 'No bugs detected in latest run. Keep momentum with one more refinement pass.'
    }

    return `Latest run found ${latestBugs.length} bug${latestBugs.length === 1 ? '' : 's'} — unlock hints progressively.`
  }, [latestBugs])

  if (!hintPlan) {
    return null
  }

  return (
    <section className="saas-card rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Adaptive Coach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Tiered Hint Panel</h2>
        </div>
        <span className="rounded-xl bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-100 ring-1 ring-violet-300/30">
          Focus: {hintPlan.topic}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-300">{headline}</p>

      <div className="space-y-3">
        {hintPlan.hints.map((hint) => {
          const isUnlocked = hint.level <= unlockedLevel
          return (
            <div key={hint.level} className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{hint.title}</p>
                {!isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setUnlockedLevel(hint.level)}
                    className="rounded-lg border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Unlock
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-200">Unlocked</span>
                )}
              </div>
              <p className={`text-sm ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                {isUnlocked ? hint.content : 'Unlock this level after reviewing previous hint guidance.'}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default TieredHintPanel
