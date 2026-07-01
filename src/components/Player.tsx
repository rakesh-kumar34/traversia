import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlgoModule, Quiz } from '../types';
import ArrayViz from './viz/ArrayViz';
import GraphViz from './viz/GraphViz';
import TableViz from './viz/TableViz';
import QuizOverlay from './QuizOverlay';
import { saveResult } from '../progress';

interface Props {
  algo: AlgoModule;
  onBack: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2.5];

export default function Player({ algo, onBack }: Props) {
  const [runId, setRunId] = useState(0);
  const steps = useMemo(() => algo.generateSteps(), [algo, runId]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pendingQuiz, setPendingQuiz] = useState<Quiz | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizStats, setQuizStats] = useState({ asked: 0, correct: 0 });
  const answeredRef = useRef(new Set<number>());
  const wasPlayingRef = useRef(false);

  const step = steps[idx];
  const atEnd = idx === steps.length - 1;
  const totalQuizzes = useMemo(() => steps.filter((s) => s.quiz).length, [steps]);

  // advance to next step; returns false if blocked by a quiz
  const tryAdvance = () => {
    if (atEnd) return false;
    const next = steps[idx + 1];
    if (next.quiz && !answeredRef.current.has(idx + 1)) {
      answeredRef.current.add(idx + 1);
      wasPlayingRef.current = playing;
      setPendingQuiz(next.quiz);
      setPlaying(false);
      return false;
    }
    setIdx(idx + 1);
    return true;
  };

  useEffect(() => {
    if (!playing || pendingQuiz) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(tryAdvance, 1100 / speed);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    if (atEnd && steps.length > 1) {
      saveResult(algo.id, score, quizStats.correct, quizStats.asked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd]);

  const onQuizDone = (correct: boolean) => {
    setPendingQuiz(null);
    setQuizStats((s) => ({ asked: s.asked + 1, correct: s.correct + (correct ? 1 : 0) }));
    if (correct) {
      setStreak((s) => s + 1);
      setScore((s) => s + 10 + streak * 5);
    } else {
      setStreak(0);
    }
    setIdx((i) => i + 1);
    if (wasPlayingRef.current) setPlaying(true);
  };

  const restart = () => {
    answeredRef.current = new Set();
    setIdx(0);
    setScore(0);
    setStreak(0);
    setQuizStats({ asked: 0, correct: 0 });
    setPendingQuiz(null);
    setPlaying(false);
    setRunId((r) => r + 1);
  };

  return (
    <div className="player">
      <header className="player-header">
        <button className="btn ghost" onClick={onBack}>← All algorithms</button>
        <div className="player-title">
          <h2>{algo.name}</h2>
          <span className="tagline">{algo.tagline}</span>
        </div>
        <div className="scoreboard">
          <span className="score-chip">🏆 {score}</span>
          <span className="score-chip">🔥 {streak}</span>
        </div>
      </header>

      <div className="player-body">
        <div className="viz-panel">
          <div className="viz-stage">
            {step.state.kind === 'array' && <ArrayViz state={step.state} />}
            {step.state.kind === 'graph' && <GraphViz state={step.state} />}
            {step.state.kind === 'table' && <TableViz state={step.state} />}
            {pendingQuiz && <QuizOverlay key={idx} quiz={pendingQuiz} onDone={onQuizDone} />}
            {atEnd && steps.length > 1 && !pendingQuiz && (
              <div className="complete-banner">
                <strong>🎉 Complete!</strong>
                <span>
                  Score {score} · Quizzes {quizStats.correct}/{totalQuizzes}
                </span>
                <button className="btn primary" onClick={restart}>Play again</button>
              </div>
            )}
          </div>

          <div className="step-description">{step.description}</div>

          <div className="controls">
            <button className="btn" onClick={restart} title="Restart">⟲</button>
            <button className="btn" disabled={idx === 0 || !!pendingQuiz} onClick={() => setIdx(idx - 1)}>
              ‹ Back
            </button>
            <button
              className="btn primary play-btn"
              disabled={atEnd || !!pendingQuiz}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
            <button className="btn" disabled={atEnd || !!pendingQuiz} onClick={tryAdvance}>
              Next ›
            </button>
            <div className="speed-group">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  className={`btn tiny ${speed === s ? 'selected' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}×
                </button>
              ))}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(idx / (steps.length - 1)) * 100}%` }} />
            </div>
            <span className="step-count">
              {idx + 1}/{steps.length}
            </span>
          </div>
        </div>

        <aside className="side-panel">
          <div className="code-panel">
            <div className="panel-title">Pseudocode</div>
            <pre>
              {algo.pseudocode.map((line, i) => (
                <div key={i} className={`code-line ${step.codeLine === i ? 'hl' : ''}`}>
                  {line || ' '}
                </div>
              ))}
            </pre>
          </div>
          <div className="info-panel">
            <div className="panel-title">Complexity</div>
            <div className="complexity">
              <span>⏱ {algo.complexity.time}</span>
              <span>💾 {algo.complexity.space}</span>
            </div>
            <div className="panel-title">Interview tips</div>
            <ul className="tips">
              {algo.interviewTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
