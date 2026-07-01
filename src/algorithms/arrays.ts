import type { AlgoModule, Step, ArrayState, HighlightRole } from '../types';

const P = { L: '#818cf8', R: '#f472b6', M: '#fbbf24', i: '#818cf8', j: '#f472b6' };

export const binarySearch: AlgoModule = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'Arrays',
  tagline: 'Halve the search space every step',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  pseudocode: [
    'L = 0, R = n - 1',
    'while L <= R:',
    '  mid = (L + R) // 2',
    '  if arr[mid] == target: return mid',
    '  else if arr[mid] < target:',
    '    L = mid + 1',
    '  else:',
    '    R = mid - 1',
    'return -1',
  ],
  interviewTips: [
    'Watch for the classic off-by-one: L <= R vs L < R changes when you can stop.',
    'Use mid = L + (R - L) // 2 in languages where (L + R) can overflow.',
    'Senior-level twist: binary search on the answer space (e.g. "minimum capacity to ship packages").',
    'Know the variants: first/last occurrence, rotated sorted array, search on monotonic predicate.',
  ],
  generateSteps: () => {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = 23;
    const steps: Step[] = [];
    const mk = (over: Partial<ArrayState>): ArrayState => ({
      kind: 'array',
      values: arr,
      note: `target = ${target}`,
      ...over,
    });

    let L = 0;
    let R = arr.length - 1;
    const discard = (lo: number, hi: number) => {
      const h: Record<number, HighlightRole> = {};
      for (let k = 0; k < arr.length; k++) if (k < lo || k > hi) h[k] = 'discard';
      return h;
    };

    steps.push({
      state: mk({ pointers: [{ label: 'L', index: L, color: P.L }, { label: 'R', index: R, color: P.R }] }),
      description: `We search the sorted array for ${target}. L and R bracket the search space.`,
      codeLine: 0,
    });

    let firstCompare = true;
    while (L <= R) {
      const mid = (L + R) >> 1;
      const ptrs = [
        { label: 'L', index: L, color: P.L },
        { label: 'R', index: R, color: P.R },
        { label: 'mid', index: mid, color: P.M },
      ];
      steps.push({
        state: mk({ pointers: ptrs, highlights: { ...discard(L, R), [mid]: 'active' } }),
        description: `mid = (${L} + ${R}) // 2 = ${mid}. Compare arr[${mid}] = ${arr[mid]} with target ${target}.`,
        codeLine: 2,
      });
      if (arr[mid] === target) {
        steps.push({
          state: mk({ pointers: ptrs, highlights: { ...discard(L, R), [mid]: 'found' } }),
          description: `arr[${mid}] = ${target} — found the target at index ${mid} in just ${steps.filter((s) => s.codeLine === 2).length} comparisons!`,
          codeLine: 3,
          quiz: {
            prompt: `arr[${mid}] = ${arr[mid]} and the target is ${target}. What happens now?`,
            options: ['Return mid — we found it', 'Move L to mid + 1', 'Move R to mid - 1', 'Keep scanning linearly'],
            answerIndex: 0,
            explanation: 'The midpoint equals the target, so we return its index immediately.',
          },
        });
        break;
      } else if (arr[mid] < target) {
        const newL = mid + 1;
        steps.push({
          state: mk({
            pointers: [{ label: 'L', index: newL, color: P.L }, { label: 'R', index: R, color: P.R }],
            highlights: discard(newL, R),
          }),
          description: `${arr[mid]} < ${target}, so the target must be right of mid. Discard the left half: L = ${newL}.`,
          codeLine: 5,
          quiz: firstCompare
            ? {
                prompt: `arr[mid] = ${arr[mid]} is LESS than the target ${target}. Which half can we throw away?`,
                options: [
                  'Left half — everything ≤ arr[mid] is too small',
                  'Right half — everything after mid',
                  'Neither, compare neighbors first',
                ],
                answerIndex: 0,
                explanation:
                  'Since the array is sorted and arr[mid] < target, no element at or before mid can be the target.',
              }
            : undefined,
        });
        L = newL;
      } else {
        const newR = mid - 1;
        steps.push({
          state: mk({
            pointers: [{ label: 'L', index: L, color: P.L }, { label: 'R', index: newR, color: P.R }],
            highlights: discard(L, newR),
          }),
          description: `${arr[mid]} > ${target}, so the target must be left of mid. Discard the right half: R = ${newR}.`,
          codeLine: 7,
          quiz: firstCompare
            ? {
                prompt: `arr[mid] = ${arr[mid]} is GREATER than the target ${target}. Which half survives?`,
                options: ['The right half', 'The left half', 'Both halves'],
                answerIndex: 1,
                explanation: 'arr[mid] is too big, so the target (if present) must be strictly left of mid.',
              }
            : undefined,
        });
        R = newR;
      }
      firstCompare = false;
    }
    return steps;
  },
};

