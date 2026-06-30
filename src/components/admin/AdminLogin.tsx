'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

const leaderboard = [
  { name: 'Kai Thompson', score: 91, initials: 'KT' },
  { name: 'Omar Shaikh', score: 88, initials: 'OS' },
  { name: 'Liam Hassan', score: 84, initials: 'LH' },
  { name: 'Sara Al-Amin', score: 79, initials: 'SA' },
  { name: 'Nadia Osei', score: 72, initials: 'NO' },
];

const kpis = [
  { label: 'Revenue MTD', value: '£47,200' },
  { label: 'Open Deals', value: '14' },
  { label: 'AI Resolve Rate', value: '94%' },
];

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    else onSuccess();
    setLoading(false);
  };

  const inputClass = `w-full bg-transparent border rounded-xl px-4 py-3 font-body text-sm text-off-white outline-none transition-all duration-200`;

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0B' }}>

      {/* LEFT PANEL */}
      <motion.div
        className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-12"
        style={{ background: '#111114', borderRight: '1px solid rgba(244,241,236,0.06)' }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
      >
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center">
            <span className="font-display font-medium text-sm text-white">M</span>
          </div>
          <span className="font-body text-xs tracking-[0.18em] uppercase" style={{ color: 'rgba(244,241,236,0.5)' }}>Motion Visual Admin</span>
        </div>

        {/* Headline */}
        <div className="mt-auto mb-10 relative z-10">
          <h1 className="font-display italic mb-4" style={{ fontSize: 'clamp(2rem,3.5vw,3.5rem)', lineHeight: 0.95, letterSpacing: '-0.02em', color: '#F4F1EC' }}>
            Your agency,<br />in one place.
          </h1>
          <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(244,241,236,0.45)', maxWidth: 340 }}>
            Pipeline, clients, revenue, and performance — all visible within 30 seconds of logging in.
          </p>
        </div>

        {/* Performance card */}
        <motion.div
          className="relative z-10 rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(244,241,236,0.04)', border: '1px solid rgba(244,241,236,0.08)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="font-body text-xs font-medium" style={{ color: 'rgba(244,241,236,0.7)' }}>Performance — This Month</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-body text-[10px] tracking-wider uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Live</span>
            </div>
          </div>
          {leaderboard.map((member, i) => (
            <motion.div
              key={member.name}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(244,241,236,0.05)' : 'none' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-body text-[10px] w-4" style={{ color: 'rgba(244,241,236,0.25)' }}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
                  <span className="font-body text-[9px] font-medium text-white">{member.initials}</span>
                </div>
                <span className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.7)' }}>{member.name}</span>
              </div>
              <span className="font-body text-xs font-medium gradient-text">{member.score}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* KPI tiles */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              className="rounded-xl p-4"
              style={{ background: 'rgba(244,241,236,0.04)', border: '1px solid rgba(244,241,236,0.07)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
            >
              <p className="font-display italic gradient-text text-xl mb-1">{kpi.value}</p>
              <p className="font-body text-[9px] leading-tight" style={{ color: 'rgba(244,241,236,0.35)' }}>{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 font-body text-[10px] mt-6" style={{ color: 'rgba(244,241,236,0.2)' }}>
          © 2026 Motion Visual Agency Ltd · Internal use only
        </p>
      </motion.div>

      {/* RIGHT PANEL — Sign In */}
      <motion.div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center">
              <span className="font-display font-medium text-sm text-white">M</span>
            </div>
            <span className="font-body text-xs tracking-[0.18em] uppercase" style={{ color: 'rgba(244,241,236,0.5)' }}>Motion Visual Admin</span>
          </div>

          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center">
              <span className="font-display font-medium text-sm text-white">M</span>
            </div>
            <span className="font-body text-xs tracking-[0.18em] uppercase" style={{ color: 'rgba(244,241,236,0.5)' }}>Motion Visual Admin</span>
          </div>

          <h2 className="font-display italic mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#F4F1EC' }}>Welcome back.</h2>
          <p className="font-body font-light text-sm mb-10" style={{ color: 'rgba(244,241,236,0.4)' }}>Sign in with your founder credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(244,241,236,0.4)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
                style={{ borderColor: 'rgba(244,241,236,0.12)' }}
                placeholder="you@motionvisual.co.uk"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(244,241,236,0.12)')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(244,241,236,0.4)' }}>Password</label>
                <button type="button" className="font-body text-xs" style={{ color: 'rgba(124,58,237,0.7)' }}>Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  style={{ borderColor: 'rgba(244,241,236,0.12)', paddingRight: '3rem' }}
                  placeholder="••••••••"
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(244,241,236,0.12)')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Toggle password">
                  {showPass ? <EyeOff size={16} style={{ color: 'rgba(244,241,236,0.3)' }} /> : <Eye size={16} style={{ color: 'rgba(244,241,236,0.3)' }} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs" style={{ color: '#F87171' }}>
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg rounded-xl py-4 font-body font-medium text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in to portal'}
            </button>
          </form>

          <p className="font-body text-xs mt-6 text-center leading-relaxed" style={{ color: 'rgba(244,241,236,0.3)' }}>
            🔐 2FA required on all accounts. You'll be prompted after password verification.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
