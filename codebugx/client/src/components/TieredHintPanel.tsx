import { useEffect, useMemo, useState } from 'react'
import type { CoachInsights } from '../services/analyticsApi'

type TieredHintPanelProps = {
  hintPlan: CoachInsights['hintPlan'] | null
  latestBugs: Array<{ type: string; severity: 'low' | 'medium' | 'high'; topic: string }>
}

const TieredHintPanel = ({ hintPlan, latestBugs }: TieredHintPanelProps) => {
  const [unlockedLevel, setUnlockedLevel] = useState(1)

  useEffect(() => {
    if (!hintPlan) {
      return
    }

    setUnlockedLevel(hintPlan.recommendedUnlockLevel)
  }, [hintPlan])

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
    <section className="saas-card showcase-surface rounded-2xl border border-fuchsia-400/25 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-fuchsia-900/30 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Adaptive Coach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Tiered Hint Panel</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="brand-sticker brand-sticker-cyan">GUIDED UNLOCK</span>
            <span className="brand-sticker brand-sticker-violet">PROGRESSIVE HINTS</span>
          </div>
        </div>
        <span className="brand-sticker brand-sticker-amber">
          Focus: {hintPlan.topic}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-300">{headline}</p>
      <p className="mb-4 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-100">
        Auto coach decision: {hintPlan.autoUnlockReason}
      </p>

      <div className="space-y-3">
        {hintPlan.hints.map((hint) => {
          const isUnlocked = hint.level <= unlockedLevel
          return (
            <div key={hint.level} className="rounded-xl border border-slate-600/60 bg-slate-900/45 p-4 transition hover:border-cyan-300/35">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  <span className="mr-2 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-cyan-200">L{hint.level}</span>
                  {hint.title}
                </p>
                {!isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setUnlockedLevel(hint.level)}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white transition hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                  >
                    Unlock Level {hint.level}
                  </button>
                ) : (
                  <span className="brand-sticker brand-sticker-emerald">Unlocked</span>
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
