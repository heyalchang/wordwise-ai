import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean);

  const errorMessage = `Missing Supabase environment variables: ${missingVars.join(', ')}. Please check your .env file.`;

  // In development, log error and provide helpful guidance
  if (import.meta.env.DEV) {
    console.error(errorMessage);
    console.error('Create a .env file in your project root with:');
    console.error('VITE_SUPABASE_URL=your_supabase_project_url');
    console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.error('Then restart your development server.');
  }

  // Still throw in production or if in dev and user wants strict mode
  throw new Error(errorMessage);
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
