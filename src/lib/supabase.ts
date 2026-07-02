import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mirrors public.leads in the motionvisual-admin CRM project — the quote
// form writes directly into the same pipeline the team already works leads
// through (New Lead -> ... -> Won/Lost), rather than a separate table.
export type Lead = {
  id?: string;
  created_at?: string;
  business_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  source?: string;
  estimated_value?: number;
  stage?: 'New Lead' | 'Contacted' | 'Interested' | 'Meeting' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  notes?: string;
};
