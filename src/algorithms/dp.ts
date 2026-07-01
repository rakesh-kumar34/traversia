import type { AlgoModule, Step, TableCell, ArrayState } from '../types';

export const fibMemo: AlgoModule = {
  id: 'fib-memo',
  name: 'Memoization (Fibonacci)',
  category: 'Dynamic Programming',
  tagline: 'Cache overlapping subproblems — exponential becomes linear',
  complexity: { time: 'O(n) with memo (vs O(2ⁿ) naive)', space: 'O(n)' },
  pseudocode: [
    'memo = {}',
    'fib(n):',
    '  if n <= 1: return n',
    '  if n in memo: return memo[n]  # cache hit!',
    '  memo[n] = fib(n-1) + fib(n-2)',
    '  return memo[n]',
  ],
  interviewTips: [
    'Memoization = top-down DP: write the natural recursion, then cache results keyed by the arguments.',
    'DP applies when a problem has overlapping subproblems + optimal substructure. Naive fib recomputes fib(3) five times inside fib(7).',
    'In interviews, start with brute-force recursion, then add the memo — it shows the derivation, not just the trick.',
    'Convert to bottom-up (tabulation) when you need to control evaluation order or squeeze space (fib needs only 2 variables).',
  ],
  generateSteps: () => {
    const N = 7;
    const memo: (number | null)[] = Array(N + 1).fill(null);
    const steps: Step[] = [];
    const table = (roles: Record<number, 'active' | 'found' | 'compare'> = {}, note?: string) => ({
      kind: 'table' as const,
      rows: [memo.map((v, i): TableCell => ({ value: v, role: roles[i] }))],
      rowLabels: ['memo'],
      colLabels: [...Array(N + 1)].map((_, i) => `f(${i})`),
      note,
    });

    steps.push({
      state: table({}, `computing fib(${N}) top-down`),
      description: `We call fib(${N}). Naively this explodes into O(2ⁿ) calls because the same subproblems repeat. Watch the memo kill that duplication.`,
      codeLine: 1,
    });

    let quizzed = false;
    const fib = (n: number, depth: number): number => {
      const pad = 'fib(' + n + ')';
      if (n <= 1) {
        memo[n] = n;
        steps.push({
          state: table({ [n]: 'found' }, `depth ${depth}: ${pad} is a base case`),
          description: `${pad} = ${n} — base case.`,
          codeLine: 2,
        });
        return n;
      }
      if (memo[n] !== null) {
        steps.push({
          state: table({ [n]: 'compare' }, `depth ${depth}: ${pad} → cache HIT`),
          description: `${pad} is already in the memo (= ${memo[n]}) — return it instantly. No re-computation!`,
          codeLine: 3,
          quiz: !quizzed
            ? ((quizzed = true),
              {
                prompt: `fib(${n}) is called again, but memo[${n}] = ${memo[n]} already. What happens?`,
                options: [
                  `Return ${memo[n]} in O(1) — the entire subtree of calls is skipped`,
                  'Recompute it to be safe',
                  'The recursion errors out',
                ],
                answerIndex: 0,
                explanation:
                  'This is the whole point of memoization: each distinct subproblem is solved once, so total work drops from O(2ⁿ) to O(n).',
              })
            : undefined,
        });
        return memo[n]!;
      }
      steps.push({
        state: table({ [n]: 'active' }, `depth ${depth}: expanding ${pad}`),
        description: `${pad} is not cached → recurse into fib(${n - 1}) + fib(${n - 2}).`,
        codeLine: 4,
      });
      const result = fib(n - 1, depth + 1) + fib(n - 2, depth + 1);
      memo[n] = result;
      steps.push({
        state: table({ [n]: 'found', [n - 1]: 'compare', [n - 2]: 'compare' }, `memo[${n}] = ${result}`),
        description: `${pad} = fib(${n - 1}) + fib(${n - 2}) = ${memo[n - 1]} + ${memo[n - 2]} = ${result}. Store it in the memo.`,
        codeLine: 4,
      });
      return result;
    };
    const ans = fib(N, 0);
    steps.push({
      state: table({ [N]: 'found' }, `fib(${N}) = ${ans}`),
      description: `Done: fib(${N}) = ${ans}. Each cell was computed exactly once — ${N + 1} computations instead of ${2 ** N - 1}-ish naive calls.`,
      codeLine: 5,
    });
    return steps;
  },
};

