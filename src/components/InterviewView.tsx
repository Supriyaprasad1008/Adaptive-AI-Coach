import { useCallback, useEffect, useRef, useState } from 'react';
import {
  supabase,
  type Difficulty,
  type InterviewExchange,
  type InterviewSession,
  DIFFICULTY_META,
} from '@/lib/supabase';
import { pickNextQuestion, type Question } from '@/lib/questions';
import { evaluateAnswer } from '@/lib/scoring';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Flag,
  X,
} from 'lucide-react';

interface InterviewViewProps {
  session: InterviewSession;
  exchanges: InterviewExchange[];
  onExchangesChange: (exchanges: InterviewExchange[]) => void;
  onEndSession: () => void;
}

type Phase = 'answering' | 'evaluating' | 'feedback' | 'complete';

export default function InterviewView({
  session,
  exchanges,
  onExchangesChange,
  onEndSession,
}: InterviewViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastEvaluation, setLastEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    nextDifficulty: Difficulty;
  } | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(session.difficulty);
  const [error, setError] = useState<string | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const QUESTION_LIMIT = 6;

  useEffect(() => {
    const used = exchanges
      .filter((e) => e.answer !== null)
      .map((e) => e.question_tag + '|' + e.question);
    setUsedQuestionIds(used);

    if (exchanges.length > 0 && exchanges[exchanges.length - 1].answer === null) {
      const last = exchanges[exchanges.length - 1];
      setCurrentQuestion({
        id: last.question_tag + '|' + last.question,
        text: last.question,
        tag: last.question_tag,
        difficulty: last.difficulty,
        area: session.focus_area,
        guidance: [],
      });
      setCurrentDifficulty(last.difficulty);
    } else {
      const next = pickNextQuestion(session.focus_area, currentDifficulty, used);
      if (next) {
        setCurrentQuestion(next);
        setCurrentDifficulty(next.difficulty);
        persistQuestion(next);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistQuestion = useCallback(async (q: Question) => {
    const { data, error: insertError } = await supabase
      .from('interview_exchanges')
      .insert({
        session_id: session.id,
        question: q.text,
        question_tag: q.tag,
        difficulty: q.difficulty,
      })
      .select()
      .single();
    if (insertError || !data) {
      setError('Could not load the next question. Please try again.');
      return;
    }
    onExchangesChange([...exchanges, data as InterviewExchange]);
    setUsedQuestionIds((prev) => [...prev, q.id]);
  }, [session.id, exchanges, onExchangesChange]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    setWordCount(value.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || answer.trim().length < 5 || phase !== 'answering') return;
    setPhase('evaluating');
    setError(null);

    const evaluation = evaluateAnswer(answer, currentQuestion);
    setLastEvaluation(evaluation);

    const targetExchange = exchanges[exchanges.length - 1];
    if (!targetExchange) {
      setError('Session state lost. Please restart.');
      setPhase('answering');
      return;
    }

    const { data, error: updateError } = await supabase
      .from('interview_exchanges')
      .update({
        answer: answer.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths.join('\n'),
        improvements: evaluation.improvements.join('\n'),
      })
      .eq('id', targetExchange.id)
      .select()
      .single();

    if (updateError || !data) {
      setError('Could not save your answer. Please try again.');
      setPhase('answering');
      return;
    }

    const updated = [...exchanges];
    updated[updated.length - 1] = data as InterviewExchange;
    onExchangesChange(updated);
    setPhase('feedback');
  };

  const handleNextQuestion = () => {
    if (!lastEvaluation) return;
    const answeredCount = exchanges.filter((e) => e.answer !== null).length;
    if (answeredCount >= QUESTION_LIMIT) {
      setPhase('complete');
      return;
    }
    const nextDiff = lastEvaluation.nextDifficulty;
    setCurrentDifficulty(nextDiff);
    const next = pickNextQuestion(session.focus_area, nextDiff, usedQuestionIds);
    if (next) {
      setCurrentQuestion(next);
      setAnswer('');
      setWordCount(0);
      setLastEvaluation(null);
      setPhase('answering');
      persistQuestion(next);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setPhase('complete');
    }
  };

  const handleEndSession = async () => {
    onEndSession();
  };

  const answeredCount = exchanges.filter((e) => e.answer !== null).length;
  const progress = Math.min(100, (answeredCount / QUESTION_LIMIT) * 100);
  const diffMeta = DIFFICULTY_META[currentDifficulty];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/75 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleEndSession}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
            title="End session"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-100">{session.role}</p>
            <p className="text-xs capitalize text-slate-500">{session.focus_area.replace('-', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 ${diffMeta.ring}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${diffMeta.dot}`} />
            <span className={`text-xs font-semibold ${diffMeta.color}`}>{diffMeta.label}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {answeredCount} / {QUESTION_LIMIT} answered
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {currentQuestion && phase !== 'complete' && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-950">
              {answeredCount + 1}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-slate-300">
                  {currentQuestion.tag.replace('-', ' ')}
                </span>
              </div>
              <p className="text-lg font-medium leading-relaxed text-slate-100">
                {currentQuestion.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === 'answering' && currentQuestion && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
          <label className="mb-2 block text-sm font-medium text-slate-300">Your answer</label>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer as if you were speaking to the interviewer. Take your time - be specific and structured."
            rows={6}
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400/70 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">{wordCount} words</span>
            <button
              onClick={handleSubmit}
              disabled={answer.trim().length < 5}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Send className="h-4 w-4" />
              Submit answer
            </button>
          </div>
        </div>
      )}

      {phase === 'evaluating' && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/75 p-12 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
          <p className="mt-4 text-sm font-medium text-slate-400">Analyzing your answer...</p>
        </div>
      )}

      {phase === 'feedback' && lastEvaluation && (
        <FeedbackCard evaluation={lastEvaluation} onNext={handleNextQuestion} isLast={answeredCount >= QUESTION_LIMIT} />
      )}

      {phase === 'complete' && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-300" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-100">Session complete</h3>
          <p className="mt-1 text-sm text-slate-400">
            You answered {answeredCount} questions. Let's review your full report.
          </p>
          <button
            onClick={handleEndSession}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/40 transition hover:bg-white"
          >
            View report
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  evaluation,
  onNext,
  isLast,
}: {
  evaluation: { score: number; feedback: string; strengths: string[]; improvements: string[]; nextDifficulty: Difficulty };
  onNext: () => void;
  isLast: boolean;
}) {
  const diffChange = evaluation.nextDifficulty;
  const TrendIcon = diffChange === 'hard' ? TrendingUp : diffChange === 'easy' ? TrendingDown : Minus;
  const trendColor = diffChange === 'hard' ? 'text-rose-300' : diffChange === 'easy' ? 'text-emerald-300' : 'text-slate-300';
  const trendLabel = diffChange === 'hard' ? 'Difficulty increasing' : diffChange === 'easy' ? 'Difficulty easing' : 'Holding steady';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Score</p>
            <p className="mt-1 text-4xl font-bold text-slate-100">
              {evaluation.score}
              <span className="text-lg font-medium text-slate-500">/100</span>
            </p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendLabel}
          </div>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{evaluation.feedback}</p>
        </div>
      </div>

      {evaluation.strengths.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <h4 className="text-sm font-semibold text-emerald-200">Strengths</h4>
          </div>
          <ul className="mt-2 space-y-1.5">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-100">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.improvements.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-300" />
            <h4 className="text-sm font-semibold text-amber-200">Areas to improve</h4>
          </div>
          <ul className="mt-2 space-y-1.5">
            {evaluation.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-100">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/40 transition hover:bg-white"
      >
        {isLast ? (
          <>
            <Flag className="h-4 w-4" />
            Finish and view report
          </>
        ) : (
          <>
            Next question
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
