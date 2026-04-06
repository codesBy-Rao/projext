import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ImprovementTimelineChart from '../components/ImprovementTimelineChart';
import AchievementStreakPanel from '../components/AchievementStreakPanel';
import PracticeRecommendationSection from '../components/PracticeRecommendationSection';

const Dashboard = () => {
  const topCards = [
    { title: 'Total Submissions', value: '12,345', percentage: '+12%' },
    { title: 'Most Frequent Bug', value: 'Loop Boundary', percentage: '-5%' },
    { title: 'Weak Topic', value: 'Arrays', percentage: '+18%' },
    { title: 'Improvement Score', value: '+25%', percentage: '+10%' },
  ];

  const barChartData = [
    { name: 'Loop Boundary', frequency: 40 },
    { name: 'Null Checks', frequency: 30 },
    { name: 'Recursion', frequency: 30 },
  ];

  const pieChartData = [
    { name: 'Arrays', value: 40 },
    { name: 'Recursion', value: 30 },
    { name: 'Null Checks', value: 30 },
  ];

  const chartColors = ['#3B82F6', '#F97316', '#10B981'];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Command Center</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Monitor coding performance, detect recurring bug patterns, and track weakness trends with startup-grade visibility.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {topCards.map((card) => (
            <div
              key={card.title}
              className="saas-card hover-lift rounded-2xl p-5"
            >
              <h2 className="text-sm font-medium uppercase tracking-wide text-slate-300">{card.title}</h2>
              <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm text-emerald-300">{card.percentage}</p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="saas-card hover-lift rounded-2xl p-6">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">Bug Frequency</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip wrapperStyle={{ color: '#000' }} />
                  <Bar dataKey="frequency" fill="#38BDF8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="saas-card hover-lift rounded-2xl p-6">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">Topic Weakness</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ color: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      <div className="mt-6">
        <ImprovementTimelineChart />
      </div>

      <div className="mt-6">
        <AchievementStreakPanel />
      </div>

      <div className="mt-6">
        <PracticeRecommendationSection />
      </div>

      <div className="saas-card hover-lift mt-8 rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">Recent Submissions</h2>
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-600/70 text-slate-400">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Bug Type</th>
                <th className="py-2 px-4">Topic</th>
                <th className="py-2 px-4">Severity</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/60 hover:bg-slate-800/70 transition-colors duration-200">
                <td className="py-2 px-4">6 Apr</td>
                <td className="py-2 px-4">Loop Error</td>
                <td className="py-2 px-4">Arrays</td>
                <td className="py-2 px-4 text-red-400">High</td>
              </tr>
              <tr className="hover:bg-slate-800/70 transition-colors duration-200">
                <td className="py-2 px-4">5 Apr</td>
                <td className="py-2 px-4">Null Access</td>
                <td className="py-2 px-4">Objects</td>
                <td className="py-2 px-4 text-amber-400">Medium</td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default Dashboard;