export const knapsack: AlgoModule = {
  id: 'knapsack',
  name: '0/1 Knapsack (Tabulation)',
  category: 'Dynamic Programming',
  tagline: 'Take it or leave it — a table of best values',
  complexity: { time: 'O(n · W)', space: 'O(n · W), or O(W) optimized' },
  pseudocode: [
    'dp[i][c] = best value using first i items',
    '           with capacity c',
    'dp[0][*] = 0',
    'for each item i (weight w, value v):',
    '  for capacity c in 0..W:',
    '    skip = dp[i-1][c]',
    '    take = v + dp[i-1][c - w]  # if c >= w',
    '    dp[i][c] = max(skip, take)',
    'answer = dp[n][W]',
  ],
  interviewTips: [
    'The state definition is the interview: "best value using the first i items within capacity c". Say it out loud before coding.',
    'Each cell makes one binary decision — skip the item (row above, same column) or take it (row above, w columns left, plus its value).',
    'Space optimization: keep one row and iterate capacity RIGHT-TO-LEFT (left-to-right would let an item be taken twice — that variant is the unbounded knapsack).',
    'Subset-sum, partition-equal-subset, and target-sum are all knapsack in costume.',
  ],
  generateSteps: () => {
    const items = [
      { name: 'A', w: 1, v: 15 },
      { name: 'B', w: 3, v: 20 },
      { name: 'C', w: 4, v: 30 },
    ];
    const W = 4;
    const n = items.length;
    const dp: (number | null)[][] = [...Array(n + 1)].map(() => Array(W + 1).fill(null));
    for (let c = 0; c <= W; c++) dp[0][c] = 0;

    const steps: Step[] = [];
    const table = (roles: Record<string, 'active' | 'found' | 'compare'> = {}, note?: string) => ({
      kind: 'table' as const,
      rows: dp.map((row, i) => row.map((v, j): TableCell => ({ value: v, role: roles[`${i},${j}`] }))),
      rowLabels: ['no items', ...items.map((it) => `+${it.name} (w${it.w},v${it.v})`)],
      colLabels: [...Array(W + 1)].map((_, c) => `cap ${c}`),
      note,
    });

    steps.push({
      state: table({}, `items: ${items.map((i) => `${i.name}(w=${i.w},v=${i.v})`).join(' ')} · knapsack capacity ${W}`),
      description: `Pick items maximizing value within capacity ${W}. dp[i][c] = best value using the first i items with capacity c. Row 0 (no items) is all zeros.`,
      codeLine: 2,
    });

    let quizzed = false;
    for (let i = 1; i <= n; i++) {
      const { name, w, v } = items[i - 1];
      steps.push({
        state: table({}, `row ${i}: item ${name} (weight ${w}, value ${v}) becomes available`),
        description: `Row ${i}: item ${name} enters the picture. For each capacity, decide — skip ${name} or take it?`,
        codeLine: 3,
      });
      for (let c = 0; c <= W; c++) {
        const skip = dp[i - 1][c]!;
        const canTake = c >= w;
        const take = canTake ? v + dp[i - 1][c - w]! : -1;
        const best = Math.max(skip, canTake ? take : skip);
        const roles: Record<string, 'active' | 'found' | 'compare'> = {
          [`${i},${c}`]: 'active',
          [`${i - 1},${c}`]: 'compare',
        };
        if (canTake) roles[`${i - 1},${c - w}`] = 'compare';
        const isQuizCell = !quizzed && canTake && take !== skip && i === 2;
        dp[i][c] = best;
        steps.push({
          state: table({ ...roles, [`${i},${c}`]: 'found' }, `dp[${i}][${c}] = ${best}`),
          description: canTake
            ? `cap ${c}: skip ${name} → ${skip}, or take ${name} → ${v} + dp[${i - 1}][${c - w}] = ${take}. Best: ${best}.`
            : `cap ${c}: ${name} weighs ${w} — too heavy for capacity ${c}. Forced to skip → ${skip}.`,
          codeLine: canTake ? 7 : 5,
          quiz: isQuizCell
            ? ((quizzed = true),
              {
                prompt: `Capacity ${c}, item ${name} (w=${w}, v=${v}). Skip gives ${skip}. Take gives ${v} + dp[${i - 1}][${c - w}] = ${take}. What goes in the cell?`,
                options: [`${Math.max(skip, take)} — max of skip and take`, `${skip + take} — add both options`, `${v} — just the item's value`],
                answerIndex: 0,
                explanation: `Each cell is one decision: max(skip, take). Taking ${name} leaves capacity ${c - w}, whose best value we already computed in the row above.`,
              })
            : undefined,
        });
      }
    }
    steps.push({
      state: table({ [`${n},${W}`]: 'found' }, `answer: dp[${n}][${W}] = ${dp[n][W]}`),
      description: `The answer sits in the bottom-right: best value ${dp[n][W]} (items A + B: weight 4, value 35). Trace back through the decisions to recover WHICH items.`,
      codeLine: 8,
    });
    return steps;
  },
};

