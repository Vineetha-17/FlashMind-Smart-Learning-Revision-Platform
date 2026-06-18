import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { Award, Shield } from 'lucide-react';

const getBadgeLabel = (xp = 0) => {
  if (xp >= 300) return 'Legendary Scholar';
  if (xp >= 180) return 'Flash Scholar';
  if (xp >= 80) return 'Rising Mind';
  return 'New Learner';
};

const getBadgeDescription = (xp = 0) => {
  if (xp >= 300) return 'You consistently convert every study session into lasting learning. Keep leading with confidence.';
  if (xp >= 180) return 'Your streak shows strong momentum and your review routine is sharpening your recall.';
  if (xp >= 80) return 'A rising learner with a growing streak and strong progress toward mastery.';
  return 'Start building your streak today and earn stronger badges with every study session.';
};

const getBadgeTier = (xp = 0) => {
  if (xp >= 300) return 'Platinum';
  if (xp >= 180) return 'Gold';
  if (xp >= 80) return 'Silver';
  return 'Bronze';
};

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const WORK_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await dashboardService.getDashboard();
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load profile details. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (mode === 'work') {
            setMode('break');
            return BREAK_DURATION;
          }
          setMode('work');
          setRounds((c) => c + 1);
          return WORK_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_DURATION);
    setRounds(0);
  };

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">{error}</div>
    </div>
  );

  const user = data?.user || {};
  const stats = data?.stats || {};
  const badgeLabel = getBadgeLabel(user.xp);
  const badgeTier = getBadgeTier(user.xp);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Your Profile</p>
            <h1 className="text-4xl font-extrabold text-white">{user.name || 'Scholar'}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Track your streak, earned badges, learning rank, and safe Gemini AI progress from one place.</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link to="/dashboard" className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition">Go to Dashboard</Link>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard access moved here from the navbar</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Pomodoro Focus</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{mode === 'work' ? 'Work Session' : 'Break Time'}</h2>
            <p className="mt-3 text-sm text-slate-400">Stay on pace with a built-in Pomodoro timer that helps you concentrate and recover.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Current goal</p>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">{mode === 'work' ? 'Focus' : 'Break'}</span>
            </div>
            <p className="mt-5 text-5xl font-black text-white text-center">{formatTime(timeLeft)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Work</p>
                <p className="mt-2 text-xl font-semibold text-slate-100">25 min</p>
              </div>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Break</p>
                <p className="mt-2 text-xl font-semibold text-teal-300">5 min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleStart} className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition">Start</button>
          <button type="button" onClick={handlePause} className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-900 transition">Pause</button>
          <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-3xl border border-rose-500 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition">Reset</button>
          <span className="ml-auto text-sm text-slate-400">Rounds completed: {rounds}</span>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Current Badge</p>
                <h2 className="mt-3 text-3xl font-bold text-white">{badgeLabel}</h2>
              </div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20">
                <Award size={28} />
              </div>
            </div>
            <p className="mt-5 text-slate-400 leading-7">{getBadgeDescription(user.xp)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                <p className="text-sm text-slate-500">Quiz Mastery</p>
                <p className="mt-2 text-xl font-semibold text-white">{stats.avgQuizScore || 0}%</p>
              </div>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                <p className="text-sm text-slate-500">Cards Created</p>
                <p className="mt-2 text-xl font-semibold text-white">{stats.totalCards || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Leaderboard Progress</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-800/80">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-300">Daily consistency</p>
                  <span className="inline-flex rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-300">{user.streak || 0} days</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-yellow-300" style={{ width: `${Math.min((user.streak || 0) / 30 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-800/80">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-300">Learning XP</p>
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">{user.xp || 0}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${Math.min((user.xp || 0) / 400 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-fuchsia-400" />
                  <div>
                    <p className="text-sm text-slate-300">Safe Gemini AI</p>
                    <p className="text-xs text-slate-500">Your generated cards follow secure educational guardrails.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
