import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubmissionHistory, type HistoryItem, type HistoryPagination } from '../services/analyticsApi'
import { extractApiErrorMessage } from '../services/errorUtils'

const severityTone = (severity: HistoryItem['overallSeverity']) => {
  if (severity === 'high') {
    return 'bg-rose-400/20 text-rose-100 ring-1 ring-rose-300/40'
  }
  if (severity === 'medium') {
    return 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
  }
  if (severity === 'low') {
    return 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
  }
  return 'bg-slate-600/30 text-slate-100 ring-1 ring-slate-400/40'
}

const History = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [pagination, setPagination] = useState<HistoryPagination>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getSubmissionHistory(pagination.page, pagination.limit)
        setItems(data.items)
        setPagination(data.pagination)
      } catch (err) {
        setError(extractApiErrorMessage(err, 'Failed to load history'))
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [pagination.page, pagination.limit])

  const goToPage = (nextPage: number) => {
    setPagination((prev) => ({ ...prev, page: nextPage }))
  }

  return (
    <div className="mx-auto max-w-7xl p-6 text-slate-100">
      <header className="mb-6 showcase-surface rounded-2xl p-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Review Lab</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">History</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Review previous submissions, revisit repeated bug patterns, and compare improvements over time.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="brand-sticker brand-sticker-violet">TIME CAPSULE</span>
          <span className="brand-sticker brand-sticker-emerald">PROGRESS LOG</span>
        </div>
      </header>

      <section className="saas-card rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-white">Submission Timeline</h2>
          <span className="brand-sticker brand-sticker-cyan">
            Total: {pagination.total}
          </span>
        </div>

        {isLoading ? <p className="text-sm text-slate-300">Loading submission history...</p> : null}
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-200">{error}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/code-submission')}
                className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400"
              >
                Go To Code Submission
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
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">No submissions yet. Analyze code to build your history timeline.</p>
            <button
              type="button"
              onClick={() => navigate('/code-submission')}
              className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Analyze Your First Snippet
            </button>
          </div>
        ) : null}

        {!isLoading && !error && items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-600/60 bg-slate-900/45 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cyan-300/80">{item.language}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {new Date(item.analyzedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${severityTone(item.overallSeverity)}`}>
                      {item.overallSeverity} severity
                    </span>
                    <span className="rounded-lg bg-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-slate-500/60">
                      {item.bugCount} bug{item.bugCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs leading-6 text-slate-200">
                  <code>{item.codePreview}</code>
                </pre>

                {item.detectedBugs.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.detectedBugs.slice(0, 3).map((bug, index) => (
                      <span
                        key={`${item.id}-${bug.type}-${index}`}
                        className="rounded-lg bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-100 ring-1 ring-violet-300/30"
                      >
                        {bug.type}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-500/70 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <p className="text-xs text-slate-300">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <button
                type="button"
                onClick={() => goToPage(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-slate-500/70 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default History