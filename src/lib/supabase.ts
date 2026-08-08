type QueryState = {
  table: 'interview_sessions' | 'interview_exchanges';
  action: 'select' | 'insert' | 'update';
  values?: Record<string, unknown>;
  filters: Record<string, unknown>;
  orderBy?: { field: string; ascending: boolean };
  limit?: number;
};

function getCurrentPractitionerId() {
  if (typeof window === 'undefined') return 'anonymous';
  try {
    const raw = window.localStorage.getItem('interview_coach_user');
    if (!raw) return 'guest-practitioner';
    const parsed = JSON.parse(raw) as { name?: string; email?: string };
    const identity = [parsed.name, parsed.email].filter(Boolean).join('|');
    return identity || 'guest-practitioner';
  } catch {
    return 'guest-practitioner';
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  const practitionerId = getCurrentPractitionerId();
  const headers = new Headers(init?.headers);
  headers.set('x-practitioner-id', practitionerId);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { data: null, error: payload.error || 'Request failed' };
  }
  return { data: payload.data ?? null, error: null };
}

async function executeQuery(state: QueryState) {
  const resource = state.table === 'interview_sessions' ? 'sessions' : 'exchanges';
  const practitionerId = getCurrentPractitionerId();
  const params = new URLSearchParams();

  params.set('practitioner_id', practitionerId);
  Object.entries(state.filters).forEach(([key, value]) => {
    if (key !== 'practitioner_id' && value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  if (state.orderBy) {
    params.set('sort', state.orderBy.field);
    params.set('order', state.orderBy.ascending ? 'asc' : 'desc');
  }

  if (state.limit) {
    params.set('limit', String(state.limit));
  }

  if (state.action === 'insert') {
    const response = await requestJson<Record<string, unknown>>(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify({ ...(state.values ?? {}), practitioner_id: practitionerId }),
    });
    return response;
  }

  if (state.action === 'update') {
    const targetId = state.filters.id as string | undefined;
    if (!targetId) return { data: null, error: null };
    return requestJson<Record<string, unknown>>(`/api/${resource}/${targetId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...(state.values ?? {}), practitioner_id: practitionerId }),
    });
  }

  const queryString = params.toString();
  const endpoint = state.filters.id
    ? `/api/${resource}/${state.filters.id}`
    : `/api/${resource}${queryString ? `?${queryString}` : ''}`;

  const result = await requestJson<unknown[]>(endpoint);
  if (state.filters.id) {
    const data = Array.isArray(result.data) ? result.data[0] ?? null : result.data;
    return { data, error: result.error };
  }

  if (result.data && !Array.isArray(result.data)) {
    return { data: [result.data], error: result.error };
  }

  return result as { data: unknown[] | null; error: string | null };
}

function createQuery(table: 'interview_sessions' | 'interview_exchanges') {
  const state: QueryState = { table, action: 'select', filters: {} };
  const practitionerId = getCurrentPractitionerId();
  state.filters.practitioner_id = practitionerId;

  const query: any = {
    select: () => query,
    insert: (values: Record<string, unknown>) => {
      state.action = 'insert';
      state.values = { ...values, practitioner_id: practitionerId };
      return query;
    },
    update: (values: Record<string, unknown>) => {
      state.action = 'update';
      state.values = { ...values, practitioner_id: practitionerId };
      return query;
    },
    eq: (field: string, value: unknown) => {
      if (field === 'practitioner_id') {
        state.filters.practitioner_id = value as string;
      } else {
        state.filters[field] = value;
      }
      return query;
    },
    order: (field: string, _options?: { ascending?: boolean }) => {
      state.orderBy = { field, ascending: _options?.ascending ?? true };
      return query;
    },
    limit: (value: number) => {
      state.limit = value;
      return query;
    },
    single: async () => {
      const result = await executeQuery(state);
      const data = Array.isArray(result.data) ? result.data[0] ?? null : result.data;
      return { ...result, data };
    },
    maybeSingle: async () => {
      const result = await executeQuery(state);
      const data = Array.isArray(result.data) ? result.data[0] ?? null : result.data;
      return { ...result, data };
    },
    then: (resolve: (value: any) => void, reject?: (error: unknown) => void) => {
      executeQuery(state).then(resolve, reject);
    },
    catch: (reject: (error: unknown) => void) => executeQuery(state).catch(reject),
  };

  return query;
}

export const supabase = {
  from(table: 'interview_sessions' | 'interview_exchanges') {
    return createQuery(table);
  },
};

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
