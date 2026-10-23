import { supabase } from '../../lib/supabase';
import type { AgreementDocument, AgreementKind, AgreementStatus, ClientType } from '../../legal/types';

export type AgreementRow = {
  id: string;
  reference: string;
  kind: AgreementKind;
  parent_id: string | null;
  client_id: string | null;
  client_name: string;
  client_business: string | null;
  client_email: string;
  client_type: ClientType;
  title: string;
  document: AgreementDocument;
  document_hash: string;
  terms_version: string;
  status: 'draft' | 'sent' | 'signed' | 'void';
  access_token: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  sent_at: string | null;
  first_viewed_at: string | null;
  view_count: number;
  signed_at: string | null;
  signer_name: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  signer_consents: Record<string, boolean | string> | null;
  voided_at: string | null;
  void_reason: string | null;
};

export type AgreementEvent = {
  id: string;
  type: 'created' | 'sent' | 'viewed' | 'question' | 'signed' | 'voided';
  team_member_id: string | null;
  ip: string | null;
  user_agent: string | null;
  detail: Record<string, unknown>;
  created_at: string;
};

export type CrmClient = { id: string; business_name: string; contact_name: string | null; email: string | null };

export const agreementLink = (token: string) => `${window.location.origin}/agreement/${token}`;

export async function loadAgreement(id: string) {
  const [{ data: row, error }, { data: events }] = await Promise.all([
    supabase.from('agreements').select('*').eq('id', id).maybeSingle(),
    supabase.from('agreement_events').select('*').eq('agreement_id', id).order('created_at', { ascending: true }),
  ]);
  return { row: row as AgreementRow | null, events: (events ?? []) as AgreementEvent[], error };
}

export type DisplayStatus = AgreementStatus | 'viewed';

export function displayStatus(row: { status: string; expires_at: string | null; first_viewed_at: string | null }): DisplayStatus {
  if (row.status === 'sent' && row.expires_at && new Date(row.expires_at) < new Date()) return 'expired';
  if (row.status === 'sent' && row.first_viewed_at) return 'viewed';
  return row.status as DisplayStatus;
}
