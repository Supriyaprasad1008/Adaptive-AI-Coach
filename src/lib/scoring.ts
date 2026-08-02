import type { AnswerEvaluation, Difficulty } from './supabase';
import { DIFFICULTY_ORDER } from './supabase';
import type { Question } from './questions';

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically',
  'actually', 'literally', 'honestly', 'i mean', 'stuff', 'things',
  'whatever', 'yeah so', 'right so',
];

const WEAK_INDICATORS = [
  "i don't know", 'not sure', 'maybe', 'i guess', 'probably', 'i think maybe',
  "can't think of", 'nothing comes to mind', 'i would say maybe',
];

const STAR_KEYWORDS = {
  situation: ['situation', 'context', 'at the time', 'when i was', 'during', 'project', 'we were', 'the team'],
  task: ['task', 'goal', 'objective', 'needed to', 'responsible for', 'my role', 'we had to', 'challenge'],
  action: ['i decided', 'i implemented', 'i built', 'i created', 'i led', 'i approached', 'i organized', 'i spoke', 'i proposed', 'i drove', 'i set up'],
  result: ['result', 'outcome', 'as a result', 'this led to', 'we achieved', 'reduced', 'increased', 'improved', 'launched', 'shipped', 'saved', 'percent', '%', 'metric'],
};

const STRUCTURE_INDICATORS = ['first', 'second', 'third', 'finally', 'then', 'next', 'after that', 'additionally', 'however', 'because', 'so that', 'in order to'];

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return Math.max(1, (text.match(/[.!?]+/g) || []).length);
}

function countOccurrences(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((acc, phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = lower.match(regex);
    return acc + (matches ? matches.length : 0);
  }, 0);
}

function hasStarStructure(text: string): { present: string[]; missing: string[] } {
  const lower = text.toLowerCase();
  const present: string[] = [];
  const missing: string[] = [];
  (Object.keys(STAR_KEYWORDS) as Array<keyof typeof STAR_KEYWORDS>).forEach((key) => {
    const found = STAR_KEYWORDS[key].some((kw) => lower.includes(kw));
    if (found) present.push(key);
    else missing.push(key);
  });
  return { present, missing };
}

