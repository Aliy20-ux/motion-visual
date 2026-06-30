'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase, type QuoteSubmission } from '../../lib/supabase';
import { LogOut, RefreshCw } from 'lucide-react';

const statusColors: Record<string, string> = {
  new: '#7C3AED',
  reviewing: '#F59E0B',
  quoted: '#06B6D4',
  won: '#10B981',
  lost: 'rgba(244,241,236,0.2)',
};

export default function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quote_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setQuotes((data as QuoteSubmission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('quote_submissions').update({ status }).eq('id', id);
    setQuotes(qs => qs.map(q => (q.id === id ? { ...q, status: status as QuoteSubmission['status'] } : q)));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0B' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(244,241,236,0.07)', background: '#111114' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
            <span className="font-display text-sm text-white font-medium">M</span>
          </div>
          <span className="font-body text-xs tracking-[0.15em] uppercase" style={{ color: 'rgba(244,241,236,0.5)' }}>Motion Visual — Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchQuotes} className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <RefreshCw size={13} style={{ color: 'rgba(244,241,236,0.5)' }} />
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-2 font-body text-xs px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors" style={{ color: 'rgba(244,241,236,0.5)' }}>
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Enquiries', value: quotes.length },
            { label: 'New', value: quotes.filter(q => q.status === 'new').length },
            { label: 'Won', value: quotes.filter(q => q.status === 'won').length },
            { label: 'In Pipeline', value: quotes.filter(q => q.status === 'reviewing' || q.status === 'quoted').length },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-xl p-5"
              style={{ background: '#111114', border: '1px solid rgba(244,241,236,0.07)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <p className="font-display italic gradient-text text-3xl mb-1">{stat.value}</p>
              <p className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.4)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Table heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-body font-medium text-sm" style={{ color: 'rgba(244,241,236,0.7)' }}>Quote Submissions</h2>
          <span className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.3)' }}>{quotes.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-white/10 animate-spin mx-auto" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ border: '1px solid rgba(244,241,236,0.06)' }}>
            <p className="font-display italic text-3xl mb-3" style={{ color: 'rgba(244,241,236,0.2)' }}>No submissions yet.</p>
            <p className="font-body text-sm" style={{ color: 'rgba(244,241,236,0.3)' }}>Quote requests from your public site will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(244,241,236,0.07)' }}>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 font-body text-[10px] tracking-[0.2em] uppercase" style={{ background: '#111114', color: 'rgba(244,241,236,0.3)', borderBottom: '1px solid rgba(244,241,236,0.07)' }}>
              <span>Business</span>
              <span>Contact</span>
              <span>Budget</span>
              <span>Timeline</span>
              <span>Date</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {quotes.map((q, i) => (
              <motion.div
                key={q.id}
                className="grid md:grid-cols-6 gap-4 px-6 py-4 items-center transition-colors"
                style={{ borderBottom: i < quotes.length - 1 ? '1px solid rgba(244,241,236,0.05)' : 'none' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,241,236,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <p className="font-body text-sm font-medium" style={{ color: '#F4F1EC' }}>{q.business_name}</p>
                  {q.extras?.length > 0 && (
                    <p className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(244,241,236,0.35)' }}>{q.extras.slice(0, 2).join(', ')}{q.extras.length > 2 ? ` +${q.extras.length - 2}` : ''}</p>
                  )}
                </div>
                <div>
                  <p className="font-body text-sm" style={{ color: 'rgba(244,241,236,0.7)' }}>{q.contact_name}</p>
                  <p className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.35)' }}>{q.email}</p>
                </div>
                <p className="font-body text-sm" style={{ color: 'rgba(244,241,236,0.6)' }}>{q.budget || '—'}</p>
                <p className="font-body text-sm" style={{ color: 'rgba(244,241,236,0.6)' }}>{q.timeline || '—'}</p>
                <p className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.4)' }}>
                  {q.created_at ? new Date(q.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
                <select
                  value={q.status ?? 'new'}
                  onChange={e => updateStatus(q.id!, e.target.value)}
                  className="font-body text-xs rounded-lg px-3 py-1.5 border outline-none cursor-pointer"
                  style={{
                    background: '#111114',
                    borderColor: statusColors[q.status ?? 'new'] + '60',
                    color: statusColors[q.status ?? 'new'],
                  }}
                >
                  {['new', 'reviewing', 'quoted', 'won', 'lost'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
