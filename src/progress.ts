export interface AlgoResult {
  bestScore: number;
  quizCorrect: number;
  quizTotal: number;
  completions: number;
}

const KEY = 'traversia-progress';

export function loadProgress(): Record<string, AlgoResult> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveResult(algoId: string, score: number, quizCorrect: number, quizTotal: number) {
  const all = loadProgress();
  const prev = all[algoId];
  all[algoId] = {
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    quizCorrect,
    quizTotal,
    completions: (prev?.completions ?? 0) + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(all));
}
