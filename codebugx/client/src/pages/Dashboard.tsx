import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import ImprovementTimelineChart from '../components/ImprovementTimelineChart';
import AchievementStreakPanel from '../components/AchievementStreakPanel';
import PracticeRecommendationSection from '../components/PracticeRecommendationSection';
import { getAnalyticsOverview, getSubmissionHistory, type HistoryItem, type OverviewData } from '../services/analyticsApi';
import { extractApiErrorMessage } from '../services/errorUtils';

const Dashboard = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [overviewData, historyData] = await Promise.all([
          getAnalyticsOverview(),
          getSubmissionHistory(1, 5),
        ]);

        setOverview(overviewData);
        setRecentSubmissions(historyData.items);
      } catch (err) {
        setError(extractApiErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const topCards = useMemo(() => {
    const weakTopic = overview?.weakTopics?.[0];
    const totalSubmissions = overview?.totalSubmissions ?? 0;
    const mostFrequentBug = overview?.mostFrequentBug?.bugType || 'No bug data yet';
    const weakTopicLabel = weakTopic?.topic || 'No weak topic yet';
    const improvementScore = weakTopic ? `${Math.max(0, 100 - Math.round(weakTopic.weaknessScore))}%` : 'N/A';

    return [
      { title: 'Total Submissions', value: totalSubmissions.toString(), percentage: 'Live' },
      { title: 'Most Frequent Bug', value: mostFrequentBug, percentage: 'Live' },
      { title: 'Weak Topic', value: weakTopicLabel, percentage: 'Live' },
      { title: 'Improvement Score', value: improvementScore, percentage: 'Live' },
    ];
  }, [overview]);

  const barChartData = useMemo(() => {
    if (!overview?.weakTopics?.length) {
      return [
        { name: 'No data', frequency: 0 },
      ];
    }

    return overview.weakTopics.slice(0, 5).map((topic) => ({
      name: topic.topic,
      frequency: topic.bugCount,
    }));
  }, [overview]);

  const pieChartData = useMemo(() => {
    if (!overview?.weakTopics?.length) {
      return [
        { name: 'No data', value: 1 },
      ];
    }

    return overview.weakTopics.slice(0, 5).map((topic) => ({
      name: topic.topic,
      value: topic.weaknessScore,
    }));
  }, [overview]);

  const chartColors = ['#3B82F6', '#F97316', '#10B981'];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Command Center</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Loading dashboard data...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Analytics Command Center</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Dashboard</h1>
        </header>
        <div className="saas-card rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      </div>
    );
  }

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
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td className="py-3 px-4 text-slate-400" colSpan={4}>No submissions found yet.</td>
                </tr>
              ) : (
                recentSubmissions.map((item) => {
                  const firstBug = item.detectedBugs[0];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-700/60 hover:bg-slate-800/70 transition-colors duration-200"
                    >
                      <td className="py-2 px-4">{new Date(item.analyzedAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{firstBug?.type || 'No bug detected'}</td>
                      <td className="py-2 px-4">{firstBug?.topic || 'General'}</td>
                      <td className="py-2 px-4 text-cyan-200">{item.overallSeverity}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default Dashboard;