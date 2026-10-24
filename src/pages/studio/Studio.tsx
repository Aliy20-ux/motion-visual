import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import AgreementList from './AgreementList';
import AgreementEditor from './AgreementEditor';
import AgreementDetail from './AgreementDetail';
import QuoteList from './QuoteList';
import ProjectBoard from './ProjectBoard';
import { Button, ErrorText, Label, muted, PageTitle, TextInput } from './ui';

// Team-only area. Sign-in uses the same Supabase accounts as the CRM at
// admin.motion-visual.com, and every query is filtered by RLS
// (is_team_member), so the UI gate here is a convenience, not the security.
export default function Studio() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [memberName, setMemberName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Studio — Motion Visual';
    const meta = document.querySelector('meta[name="robots"]');
    const prevRobots = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      sub.subscription.unsubscribe();
      document.title = prevTitle;
      if (prevRobots !== null) meta?.setAttribute('content', prevRobots);
    };
  }, []);

  useEffect(() => {
    if (!session) { setMemberName(undefined); return; }
    supabase.from('team_members').select('id,full_name').eq('id', session.user.id).maybeSingle()
      .then(({ data, error }) => {
        // A failed lookup isn't proof they're off the team — let RLS decide on each query instead.
        if (error) setMemberName('');
        else setMemberName(data ? data.full_name ?? '' : null);
      });
  }, [session]);

  return (
    <div className="agreement-ui" style={{ background: '#0A0A0B', minHeight: '100svh' }}>
      <header className="flex flex-wrap items-center justify-between gap-4" style={{ padding: 'clamp(20px,4vw,32px) clamp(20px,5vw,64px)', borderBottom: '1px solid rgba(237,232,220,0.07)' }}>
        <Link to="/studio/agreements" className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
          <span className="font-body text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>Motion Visual · Studio</span>
        </Link>
        {session && (
          <nav aria-label="Studio" className="flex items-center gap-5 font-body text-xs" style={{ color: muted }}>
            <Link to="/studio/projects" className="hover:text-[#EDE8DC] transition-colors">Projects</Link>
            <Link to="/studio/agreements" className="hover:text-[#EDE8DC] transition-colors">Agreements</Link>
            <Link to="/studio/quotes" className="hover:text-[#EDE8DC] transition-colors">Quotes</Link>
          </nav>
        )}
        {session && (
          <div className="flex items-center gap-4">
            {memberName && <span className="font-body text-xs" style={{ color: muted }}>{memberName}</span>}
            <Button onClick={() => supabase.auth.signOut()}>Sign out</Button>
          </div>
        )}
      </header>
      <main id="main-content" className="mx-auto" style={{ maxWidth: 1280, padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,64px) 96px' }}>
        {session === undefined || (session && memberName === undefined) ? (
          <div aria-busy="true" style={{ minHeight: '50svh' }} />
        ) : !session ? (
          <SignIn />
        ) : memberName === null ? (
          <div className="max-w-md">
            <PageTitle>Not on the team</PageTitle>
            <p className="font-body font-light text-sm mb-6" style={{ color: 'rgba(237,232,220,0.7)' }}>
              {session.user.email} isn’t a Motion Visual team member, so there’s nothing to show here.
            </p>
            <Button onClick={() => supabase.auth.signOut()}>Sign out</Button>
          </div>
        ) : (
          <Routes>
            <Route index element={<Navigate to="agreements" replace />} />
            <Route path="agreements" element={<AgreementList />} />
            <Route path="agreements/new" element={<AgreementEditor />} />
            <Route path="agreements/:id" element={<AgreementDetail session={session} />} />
            <Route path="agreements/:id/edit" element={<AgreementEditor />} />
            <Route path="projects" element={<ProjectBoard />} />
            <Route path="quotes" element={<QuoteList />} />
            <Route path="*" element={<Navigate to="agreements" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message === 'Invalid login credentials' ? 'That email and password don’t match a team account.' : err.message);
  };

  return (
    <form onSubmit={submit} className="max-w-sm flex flex-col gap-5">
      <PageTitle eyebrow="Team sign-in">Client agreements</PageTitle>
      <p className="font-body font-light text-sm -mt-4" style={{ color: 'rgba(237,232,220,0.65)' }}>
        Use your CRM login.
      </p>
      <div>
        <Label htmlFor="studio-email">Email</Label>
        <TextInput id="studio-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="studio-password">Password</Label>
        <TextInput id="studio-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" variant="primary" disabled={busy} className="self-start" style={{ padding: '11px 24px' }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
