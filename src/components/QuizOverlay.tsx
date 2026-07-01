import { useState } from 'react';
import type { Quiz } from '../types';

interface Props {
  quiz: Quiz;
  onDone: (correct: boolean) => void;
}

export default function QuizOverlay({ quiz, onDone }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.answerIndex;

  return (
    <div className="quiz-overlay">
      <div className="quiz-card">
        <div className="quiz-tag">⚡ Checkpoint</div>
        <div className="quiz-prompt">{quiz.prompt}</div>
        <div className="quiz-options">
          {quiz.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) {
              if (i === quiz.answerIndex) cls += ' right';
              else if (i === picked) cls += ' wrong';
              else cls += ' dim';
            }
            return (
              <button key={i} className={cls} disabled={answered} onClick={() => setPicked(i)}>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`quiz-feedback ${correct ? 'ok' : 'no'}`}>
            <strong>{correct ? '✓ Correct!' : '✗ Not quite.'}</strong> {quiz.explanation}
            <button className="btn primary" onClick={() => onDone(correct)}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
