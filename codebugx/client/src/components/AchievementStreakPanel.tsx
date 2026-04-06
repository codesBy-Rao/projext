type AchievementBadge = {
  name: string
  accent: 'cyan' | 'violet' | 'emerald' | 'amber'
  unlocked: boolean
  newlyUnlocked?: boolean
}

const mockStreakStats = {
  streakDays: 7,
  completedChallenges: 18,
  noBugStreak: 4,
}

const mockBadges: AchievementBadge[] = [
  { name: 'Loop Slayer', accent: 'cyan', unlocked: true },
  { name: 'Null Safety Master', accent: 'violet', unlocked: true, newlyUnlocked: true },
  { name: '7 Day Streak', accent: 'emerald', unlocked: true, newlyUnlocked: true },
  { name: 'Bug Hunter', accent: 'amber', unlocked: false },
]

const badgeAccentClass = (accent: AchievementBadge['accent'], unlocked: boolean) => {
  if (!unlocked) {
    return 'border-slate-600 text-slate-500 shadow-[0_0_0_1px_rgba(71,85,105,0.4)]'
  }

  if (accent === 'violet') {
    return 'border-violet-300/70 text-violet-100 shadow-[0_0_24px_rgba(168,85,247,0.45)]'
  }
  if (accent === 'emerald') {
    return 'border-emerald-300/70 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
  }
  if (accent === 'amber') {
    return 'border-amber-300/70 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.4)]'
  }

  return 'border-cyan-300/70 text-cyan-100 shadow-[0_0_24px_rgba(56,189,248,0.45)]'
}

const AchievementStreakPanel = () => {
  return (
    <section className="saas-card rounded-2xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Progress Vault</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Achievements & Streak</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-600/60 bg-slate-900/45 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Streak Days</p>
          <p className="mt-2 text-3xl font-bold text-cyan-200">{mockStreakStats.streakDays}</p>
        </div>
        <div className="rounded-2xl border border-slate-600/60 bg-slate-900/45 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Completed Challenges</p>
          <p className="mt-2 text-3xl font-bold text-violet-200">{mockStreakStats.completedChallenges}</p>
        </div>
        <div className="rounded-2xl border border-slate-600/60 bg-slate-900/45 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">No-Bug Streak</p>
          <p className="mt-2 text-3xl font-bold text-emerald-200">{mockStreakStats.noBugStreak}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {mockBadges.map((badge) => (
          <div key={badge.name} className="flex flex-col items-center gap-2 text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full border bg-slate-900/70 px-2 text-xs font-semibold transition-transform duration-300 hover:-translate-y-1 ${badgeAccentClass(
                badge.accent,
                badge.unlocked
              )} ${badge.newlyUnlocked ? 'badge-unlocked-pulse' : ''}`}
            >
              {badge.unlocked ? badge.name.split(' ')[0] : 'Locked'}
            </div>
            <p className={`text-xs ${badge.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
              {badge.name}
              {badge.newlyUnlocked ? <span className="ml-1 text-[10px] text-cyan-300">NEW</span> : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AchievementStreakPanel
