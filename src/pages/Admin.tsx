'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function Admin() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0B' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-white/10 animate-spin" />
      </div>
    );
  }

  if (!session) return <AdminLogin onSuccess={() => setSession(true)} />;
  return <AdminDashboard onSignOut={() => setSession(false)} />;
}
