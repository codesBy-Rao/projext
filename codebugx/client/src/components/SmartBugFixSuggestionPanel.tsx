type BugFixSuggestion = {
  bug: string
  explanation: string
  suggestion: string
  beforeCode: string
  afterCode: string
}

const mockSuggestion: BugFixSuggestion = {
  bug: 'Loop Boundary Error',
  explanation:
    'The loop includes an index equal to array.length, which accesses an out-of-range element and can produce undefined behavior.',
  suggestion: 'Replace <= with < so the loop stops at the last valid index.',
  beforeCode: `const arr = [3, 8, 13, 21]

for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i])
}`,
  afterCode: `const arr = [3, 8, 13, 21]

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}`,
}

const SmartBugFixSuggestionPanel = () => {
  return (
    <section className="saas-card rounded-2xl border border-emerald-300/25 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-emerald-900/25 p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">AI Fix Assistant</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Smart Bug Fix Suggestion 🛠️</h2>
        </div>
        <span className="rounded-xl border border-cyan-300/40 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
          ✨ Static Demo
        </span>
      </div>

      <div className="rounded-2xl border border-slate-600/60 bg-slate-900/40 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Detected Bug</p>
        <p className="mt-1 text-lg font-semibold text-white">{mockSuggestion.bug}</p>

        <p className="mt-4 text-sm text-slate-300">{mockSuggestion.explanation}</p>

        <div className="mt-4 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2">
          <p className="text-sm font-medium text-violet-100">Suggestion: {mockSuggestion.suggestion}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-rose-400/25 bg-slate-900/45 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-200">Before</p>
          <pre className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs leading-6 text-slate-200">
            <code>{mockSuggestion.beforeCode}</code>
          </pre>
        </div>

        <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/45 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">After</p>
          <pre className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs leading-6 text-slate-200">
            <code>{mockSuggestion.afterCode}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}

export default SmartBugFixSuggestionPanel