export const lis: AlgoModule = {
  id: 'lis',
  name: 'Longest Increasing Subsequence',
  category: 'Dynamic Programming',
  tagline: 'dp[i] = longest increasing run ending at i',
  complexity: { time: 'O(n²), or O(n log n) with patience sort', space: 'O(n)' },
  pseudocode: [
    'dp[i] = length of the LIS ending at i',
    'all dp[i] start at 1 (element alone)',
    'for i in 0..n-1:',
    '  for j in 0..i-1:',
    '    if arr[j] < arr[i]:',
    '      dp[i] = max(dp[i], dp[j] + 1)',
    'answer = max(dp)',
  ],
  interviewTips: [
    'The state "LIS ending exactly at i" is the unlock — it makes the recurrence local: extend any smaller predecessor.',
    'Subsequence ≠ subarray: elements need not be adjacent, only in order.',
    'The O(n log n) upgrade (binary search over "smallest tail per length") is a strong senior-level talking point.',
    'Variants: Russian doll envelopes (sort + LIS), number of LIS, longest divisible subset.',
  ],
  generateSteps: () => {
    const arr = [3, 1, 8, 2, 5];
    const n = arr.length;
    const dp = Array(n).fill(1);
    const steps: Step[] = [];
    const mk = (over: Partial<ArrayState> = {}): ArrayState => ({
      kind: 'array',
      values: arr,
      aux: { label: 'dp', values: [...dp] },
      ...over,
    });

    steps.push({
      state: mk(),
      description: 'Find the longest strictly-increasing subsequence. dp[i] = length of the best one ENDING at index i. Alone, every element is a subsequence of length 1.',
      codeLine: 1,
    });

    let quizzed = false;
    for (let i = 1; i < n; i++) {
      steps.push({
        state: mk({ highlights: { [i]: 'active' }, note: `i = ${i}: can any earlier element extend into ${arr[i]}?` }),
        description: `i = ${i} (value ${arr[i]}): check every j < i. If arr[j] < ${arr[i]}, an increasing run ending at j can extend to include ${arr[i]}.`,
        codeLine: 3,
      });
      for (let j = 0; j < i; j++) {
        const ok = arr[j] < arr[i];
        const improves = ok && dp[j] + 1 > dp[i];
        const isQuiz = !quizzed && i === 4 && j === 3;
        if (improves) dp[i] = dp[j] + 1;
        steps.push({
          state: mk({
            highlights: { [i]: 'active', [j]: ok ? 'found' : 'discard' },
            note: `dp[${i}] = ${dp[i]}`,
          }),
          description: ok
            ? improves
              ? `arr[${j}] = ${arr[j]} < ${arr[i]} ✓ — extend it: dp[${i}] = dp[${j}] + 1 = ${dp[i]}.`
              : `arr[${j}] = ${arr[j]} < ${arr[i]} ✓ — but dp[${j}] + 1 = ${dp[j] + 1} doesn't beat dp[${i}] = ${dp[i]}.`
            : `arr[${j}] = ${arr[j]} ≥ ${arr[i]} ✗ — can't extend a run through a bigger-or-equal value.`,
          codeLine: ok ? 5 : 4,
          quiz: isQuiz
            ? ((quizzed = true),
              {
                prompt: `i=4 (value ${arr[4]}), j=3 (value ${arr[3]}, dp[3]=${dp[3]}). Can the run ending at ${arr[3]} extend to ${arr[4]}, and what would dp[4] become?`,
                options: [
                  `Yes — ${arr[3]} < ${arr[4]}, so dp[4] = dp[3] + 1 = ${dp[3] + 1}`,
                  `No — ${arr[3]} comes right before ${arr[4]}, subsequences must skip`,
                  `Yes, and dp[4] = dp[3] = ${dp[3]}`,
                ],
                answerIndex: 0,
                explanation: `${arr[3]} < ${arr[4]} so the increasing run (1, 2) extends to (1, 2, 5): length ${dp[3] + 1}.`,
              })
            : undefined,
        });
      }
    }
    const best = Math.max(...dp);
    const bestIdx = dp.indexOf(best);
    steps.push({
      state: mk({ highlights: { [bestIdx]: 'found' }, note: `answer: max(dp) = ${best}` }),
      description: `The answer is max(dp) = ${best} — here the subsequence (1, 2, 5). Note it skips elements: subsequence, not subarray. O(n²) pairs checked.`,
      codeLine: 6,
    });
    return steps;
  },
};

export const dpAlgos = [fibMemo, knapsack, lis];
