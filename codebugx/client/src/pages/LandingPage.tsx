import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden px-6 py-10 text-slate-100 md:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(250,204,21,0.14),transparent_32%),radial-gradient(circle_at_70%_75%,rgba(129,140,248,0.16),transparent_38%)]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/75 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="brand-sticker brand-sticker-cyan">CODEBUGX</span>
          <span className="text-sm uppercase tracking-[0.18em] text-slate-300">Debug Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-slate-500/70 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-12 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="showcase-surface rounded-3xl p-8 md:p-10">
          <div className="flex flex-wrap gap-2">
            <span className="brand-sticker brand-sticker-amber">LIVE ANALYTICS</span>
            <span className="brand-sticker brand-sticker-violet">ADAPTIVE COACH</span>
            <span className="brand-sticker brand-sticker-emerald">MISSION FLOW</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Debug Smarter.
            <br />
            Build Confidence Faster.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Turn recurring bugs into guided practice loops with history tracking, weak-topic heatmaps, and tiered hints that unlock as you grow.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.22)] transition hover:shadow-[0_0_35px_rgba(99,102,241,0.35)]"
            >
              Start Your First Sprint
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-500/70 bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
            >
              Continue Session
            </Link>
          </div>
        </section>

        <section className="saas-card rounded-3xl p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Why Teams Pick CodeBugX</p>
          <div className="mt-5 space-y-4 text-sm text-slate-200">
            <div className="rounded-xl border border-slate-600/60 bg-black/20 p-4">
              <p className="font-semibold text-white">Signal-rich bug analysis</p>
              <p className="mt-1 text-slate-300">Classifies bug types, severity, and topic-level weakness automatically.</p>
            </div>
            <div className="rounded-xl border border-slate-600/60 bg-black/20 p-4">
              <p className="font-semibold text-white">Coach-powered improvement loop</p>
              <p className="mt-1 text-slate-300">Daily missions, weekly progression metrics, and unlockable hints keep momentum high.</p>
            </div>
            <div className="rounded-xl border border-slate-600/60 bg-black/20 p-4">
              <p className="font-semibold text-white">Visible progress over time</p>
              <p className="mt-1 text-slate-300">Timeline and analytics dashboards make gains measurable for every sprint.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage;