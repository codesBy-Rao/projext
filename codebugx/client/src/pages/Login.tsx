import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readFetchErrorMessage } from '../services/errorUtils';

const DEMO_EMAIL = 'demo@codebugx.dev';
const DEMO_PASSWORD = 'DemoPass123!';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login, apiFetch, logoutReason, clearLogoutReason } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (token) {
      navigate(redirectTo);
    }
  }, [token, navigate, redirectTo]);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    if (!response.ok) {
      const message = await readFetchErrorMessage(response, 'Login failed');
      throw new Error(message || 'Login failed');
    }

    const payload = await response.json();
    const token = payload?.data?.token;

    if (!token) {
      throw new Error('Missing auth token');
    }

    login(token);
    clearLogoutReason();
    navigate(redirectTo);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await performLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);

    try {
      await performLogin(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    const adminToken = window.prompt('Enter admin token to reset demo data');
    if (!adminToken) {
      return;
    }

    setIsResettingDemo(true);
    setError('');

    try {
      const response = await fetch('/api/ops/reset-demo', {
        method: 'POST',
        headers: {
          'x-admin-token': adminToken,
        },
      });

      if (!response.ok) {
        const message = await readFetchErrorMessage(response, 'Failed to reset demo data');
        throw new Error(message || 'Failed to reset demo data');
      }

      setEmail(DEMO_EMAIL);
      setPassword(DEMO_PASSWORD);
      setError('Demo data reset successfully. You can now click Try Demo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset demo data');
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center p-6">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <section className="saas-card hover-lift rounded-2xl p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Welcome Back</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Sign in to CodeBugX</h2>
          <p className="mt-2 text-sm text-slate-300">
            Continue your focused bug-fixing sprint and track your progress with real-time analytics.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-200">
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">Adaptive bug insights by topic and severity</p>
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">Weekly trend tracking and challenge missions</p>
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">Persistent submission history with actionable feedback</p>
          </div>
        </section>

        <section className="saas-card rounded-2xl p-8">
          <h3 className="mb-6 text-2xl font-bold tracking-tight text-white">Login</h3>
        <div className="mb-4 rounded-xl border border-cyan-300/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
          Try Demo account: <span className="font-semibold">{DEMO_EMAIL}</span>
        </div>
        {logoutReason ? (
          <div className="mb-4 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {logoutReason}
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 font-semibold text-white transition hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-3 w-full rounded-xl border border-cyan-300/50 bg-slate-900/70 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-slate-800 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Try Demo'}
          </button>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="mt-3 w-full rounded-xl border border-amber-300/50 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-slate-800 disabled:opacity-70"
            disabled={isLoading || isResettingDemo}
          >
            {isResettingDemo ? 'Resetting demo data...' : 'Reset Demo Data (Admin)'}
          </button>
        </form>
        </section>
      </div>
    </div>
  );
};

export default Login;