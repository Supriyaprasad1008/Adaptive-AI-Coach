import type { Difficulty, FocusArea } from './supabase';

export interface Question {
  id: string;
  text: string;
  tag: string;
  difficulty: Difficulty;
  area: FocusArea;
  guidance: string[];
}

export const QUESTION_BANK: Question[] = [
  // ===== BEHAVIORAL — EASY =====
  {
    id: 'b-e1', area: 'behavioral', difficulty: 'easy', tag: 'self-introduction',
    text: 'Tell me about yourself and what drew you to this field.',
    guidance: ['Structured overview of background', 'Connects past experience to the role', 'Stays under two minutes', 'Shows genuine motivation'],
  },
  {
    id: 'b-e2', area: 'behavioral', difficulty: 'easy', tag: 'strengths',
    text: 'What do you consider your greatest professional strength, and how have you applied it?',
    guidance: ['Names a specific, relevant strength', 'Provides a concrete example', 'Links strength to job impact', 'Avoids generic clichés'],
  },
  {
    id: 'b-e3', area: 'behavioral', difficulty: 'easy', tag: 'motivation',
    text: 'Why are you interested in this particular role and company?',
    guidance: ['References specific company/role details', 'Connects personal goals to the opportunity', 'Shows research about the company', 'Goes beyond surface-level reasons'],
  },
  {
    id: 'b-e4', area: 'behavioral', difficulty: 'easy', tag: 'weakness',
    text: 'Describe a professional weakness you are actively working to improve.',
    guidance: ['Picks a real but non-disqualifying weakness', 'Shows self-awareness', 'Describes concrete improvement steps', 'Demonstrates growth mindset'],
  },

  // ===== BEHAVIORAL — MEDIUM =====
  {
    id: 'b-m1', area: 'behavioral', difficulty: 'medium', tag: 'teamwork',
    text: 'Tell me about a time you disagreed with a teammate. How did you resolve it?',
    guidance: ['Uses a clear STAR-structure story', 'Describes the disagreement specifically', 'Explains resolution approach', 'Reflects on the outcome'],
  },
  {
    id: 'b-m2', area: 'behavioral', difficulty: 'medium', tag: 'failure',
    text: 'Describe a project that failed or missed its goals. What did you learn?',
    guidance: ['Owns the failure without deflecting', 'Identifies specific root causes', 'Extracts concrete lessons', 'Applies lessons afterward'],
  },
  {
    id: 'b-m3', area: 'behavioral', difficulty: 'medium', tag: 'leadership',
    text: 'Tell me about a time you had to influence a decision without formal authority.',
    guidance: ['Specific situation with stakes', 'Explains influence strategy', 'Addresses resistance', 'Measurable or clear outcome'],
  },
  {
    id: 'b-m4', area: 'behavioral', difficulty: 'medium', tag: 'prioritization',
    text: 'How do you prioritize competing deadlines when everything seems urgent?',
    guidance: ['Clear prioritization framework', 'Real-world example', 'Communicates tradeoffs to stakeholders', 'Adapts when priorities shift'],
  },
  {
    id: 'b-m5', area: 'behavioral', difficulty: 'medium', tag: 'adaptability',
    text: 'Describe a time you had to quickly adapt to a significant change at work.',
    guidance: ['Specific change with real impact', 'Shows emotional regulation', 'Describes adaptive actions', 'Positive outcome or lesson'],
  },

  // ===== BEHAVIORAL — HARD =====
  {
    id: 'b-h1', area: 'behavioral', difficulty: 'hard', tag: 'conflict',
    text: 'Tell me about a time you received harsh critical feedback you disagreed with. How did you handle it?',
    guidance: ['Specific feedback situation', 'Manages emotional response', 'Seeks to understand the perspective', 'Constructive resolution and growth'],
  },
  {
    id: 'b-h2', area: 'behavioral', difficulty: 'hard', tag: 'ambiguity',
    text: 'Describe a situation where you had to lead a project with minimal direction and unclear requirements.',
    guidance: ['High-ambiguity scenario', 'Proactive sense-making approach', 'Stakeholder alignment strategy', 'Concrete deliverables despite ambiguity'],
  },
  {
    id: 'b-h3', area: 'behavioral', difficulty: 'hard', tag: 'ethical-dilemma',
    text: 'Tell me about a time you faced an ethical dilemma at work. What did you do?',
    guidance: ['Real ethical tension (not trivial)', 'Weighs competing values', 'Takes a principled action', 'Reflects on consequences'],
  },
  {
    id: 'b-h4', area: 'behavioral', difficulty: 'hard', tag: 'underperformance',
    text: 'Describe a time you had to manage a struggling team member whose performance was hurting the team.',
    guidance: ['Specific performance issues', 'Balances empathy and accountability', 'Concrete coaching actions', 'Honest outcome (success or not)'],
  },

  // ===== TECHNICAL — EASY =====
  {
    id: 't-e1', area: 'technical', difficulty: 'easy', tag: 'fundamentals',
    text: 'Explain the difference between == and === in JavaScript (or equivalent in your primary language).',
    guidance: ['Correct technical distinction', 'Explains type coercion', 'Gives a code example', 'Mentions when each is appropriate'],
  },
  {
    id: 't-e2', area: 'technical', difficulty: 'easy', tag: 'data-structures',
    text: 'What is the time complexity of inserting an element at the head of a linked list vs. an array?',
    guidance: ['Correct O(1) vs O(n) analysis', 'Explains memory shifting in arrays', 'Mentions pointer manipulation', 'Clear reasoning'],
  },
  {
    id: 't-e3', area: 'technical', difficulty: 'easy', tag: 'web-basics',
    text: 'What happens, step by step, when you type a URL into a browser and press Enter?',
    guidance: ['DNS resolution', 'TCP/TLS handshake', 'HTTP request/response', 'Rendering pipeline'],
  },
  {
    id: 't-e4', area: 'technical', difficulty: 'easy', tag: 'version-control',
    text: 'Explain the difference between git merge and git rebase, and when you would use each.',
    guidance: ['Correct merge mechanics', 'Correct rebase mechanics', 'Tradeoffs (history clarity vs. simplicity)', 'Team convention awareness'],
  },

  // ===== TECHNICAL — MEDIUM =====
  {
    id: 't-m1', area: 'technical', difficulty: 'medium', tag: 'algorithms',
    text: 'How would you find the first non-repeating character in a string? Walk through your approach and its complexity.',
    guidance: ['Clear algorithmic approach', 'Correct time complexity analysis', 'Handles edge cases', 'Mentions space complexity'],
  },
  {
    id: 't-m2', area: 'technical', difficulty: 'medium', tag: 'concurrency',
    text: 'Explain what a race condition is and describe two strategies to prevent it.',
    guidance: ['Correct race condition definition', 'At least two valid prevention strategies', 'Tradeoffs between strategies', 'Real-world example or analogy'],
  },
  {
    id: 't-m3', area: 'technical', difficulty: 'medium', tag: 'databases',
    text: 'What is a database index, and what are the tradeoffs of adding one?',
    guidance: ['Correct index explanation (B-tree/etc.)', 'Read performance benefit', 'Write cost and storage overhead', 'When NOT to index'],
  },
  {
    id: 't-m4', area: 'technical', difficulty: 'medium', tag: 'api-design',
    text: 'Compare REST and GraphQL. When would you choose one over the other?',
    guidance: ['Correct REST and GraphQL characteristics', 'Over-fetching/under-fetching tradeoff', 'Client vs. server flexibility', 'Realistic scenario-based recommendation'],
  },
  {
    id: 't-m5', area: 'technical', difficulty: 'medium', tag: 'debugging',
    text: 'Walk me through your process for debugging a production incident where response times suddenly spiked.',
    guidance: ['Systematic triage approach', 'Uses observability tools (metrics, logs, traces)', 'Forms and tests hypotheses', 'Post-incident learning'],
  },

  // ===== TECHNICAL — HARD =====
  {
    id: 't-h1', area: 'technical', difficulty: 'hard', tag: 'distributed-systems',
    text: 'How would you design a distributed counter that needs to be eventually consistent across multiple data centers?',
    guidance: ['CAP theorem awareness', 'Vector clocks or CRDTs', 'Conflict resolution strategy', 'Latency vs. consistency tradeoff'],
  },
  {
    id: 't-h2', area: 'technical', difficulty: 'hard', tag: 'algorithms-advanced',
    text: 'Given a stream of events too large for memory, how would you find the top 10 most frequent items?',
    guidance: ['Space-constrained awareness', 'Heap or Count-Min Sketch approach', 'Correct complexity analysis', 'Handles the streaming nature'],
  },
  {
    id: 't-h3', area: 'technical', difficulty: 'hard', tag: 'security',
    text: 'Explain how you would prevent and detect SQL injection in a web application that uses raw SQL queries.',
    guidance: ['Parameterized queries', 'Input validation and allowlisting', 'Principle of least privilege', 'Detection via logging and monitoring'],
  },
  {
    id: 't-h4', area: 'technical', difficulty: 'hard', tag: 'performance',
    text: 'A React app has slow initial render. Walk through how you would diagnose and fix the performance issues.',
    guidance: ['Profiling with React DevTools', 'Identifies bundle size and code splitting', 'Render optimization (memoization)', 'Measures before and after'],
  },

  // ===== SYSTEM DESIGN — EASY =====
  {
    id: 's-e1', area: 'system-design', difficulty: 'easy', tag: 'basics',
    text: 'How would you design a simple URL shortener like bit.ly? Walk through the main components.',
    guidance: ['Core components (API, DB, redirect)', 'Encoding approach (base62, counter)', 'Read vs. write workload awareness', 'Simple but complete design'],
  },
  {
    id: 's-e2', area: 'system-design', difficulty: 'easy', tag: 'caching',
    text: 'Where would you introduce caching in a typical web application, and what are the risks?',
    guidance: ['CDN, application, database cache layers', 'Cache invalidation challenges', 'Stale data risks', 'Appropriate cache use cases'],
  },
  {
    id: 's-e3', area: 'system-design', difficulty: 'easy', tag: 'scaling',
    text: 'Your web app is getting slow under load. What are the first three things you would investigate?',
    guidance: ['Database queries and indexes', 'Application-level bottlenecks', 'Infrastructure (CPU, memory, network)', 'Prioritized by impact'],
  },

  // ===== SYSTEM DESIGN — MEDIUM =====
  {
    id: 's-m1', area: 'system-design', difficulty: 'medium', tag: 'architecture',
    text: 'Design a rate limiter that supports 1 million requests per second. How would you architect it?',
    guidance: ['Token bucket or sliding window algorithm', 'Distributed coordination (Redis)', 'Horizontal scaling strategy', 'Handles edge cases (hot keys)'],
  },
  {
    id: 's-m2', area: 'system-design', difficulty: 'medium', tag: 'messaging',
    text: 'Compare using a message queue vs. a direct API call between two services. When would you choose each?',
    guidance: ['Synchronous vs. asynchronous tradeoff', 'Decoupling and resilience benefits', 'Latency and ordering considerations', 'Scenario-based recommendation'],
  },
  {
    id: 's-m3', area: 'system-design', difficulty: 'medium', tag: 'data-modeling',
    text: 'Design the data model for a multi-tenant SaaS application. How do you isolate tenant data?',
    guidance: ['Tenant identification strategy', 'Schema-per-tenant vs. shared schema', 'Row-level security or isolation', 'Scalability considerations'],
  },
  {
    id: 's-m4', area: 'system-design', difficulty: 'medium', tag: 'reliability',
    text: 'How would you design a system to be highly available with minimal downtime?',
    guidance: ['Redundancy at every layer', 'Health checks and failover', 'Graceful degradation', 'Disaster recovery plan'],
  },

  // ===== SYSTEM DESIGN — HARD =====
  {
    id: 's-h1', area: 'system-design', difficulty: 'hard', tag: 'global-scale',
    text: 'Design a globally distributed notification system that delivers 10 billion notifications per day with sub-second latency.',
    guidance: ['Multi-region architecture', 'Fan-out and delivery pipeline', 'Backpressure and queueing', 'Monitoring and SLA awareness'],
  },
  {
    id: 's-h2', area: 'system-design', difficulty: 'hard', tag: 'consistency',
    text: 'Design a distributed key-value store that survives network partitions while maximizing availability. Justify your consistency model.',
    guidance: ['Explicit CAP tradeoff reasoning', 'Consistency model (eventual, strong, tunable)', 'Partition detection and healing', 'Conflict resolution strategy'],
  },
  {
    id: 's-h3', area: 'system-design', difficulty: 'hard', tag: 'real-time',
    text: 'Design a real-time collaborative document editing system like Google Docs. How do you handle concurrent edits?',
    guidance: ['Operational transformation or CRDTs', 'Conflict resolution approach', 'Presence and cursor sharing', 'Offline support considerations'],
  },
];

export function getQuestionsForSession(area: FocusArea, difficulty: Difficulty, excludeIds: string[] = []): Question[] {
  return QUESTION_BANK.filter(
    (q) => q.area === area && q.difficulty === difficulty && !excludeIds.includes(q.id),
  );
}

export function pickNextQuestion(
  area: FocusArea,
  currentDifficulty: Difficulty,
  usedQuestionIds: string[],
): Question | null {
  const used = new Set(usedQuestionIds);

  const sameDifficulty = QUESTION_BANK.filter(
    (q) => q.area === area && q.difficulty === currentDifficulty && !used.has(q.id),
  );
  if (sameDifficulty.length > 0) {
    return sameDifficulty[Math.floor(Math.random() * sameDifficulty.length)];
  }

  const anyDifficulty = QUESTION_BANK.filter((q) => q.area === area && !used.has(q.id));
  if (anyDifficulty.length > 0) {
    return anyDifficulty[Math.floor(Math.random() * anyDifficulty.length)];
  }

  const allForArea = QUESTION_BANK.filter((q) => q.area === area);
  if (allForArea.length > 0) {
    return allForArea[Math.floor(Math.random() * allForArea.length)];
  }
  return null;
}
