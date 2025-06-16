import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export interface Profile {
  id: string;
  display_name: string | null;
  locale: string;
  writing_goals: Record<string, unknown> | null;
  created_at: string;
}

export interface Document {
  id: string;
  owner: string;
  title: string | null;
  content: string | null;
  readability: {
    flesch_score?: number;
    passive_pct?: number;
  } | null;
  updated_at: string;
  created_at: string;
}

export interface Suggestion {
  id: number;
  doc_id: string;
  start_pos: number;
  end_pos: number;
  type: string;
  message: string;
  replacements: string[];
  created_at: string;
}