export const twoPointers: AlgoModule = {
  id: 'two-pointers',
  name: 'Two Pointers (Pair Sum)',
  category: 'Arrays',
  tagline: 'Squeeze from both ends of a sorted array',
  complexity: { time: 'O(n)', space: 'O(1)' },
  pseudocode: [
    'L = 0, R = n - 1',
    'while L < R:',
    '  sum = arr[L] + arr[R]',
    '  if sum == target: return (L, R)',
    '  else if sum < target:',
    '    L += 1   # need a bigger sum',
    '  else:',
    '    R -= 1   # need a smaller sum',
    'return not found',
  ],
  interviewTips: [
    'Only works because the array is sorted — moving L up can only increase the sum, moving R down can only decrease it.',
    'This is the core of 3Sum: sort, fix one element, two-pointer the rest.',
    'Compare with the hash-set approach: O(n) time but O(n) space, and it works unsorted.',
    'Related patterns: container with most water, trapping rain water.',
  ],
  generateSteps: () => {
    const arr = [1, 3, 4, 6, 8, 11, 14, 18];
    const target = 17;
    const steps: Step[] = [];
    const mk = (L: number, R: number, over: Partial<ArrayState> = {}): ArrayState => ({
      kind: 'array',
      values: arr,
      note: `target = ${target}`,
      pointers: [
        { label: 'L', index: L, color: P.L },
        { label: 'R', index: R, color: P.R },
      ],
      ...over,
    });

    let L = 0;
    let R = arr.length - 1;
    steps.push({
      state: mk(L, R),
      description: `Find two numbers that sum to ${target}. Start with pointers at both ends.`,
      codeLine: 0,
    });

    let asked = 0;
    while (L < R) {
      const sum = arr[L] + arr[R];
      const hl: Record<number, HighlightRole> = { [L]: 'compare', [R]: 'compare' };
      if (sum === target) {
        steps.push({
          state: mk(L, R, { highlights: { [L]: 'found', [R]: 'found' } }),
          description: `${arr[L]} + ${arr[R]} = ${target} — pair found at indices (${L}, ${R})! Each step eliminated one candidate, so the whole scan is O(n).`,
          codeLine: 3,
        });
        break;
      }
      const movesL = sum < target;
      steps.push({
        state: mk(L, R, { highlights: hl }),
        description: `arr[L] + arr[R] = ${arr[L]} + ${arr[R]} = ${sum} — ${movesL ? 'too small' : 'too big'}.`,
        codeLine: 2,
        quiz:
          asked < 2
            ? {
                prompt: `The sum ${arr[L]} + ${arr[R]} = ${sum} is ${movesL ? 'less' : 'greater'} than ${target}. Which pointer moves?`,
                options: ['L moves right (bigger sum)', 'R moves left (smaller sum)', 'Both move inward'],
                answerIndex: movesL ? 0 : 1,
                explanation: movesL
                  ? `The sum is too small and the array is sorted, so only moving L right can increase it.`
                  : `The sum is too big, so only moving R left can decrease it.`,
              }
            : undefined,
      });
      asked++;
      if (movesL) {
        L++;
        steps.push({ state: mk(L, R), description: `Need a bigger sum → move L right to index ${L}.`, codeLine: 5 });
      } else {
        R--;
        steps.push({ state: mk(L, R), description: `Need a smaller sum → move R left to index ${R}.`, codeLine: 7 });
      }
    }
    return steps;
  },
};

