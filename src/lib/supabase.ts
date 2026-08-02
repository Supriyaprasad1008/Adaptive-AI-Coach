import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SessionStatus = 'in_progress' | 'completed';

export type FocusArea = 'behavioral' | 'technical' | 'system-design';

export interface InterviewSession {
  id: string;
  role: string;
  focus_area: FocusArea;
  difficulty: Difficulty;
  status: SessionStatus;
  overall_score: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface InterviewExchange {
  id: string;
  session_id: string;
  question: string;
  question_tag: string;
  difficulty: Difficulty;
  answer: string | null;
  score: number | null;
  feedback: string | null;
  strengths: string | null;
  improvements: string | null;
  created_at: string;
}

export interface SessionWithExchanges extends InterviewSession {
  exchanges: InterviewExchange[];
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextDifficulty: Difficulty;
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; ring: string; dot: string }> = {
  easy: {
    label: 'Easy',
    color: 'text-emerald-300',
    ring: 'ring-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-300',
    ring: 'ring-amber-500/20',
    dot: 'bg-amber-400',
  },
  hard: {
    label: 'Hard',
    color: 'text-rose-300',
    ring: 'ring-rose-500/20',
    dot: 'bg-rose-400',
  },
};

export const FOCUS_AREAS: { value: FocusArea; label: string; description: string }[] = [
  { value: 'behavioral', label: 'Behavioral', description: 'Soft skills, teamwork, leadership, conflict' },
  { value: 'technical', label: 'Technical', description: 'Coding, algorithms, language fundamentals' },
  { value: 'system-design', label: 'System Design', description: 'Architecture, scalability, tradeoffs' },
];

export const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'Engineering Manager',
  'UX Designer',
];
