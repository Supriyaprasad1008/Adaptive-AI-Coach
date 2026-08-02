/*
# Adaptive Interview Prep Coach — schema

1. Purpose
   Stores mock interview sessions and the individual question/answer exchanges
   within them so the app can adapt difficulty across sessions and generate
   longitudinal performance reports. Single-tenant (no sign-in) app: all data
   is intentionally shared/public so the anon-key frontend can read and write.

2. New Tables
   - `interview_sessions`
     - `id`            uuid primary key
     - `role`           text — the job role the user is practicing for (e.g. "Frontend Engineer")
     - `focus_area`     text — the category of focus (e.g. "behavioral", "technical", "system-design")
     - `difficulty`     text — starting difficulty level: "easy", "medium", "hard"
     - `status`         text — "in_progress" | "completed"
     - `overall_score`  int  — 0-100 overall score, set when session completes
     - `started_at`     timestamptz default now()
     - `completed_at`   timestamptz nullable, set when session completes
   - `interview_exchanges`
     - `id`             uuid primary key
     - `session_id`     uuid FK -> interview_sessions(id) ON DELETE CASCADE
     - `question`       text  — the interview question asked
     - `question_tag`   text  — sub-topic tag for the question (e.g. "teamwork", "algorithms")
     - `difficulty`     text  — difficulty of THIS question: "easy" | "medium" | "hard"
     - `answer`         text  — the user's answer (nullable until answered)
     - `score`          int   — 0-100 score for this answer
     - `feedback`       text  — structured feedback text for this answer
     - `strengths`      text  — newline-separated list of strengths
     - `improvements`   text  — newline-separated list of improvement areas
     - `created_at`     timestamptz default now()

3. Security
   - RLS enabled on both tables.
   - Anon + authenticated roles get full CRUD because this is a single-tenant
     no-auth app whose data is intentionally public.

4. Notes
   - ON DELETE CASCADE on exchanges keeps data consistent when a session is deleted.
   - `overall_score` and `completed_at` are filled in by the frontend when the
     user ends a session; they are nullable until then.
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  focus_area text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'in_progress',
  overall_score int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON interview_sessions;
CREATE POLICY "anon_select_sessions" ON interview_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON interview_sessions;
CREATE POLICY "anon_insert_sessions" ON interview_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON interview_sessions;
CREATE POLICY "anon_update_sessions" ON interview_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON interview_sessions;
CREATE POLICY "anon_delete_sessions" ON interview_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS interview_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_tag text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium',
  answer text,
  score int,
  feedback text,
  strengths text,
  improvements text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interview_exchanges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exchanges" ON interview_exchanges;
CREATE POLICY "anon_select_exchanges" ON interview_exchanges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exchanges" ON interview_exchanges;
CREATE POLICY "anon_insert_exchanges" ON interview_exchanges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exchanges" ON interview_exchanges;
CREATE POLICY "anon_update_exchanges" ON interview_exchanges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exchanges" ON interview_exchanges;
CREATE POLICY "anon_delete_exchanges" ON interview_exchanges FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exchanges_session_id ON interview_exchanges(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON interview_sessions(started_at desc);