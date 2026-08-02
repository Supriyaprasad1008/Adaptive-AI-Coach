import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://noewbqehygqfiicxvflq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZXdicWVoeWdxZmlpY3h2ZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDgyMzIsImV4cCI6MjEwMTIyNDIzMn0.QwNpwOqA2zcGTqn6HzYkaFdA9dtVINtB2DujsdDkNRM';

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

export const DIFFICULTY_META: Record<Difficulty, { label: string; key: Difficulty }> = {
  easy: { label: 'Easy', key: 'easy' },
  medium: { label: 'Medium', key: 'medium' },
  hard: { label: 'Hard', key: 'hard' },
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
