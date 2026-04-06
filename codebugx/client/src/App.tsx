import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import './App.css'
import { FaHome, FaChartPie, FaCode, FaHistory, FaChartBar, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import AuthGuard from './components/AuthGuard'
import { useAuth } from './context/AuthContext'
import CursorAura from './components/CursorAura'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CodeSubmission = lazy(() => import('./pages/CodeSubmission'))
const History = lazy(() => import('./pages/History'))
const Analytics = lazy(() => import('./pages/Analytics.tsx'))

const AppLayout = () => {
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const particles = [
    { left: '8%', top: '14%', size: 150, duration: 20, delay: 0 },
    { left: '20%', top: '72%', size: 120, duration: 24, delay: 3 },
    { left: '34%', top: '26%', size: 110, duration: 18, delay: 5 },
    { left: '46%', top: '84%', size: 140, duration: 22, delay: 2 },
    { left: '61%', top: '18%', size: 170, duration: 26, delay: 4 },
    { left: '74%', top: '58%', size: 130, duration: 19, delay: 1 },
    { left: '87%', top: '30%', size: 110, duration: 21, delay: 6 },
    { left: '92%', top: '76%', size: 140, duration: 23, delay: 7 },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="dashboard-gradient-bg" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={`${particle.left}-${particle.top}-${index}`}
            className="dashboard-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      {/* Sidebar */}
      <aside className="relative z-10 w-72 border-r border-cyan-400/15 bg-slate-900/55 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-center text-2xl font-extrabold tracking-tight text-transparent">
          🐞 CodeBugX
        </div>
        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaHome />
            <span>Login</span>
          </NavLink>
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaUserPlus />
            <span>Signup</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaChartPie />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/code-submission"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaCode />
            <span>Code Submission</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaHistory />
            <span>History</span>
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-white shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-cyan-300/40'
                  : 'text-slate-300 hover:bg-slate-800/85 hover:text-white'
              }`
            }
          >
            <FaChartBar />
            <span>Analytics</span>
          </NavLink>
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-slate-800/85 hover:text-white"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          ) : null}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8">
        <Suspense
          fallback={
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="rounded-xl border border-cyan-300/35 bg-slate-900/75 px-4 py-2 text-sm font-medium text-cyan-100">
                Loading workspace...
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/code-submission"
              element={
                <AuthGuard>
                  <CodeSubmission />
                </AuthGuard>
              }
            />
            <Route
              path="/history"
              element={
                <AuthGuard>
                  <History />
                </AuthGuard>
              }
            />
            <Route
              path="/analytics"
              element={
                <AuthGuard>
                  <Analytics />
                </AuthGuard>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <CursorAura />
      <AppLayout />
    </Router>
  )
}

export default App
