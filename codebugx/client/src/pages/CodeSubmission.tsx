import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { analyzeCode } from '../services/analyzeApi'
import { getCoachInsights, type CoachInsights } from '../services/analyticsApi'
import TopicWeaknessHeatmap from '../components/TopicWeaknessHeatmap'
import PersonalizedChallengeWidget from '../components/PersonalizedChallengeWidget'
import SmartBugFixSuggestionPanel from '../components/SmartBugFixSuggestionPanel'
import TieredHintPanel from '../components/TieredHintPanel'
import { extractApiErrorMessage } from '../services/errorUtils'

const CodeSubmission = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const practiceSource = searchParams.get('source')
  const practiceTask = searchParams.get('practiceTask')
  const practiceTopic = searchParams.get('topic')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysisSummary, setAnalysisSummary] = useState<{
    overallSeverity: 'none' | 'low' | 'medium' | 'high'
    bugs: Array<{ type: string; severity: 'low' | 'medium' | 'high'; topic: string }>
  } | null>(null)
  const [hintPlan, setHintPlan] = useState<CoachInsights['hintPlan'] | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    const prompt = searchParams.get('prompt')
    const topic = searchParams.get('topic')
    if (prompt && !codeSnippet.trim()) {
      const starter = `// Challenge focus: ${topic || 'General'}\n// Paste your attempt below and improve it using bug insights.\n\n${prompt}\n\nfunction solve() {\n  // your code\n}`
      setCodeSnippet(starter)
    }
  }, [searchParams, codeSnippet])

  useEffect(() => {
    const loadCoachHints = async () => {
      try {
        const coach = await getCoachInsights()
        setHintPlan(coach.hintPlan)
      } catch {
        setHintPlan(null)
      }
    }

    loadCoachHints()
  }, [])

  const handleSubmit = async () => {
    if (!codeSnippet.trim()) {
      setMessage('Add your code first to run analysis.')
      setMessageType('error')
      return
    }

    try {
      setIsSubmitting(true)
      setMessage('')
      setMessageType('')
      const response = await analyzeCode({ codeSnippet, language })
      const payload = response.data
      setAnalysisSummary({
        overallSeverity: payload.overallSeverity,
        bugs: payload.bugs,
      })
      setMessage('Analysis complete. Refine your code and resubmit to improve your score.')
      setMessageType('success')
    } catch (err) {
      const message = extractApiErrorMessage(err, 'Failed to analyze code')
      setMessage(message)
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6 text-slate-100">
      <header className="mb-6 showcase-surface rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Build Lab</p>
          {practiceSource === 'practice-recommendations' && practiceTask ? (
            <span className="brand-sticker brand-sticker-cyan">
              Practice Source: Dashboard Recommendations {practiceTopic ? `- ${practiceTopic}` : ''}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Code Submission</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Paste your solution, run bug analysis, and iterate using focused AI feedback.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="brand-sticker brand-sticker-amber">ANALYZE MODE</span>
          <span className="brand-sticker brand-sticker-violet">HINT ENGINE</span>
        </div>
        {practiceSource === 'practice-recommendations' && practiceTask ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-300">
              Active practice task: <span className="font-semibold text-white">{practiceTask}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-slate-500/70 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
            >
              Back to Recommendations
            </button>
          </div>
        ) : null}
      </header>

      <section className="saas-card showcase-surface rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="language" className="text-sm text-gray-300">Language</label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <span className="brand-sticker brand-sticker-emerald">LIVE DEBUG LAB</span>
        </div>
        <textarea
          className="h-96 w-full rounded-2xl border border-slate-600 bg-slate-900/80 p-4 font-mono text-sm text-slate-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Paste your code here..."
          value={codeSnippet}
          onChange={(event) => setCodeSnippet(event.target.value)}
        />
        <div className="mt-4">
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Analyzing...' : 'Submit Code'}
          </button>
        </div>
        {message ? (
          <p
            className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
              messageType === 'error'
                ? 'border-rose-300/40 bg-rose-500/10 text-rose-200'
                : 'border-cyan-300/35 bg-cyan-500/10 text-cyan-200'
            }`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        {analysisSummary ? (
          <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-left">
            <p className="text-sm text-cyan-200">Overall severity: <span className="font-semibold">{analysisSummary.overallSeverity}</span></p>
            <ul className="mt-3 space-y-2 text-sm text-gray-200">
              {analysisSummary.bugs.map((bug, index) => (
                <li key={`${bug.type}-${index}`} className="rounded-lg bg-black/20 px-3 py-2">
                  <span className="font-semibold">{bug.type}</span> in {bug.topic} ({bug.severity})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="mt-6">
        <TopicWeaknessHeatmap />
      </div>

      <div className="mt-6">
        <PersonalizedChallengeWidget />
      </div>

      <div className="mt-6">
        <SmartBugFixSuggestionPanel />
      </div>

      <div className="mt-6">
        <TieredHintPanel hintPlan={hintPlan} latestBugs={analysisSummary?.bugs || []} />
      </div>
    </div>
  )
}

export default CodeSubmission