export const slidingWindow: AlgoModule = {
  id: 'sliding-window',
  name: 'Sliding Window (Max Sum)',
  category: 'Arrays',
  tagline: 'Reuse work as the window slides',
  complexity: { time: 'O(n)', space: 'O(1)' },
  pseudocode: [
    'windowSum = sum(arr[0..k-1])',
    'best = windowSum',
    'for i in k..n-1:',
    '  windowSum += arr[i]      # element entering',
    '  windowSum -= arr[i - k]  # element leaving',
    '  best = max(best, windowSum)',
    'return best',
  ],
  interviewTips: [
    'The key insight: adjacent windows overlap in k-1 elements, so recompute in O(1), not O(k).',
    'This fixed-size version is the warm-up; interviews usually ask the variable-size version (e.g. longest substring without repeats).',
    'For variable windows: expand right while valid, shrink left while invalid.',
    'If the window needs "max element" instead of sum, that\'s a monotonic deque problem.',
  ],
  generateSteps: () => {
    const arr = [2, 1, 5, 1, 3, 2, 7, 1];
    const k = 3;
    const steps: Step[] = [];
    const mk = (lo: number, hi: number, note: string, over: Partial<ArrayState> = {}): ArrayState => ({
      kind: 'array',
      values: arr,
      window: [lo, hi],
      note,
      ...over,
    });

    let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
    let best = windowSum;
    steps.push({
      state: mk(0, k - 1, `window sum = ${windowSum} · best = ${best}`),
      description: `Find the max sum of any ${k} consecutive elements. Sum the first window: ${arr.slice(0, k).join(' + ')} = ${windowSum}.`,
      codeLine: 0,
    });

    for (let i = k; i < arr.length; i++) {
      const leaving = arr[i - k];
      const entering = arr[i];
      const newSum = windowSum + entering - leaving;
      steps.push({
        state: mk(i - k + 1, i, `window sum = ${windowSum} → ${newSum}`, {
          highlights: { [i]: 'active', [i - k]: 'discard' },
        }),
        description: `Slide the window: ${entering} enters, ${leaving} leaves. New sum = ${windowSum} + ${entering} − ${leaving} = ${newSum}. No re-summing needed!`,
        codeLine: 3,
        quiz:
          i === k
            ? {
                prompt: `The window slides one step right. How do we get the new sum from the old sum (${windowSum}) in O(1)?`,
                options: [
                  `Add entering ${entering}, subtract leaving ${leaving}`,
                  'Re-sum all 3 elements in the window',
                  `Add ${entering} only`,
                ],
                answerIndex: 0,
                explanation:
                  'Adjacent windows share k−1 elements, so only the entering and leaving elements change the sum.',
              }
            : undefined,
      });
      windowSum = newSum;
      const improved = windowSum > best;
      best = Math.max(best, windowSum);
      steps.push({
        state: mk(i - k + 1, i, `window sum = ${windowSum} · best = ${best}`, {
          highlights: improved ? Object.fromEntries([...Array(k)].map((_, d) => [i - k + 1 + d, 'found'])) : undefined,
        }),
        description: improved
          ? `New best! ${windowSum} beats the previous best.`
          : `Sum ${windowSum} does not beat best = ${best}.`,
        codeLine: 5,
      });
    }
    steps.push({
      state: mk(4, 6, `best = ${best}`, {
        highlights: { 4: 'found', 5: 'found', 6: 'found' },
      }),
      description: `Done — the maximum sum of any ${k} consecutive elements is ${best}. One pass, O(n) total.`,
      codeLine: 6,
    });
    return steps;
  },
};

export const arrayAlgos = [binarySearch, twoPointers, slidingWindow];