export function evaluateAnswer(answer: string, question: Question): AnswerEvaluation {
  const trimmed = answer.trim();
  const wordCount = countWords(trimmed);
  const sentenceCount = countSentences(trimmed);
  const lower = trimmed.toLowerCase();

  let score = 50;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount < 15) {
    score -= 25;
    improvements.push('Answer is very short - aim for at least 3-4 sentences to show depth.');
  } else if (wordCount < 40) {
    score -= 10;
    improvements.push('Could elaborate more - add specific details to strengthen the answer.');
  } else if (wordCount >= 40 && wordCount <= 250) {
    score += 12;
    strengths.push('Good answer length - detailed without being rambling.');
  } else if (wordCount > 350) {
    score -= 8;
    improvements.push('Answer may be too long - practice being more concise.');
  } else {
    score += 6;
    strengths.push('Thorough, detailed response.');
  }

  if (sentenceCount >= 3 && wordCount / sentenceCount >= 6 && wordCount / sentenceCount <= 30) {
    score += 5;
    strengths.push('Well-structured sentences with good variety.');
  }

  const fillerCount = countOccurrences(trimmed, FILLER_WORDS);
  if (fillerCount === 0 && wordCount > 20) {
    score += 5;
    strengths.push('Clean delivery with minimal filler words.');
  } else if (fillerCount > 3) {
    score -= Math.min(12, fillerCount * 2);
    improvements.push(`Reduce filler words (detected ~${fillerCount}) - practice pausing instead.`);
  }

  if (countOccurrences(trimmed, WEAK_INDICATORS) > 0) {
    score -= 8;
    improvements.push("Avoid hedging language ('not sure', 'I guess') - speak with confidence.");
  }

  if (question.area === 'behavioral') {
    const { present, missing } = hasStarStructure(trimmed);
    if (present.length >= 3) {
      score += 15;
      strengths.push(`Strong STAR structure - covered ${present.join(', ')}.`);
    } else if (present.length >= 2) {
      score += 8;
      strengths.push(`Partial STAR structure - covered ${present.join(', ')}.`);
      if (missing.length > 0) {
        improvements.push(`Add the missing STAR element(s): ${missing.join(', ')}.`);
      }
    } else {
      score -= 10;
      improvements.push('Use the STAR method - describe the Situation, Task, Action, and Result explicitly.');
    }
  }

  const structureCount = countOccurrences(trimmed, STRUCTURE_INDICATORS);
  if (structureCount >= 2) {
    score += 8;
    strengths.push('Clear logical flow with transition words.');
  } else if (wordCount > 40) {
    score -= 4;
    improvements.push('Add transition words (first, then, because) to improve logical flow.');
  }

  const hasNumbers = /\d/.test(trimmed);
  const hasExamples = /\b(for example|for instance|such as|e\.g\.|like when)\b/i.test(trimmed);
  if (hasNumbers) {
    score += 8;
    strengths.push('Uses concrete numbers or metrics - quantifies impact.');
  } else if (wordCount > 30) {
    improvements.push('Add specific numbers or metrics to quantify your impact.');
  }
  if (hasExamples) {
    score += 6;
    strengths.push('Provides concrete examples to support points.');
  } else if (question.area !== 'technical' && wordCount > 40) {
    improvements.push('Include a specific example to make the answer more memorable.');
  }

  if (question.area === 'technical') {
    const hasComplexity = /\b(o\(|complexity|linear|logarithmic|constant|quadratic|n\b|space|time)/i.test(trimmed);
    const hasTradeoff = /\b(tradeoff|trade-off|however|but|whereas|on the other hand|downside|cost)\b/i.test(trimmed);
    if (hasComplexity) {
      score += 8;
      strengths.push('Discusses time/space complexity - shows algorithmic thinking.');
    } else {
      improvements.push('Mention the time and space complexity of your approach.');
    }
    if (hasTradeoff) {
      score += 6;
      strengths.push('Acknowledges tradeoffs - demonstrates engineering maturity.');
    } else {
      improvements.push('Discuss the tradeoffs of your approach versus alternatives.');
    }
  }

  if (question.area === 'system-design') {
    const hasScale = /\b(scale|scal|throughput|latency|availability|redundan|partition|shard|replica|cache|queue|async)\b/i.test(trimmed);
    const hasComponents = /\b(database|api|service|server|client|load balancer|cdn|message|kafka|redis|microservice)\b/i.test(trimmed);
    if (hasScale) {
      score += 8;
      strengths.push('Addresses scalability and performance considerations.');
    } else {
      improvements.push('Discuss how the design scales under load.');
    }
    if (hasComponents) {
      score += 5;
      strengths.push('Identifies concrete system components.');
    } else {
      improvements.push('Name the specific components and technologies you would use.');
    }
  }

  const questionWords = question.text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
  const relevantCount = questionWords.filter((w: string) => lower.includes(w)).length;
  const relevanceRatio = questionWords.length > 0 ? relevantCount / questionWords.length : 0;
  if (relevanceRatio > 0.3) {
    score += 6;
    strengths.push('Answer stays focused on the question asked.');
  } else if (wordCount > 30) {
    score -= 6;
    improvements.push('Make sure the answer directly addresses the question asked.');
  }

  if (/\bi\s+(built|created|led|drove|implemented|designed|launched|improved|reduced|increased|solved|decided)\b/i.test(trimmed)) {
    score += 6;
    strengths.push('Uses active first-person voice - shows ownership.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const nextDifficulty = computeNextDifficulty(score, question.difficulty);
  const feedback = generateFeedback(score, question, strengths, improvements, wordCount);

  return { score, feedback, strengths, improvements, nextDifficulty };
}

function computeNextDifficulty(score: number, currentDifficulty: Difficulty): Difficulty {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
  if (score >= 80 && currentIndex < DIFFICULTY_ORDER.length - 1) {
    return DIFFICULTY_ORDER[currentIndex + 1];
  }
  if (score < 45 && currentIndex > 0) {
    return DIFFICULTY_ORDER[currentIndex - 1];
  }
  return currentDifficulty;
}

function generateFeedback(
  score: number,
  question: Question,
  strengths: string[],
  improvements: string[],
  wordCount: number,
): string {
  const tier = score >= 80 ? 'strong' : score >= 60 ? 'solid' : score >= 40 ? 'developing' : 'needs work';
  const areaLabel = question.area === 'system-design' ? 'system design' : question.area;

  let intro: string;
  if (score >= 80) {
    intro = `This is a ${tier} answer for a ${question.difficulty} ${areaLabel} question. You demonstrated clear competence and structure.`;
  } else if (score >= 60) {
    intro = `This is a ${tier} answer. You're on the right track, with room to sharpen your delivery.`;
  } else if (score >= 40) {
    intro = `This answer is ${tier}. The core idea is there but needs more depth and structure to be compelling.`;
  } else {
    intro = `This answer ${tier}. Focus on structure and specificity to bring it up to interview-ready quality.`;
  }

  let body = '';
  if (strengths.length > 0) {
    body += `\n\nWhat worked well:\n${strengths.map((s) => `- ${s}`).join('\n')}`;
  }
  if (improvements.length > 0) {
    body += `\n\nWhat to improve:\n${improvements.map((s) => `- ${s}`).join('\n')}`;
  }

  const lengthNote = wordCount < 20
    ? '\n\nPractice extending your answer to at least 3-4 sentences.'
    : wordCount > 350
      ? '\n\nPractice tightening this to 2-3 minutes spoken.'
      : '';

  return intro + body + lengthNote;
}

export function computeOverallScore(exchanges: Array<{ score: number | null }>): number {
  const scored = exchanges.filter((e) => e.score !== null);
  if (scored.length === 0) return 0;
  const total = scored.reduce((acc, e) => acc + (e.score ?? 0), 0);
  return Math.round(total / scored.length);
}

export function scoreTier(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'text-emerald-300',
      bg: 'border border-emerald-500/20 bg-emerald-500/10',
    };
  }
  if (score >= 65) {
    return {
      label: 'Good',
      color: 'text-green-300',
      bg: 'border border-green-500/20 bg-green-500/10',
    };
  }
  if (score >= 50) {
    return {
      label: 'Fair',
      color: 'text-amber-300',
      bg: 'border border-amber-500/20 bg-amber-500/10',
    };
  }
  if (score >= 35) {
    return {
      label: 'Developing',
      color: 'text-orange-300',
      bg: 'border border-orange-500/20 bg-orange-500/10',
    };
  }
  return {
    label: 'Needs Work',
    color: 'text-rose-300',
    bg: 'border border-rose-500/20 bg-rose-500/10',
  };
}
