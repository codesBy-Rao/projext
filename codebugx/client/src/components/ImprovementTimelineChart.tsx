import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type TimelinePoint = {
  date: string
  bugs: number
}

const mockTimelineData: TimelinePoint[] = [
  { date: 'Apr 01', bugs: 14 },
  { date: 'Apr 02', bugs: 13 },
  { date: 'Apr 03', bugs: 12 },
  { date: 'Apr 04', bugs: 10 },
  { date: 'Apr 05', bugs: 9 },
  { date: 'Apr 06', bugs: 8 },
  { date: 'Apr 07', bugs: 7 },
]

const calcImprovement = (points: TimelinePoint[]) => {
  if (points.length < 2) {
    return 0
  }

  const first = points[0].bugs
  const last = points[points.length - 1].bugs

  if (first <= 0) {
    return 0
  }

  return ((first - last) / first) * 100
}

const ImprovementTimelineChart = () => {
  const improvement = calcImprovement(mockTimelineData)
  const isImproving = improvement >= 0

  return (
    <section className="saas-card rounded-2xl p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-white">7 Day Improvement Trend</h2>

      <div className="mt-4 h-[290px] rounded-2xl border border-slate-600/50 bg-slate-900/45 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockTimelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.8" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#cbd5e1" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis stroke="#cbd5e1" tick={{ fill: '#cbd5e1', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: 12,
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Line
              type="monotone"
              dataKey="bugs"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ r: 3, fill: '#67e8f9' }}
              activeDot={{ r: 6, fill: '#a5f3fc' }}
              isAnimationActive={true}
              animationDuration={1200}
              filter="url(#cyanGlow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className={`mt-4 text-sm font-semibold ${isImproving ? 'text-emerald-300' : 'text-amber-300'}`}>
        {isImproving
          ? `${improvement.toFixed(1)}% improvement in bug count over the last 7 days`
          : `${Math.abs(improvement).toFixed(1)}% regression in bug count over the last 7 days`}
      </p>
    </section>
  )
}

export default ImprovementTimelineChart
