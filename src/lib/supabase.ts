import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type QuoteSubmission = {
  id?: string;
  created_at?: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  project_type: string;
  extras: string[];
  budget: string;
  timeline: string;
  notes?: string;
  status?: 'new' | 'reviewing' | 'quoted' | 'won' | 'lost';
};
