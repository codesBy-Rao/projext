import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login, apiFetch, logoutReason, clearLogoutReason } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (token) {
      navigate(redirectTo);
    }
  }, [token, navigate, redirectTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Signup failed');
      }

      const payload = await response.json();
      const token = payload?.data?.token;

      if (!token) {
        throw new Error('Missing auth token');
      }

      login(token);
      clearLogoutReason();
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center p-6">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <section className="saas-card hover-lift rounded-2xl p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/80">Get Started</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Create your CodeBugX account</h2>
          <p className="mt-2 text-sm text-slate-300">
            Set up your workspace and start converting recurring bugs into a measurable improvement plan.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-200">
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">Protected dashboard and submission history</p>
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">AI-guided challenge missions from weak topics</p>
            <p className="rounded-xl border border-slate-600/60 bg-black/20 px-3 py-2">Visual analytics for consistency and trend tracking</p>
          </div>
        </section>

        <section className="saas-card rounded-2xl p-8">
          <h3 className="mb-6 text-2xl font-bold tracking-tight text-white">Signup</h3>
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
            {isLoading ? 'Creating account...' : 'Signup'}
          </button>
        </form>
        </section>
      </div>
    </div>
  );
};

export default Signup;