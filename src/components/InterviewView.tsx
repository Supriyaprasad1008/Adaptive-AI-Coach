'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  supabase,
  type Difficulty,
  type InterviewExchange,
  type InterviewSession,
} from '@/lib/supabase';
import { pickNextQuestion, type Question } from '@/lib/questions';
import { evaluateAnswer, countWords } from '@/lib/scoring';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Flag,
  X,
  Mic,
  Square,
} from 'lucide-react';
import styles from '@/styles/InterviewView.module.scss';

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

  // Voice-to-text Dictation & Audio Waveform States
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>([8, 14, 6, 18, 10, 20, 12, 16, 8, 14, 6, 12]);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const QUESTION_LIMIT = 6;

  // Format record timer (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your current browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript.trim()) {
          handleAnswerChange(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

      // Start Web Audio API for real voice volume & frequency detection
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWave = () => {
          if (!analyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const newHeights: number[] = [];
          for (let i = 0; i < 12; i++) {
            const val = dataArray[i * 2] || 0;
            // Map audio volume (0..255) to dynamic height range (4..24px)
            const h = Math.max(4, Math.min(24, Math.floor((val / 255) * 24)));
            newHeights.push(h);
          }
          setBarHeights(newHeights);
          animFrameRef.current = requestAnimationFrame(updateWave);
        };
        updateWave();
      } catch (audioErr) {
        console.warn('Microphone audio stream notice:', audioErr);
      }
    } catch (e) {
      console.error('Could not start speech recognition:', e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

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
    setWordCount(countWords(value));
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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.sessionInfo}>
          <button
            onClick={handleEndSession}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            title="End session"
          >
            <X size={20} />
          </button>
          <div>
            <h2>{session.role}</h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
              {session.focus_area.replace('-', ' ')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className={`${styles.diffIndicator} ${styles[currentDifficulty]}`}>
            <span className={styles.dot} />
            <span style={{ textTransform: 'capitalize' }}>{currentDifficulty}</span>
          </div>
          <button onClick={handleEndSession} className={styles.endBtn}>
            End Session
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#ffe4e6', border: '1px solid #fecdd3', color: '#9f1239', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {currentQuestion && phase !== 'complete' && (
        <div className={styles.card}>
          <div className={styles.questionHeader}>
            <span className={styles.tagBadge}>{currentQuestion.tag.replace('-', ' ')}</span>
            <span className={styles.questionNumber}>Question {answeredCount + 1} of {QUESTION_LIMIT}</span>
          </div>
          <h3 className={styles.questionText}>{currentQuestion.text}</h3>

          {currentQuestion.guidance.length > 0 && (
            <div className={styles.guidanceBox}>
              <h4><Lightbulb size={16} /> Key evaluation criteria</h4>
              <ul>
                {currentQuestion.guidance.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {phase === 'answering' && currentQuestion && (
        <div className={styles.card}>
          <div className={styles.answerArea}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Your Answer</label>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer as if you were speaking to the interviewer. Take your time — be specific and structured."
              rows={6}
            />
          </div>
          <div className={styles.actionRow}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{wordCount} words</span>
            
            <div className={styles.rightActions}>
              {isRecording ? (
                <div
                  className={styles.activeVoiceCapsule}
                  title="Recording voice... Click red button to stop"
                >
                  <div className={styles.capsuleLeft}>
                    <Mic size={18} className={styles.greenMicIcon} />
                    <span className={styles.capsuleTimer}>{formatTime(recordTime)}</span>
                  </div>

                  {/* Real-time Voice Detection Audio Waveform */}
                  <div className={styles.equalizerWave}>
                    {barHeights.map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }} />
                    ))}
                  </div>

                  {/* Red Stop Button */}
                  <button
                    type="button"
                    className={styles.redStopBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      stopRecording();
                    }}
                    title="Stop Voice Dictation"
                  >
                    <Square size={12} fill="#ffffff" color="#ffffff" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.micToggleBtn}
                  onClick={startRecording}
                  title="Voice-to-Text Dictation (Click to Speak)"
                >
                  <Mic size={18} />
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={answer.trim().length < 5 || isRecording}
                className={styles.submitBtn}
              >
                <Send size={16} />
                Submit answer
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'evaluating' && (
        <div className={styles.card} style={{ textAlign: 'center', padding: '48px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#2563eb', margin: '0 auto' }} />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Analyzing your answer and updating difficulty...</p>
        </div>
      )}

      {phase === 'feedback' && lastEvaluation && (
        <FeedbackCard evaluation={lastEvaluation} onNext={handleNextQuestion} isLast={answeredCount >= QUESTION_LIMIT} />
      )}

      {phase === 'complete' && (
        <div className={styles.card} style={{ textAlign: 'center', padding: '48px' }}>
          <CheckCircle2 size={48} style={{ color: '#059669', margin: '0 auto 16px' }} />
          <h2>Session Completed!</h2>
          <p style={{ color: '#475569', marginTop: '8px' }}>
            Great job! You answered all {QUESTION_LIMIT} questions. View your report to see overall feedback.
          </p>
          <button onClick={handleEndSession} className={styles.submitBtn} style={{ margin: '24px auto 0' }}>
            View final report
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
  return (
    <div className={styles.feedbackBox}>
      <div className={styles.feedbackHeader}>
        <div className={styles.scorePill}>
          <span>{evaluation.score}</span>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
        </div>
        <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: '#1e3a8a', fontWeight: 600 }}>
          Next level: {evaluation.nextDifficulty}
        </span>
      </div>

      <div className={styles.feedbackBody}>
        {evaluation.feedback}
      </div>

      <div className={styles.listsGrid}>
        {evaluation.strengths.length > 0 && (
          <div className={styles.strengthsList}>
            <h5><CheckCircle2 size={16} /> Strengths</h5>
            <ul>
              {evaluation.strengths.map((s, idx) => (
                <li key={idx}>• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements.length > 0 && (
          <div className={styles.improvementsList}>
            <h5><Lightbulb size={16} /> Key Improvements</h5>
            <ul>
              {evaluation.improvements.map((s, idx) => (
                <li key={idx}>• {s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={onNext} className={styles.submitBtn} style={{ width: '100%', justifyContent: 'center' }}>
        {isLast ? <>Finish and View Report <Flag size={16} /></> : <>Next Question <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
