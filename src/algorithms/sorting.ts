import type { AlgoModule, Step, ArrayState, HighlightRole } from '../types';

export const quickSort: AlgoModule = {
  id: 'quick-sort',
  name: 'Quicksort',
  category: 'Sorting & Heaps',
  tagline: 'Partition around a pivot, recurse on both sides',
  complexity: { time: 'O(n log n) avg, O(n²) worst', space: 'O(log n) stack' },
  pseudocode: [
    'quicksort(arr, lo, hi):',
    '  if lo >= hi: return',
    '  pivot = arr[hi]',
    '  i = lo',
    '  for j in lo..hi-1:',
    '    if arr[j] < pivot:',
    '      swap(arr[i], arr[j]); i += 1',
    '  swap(arr[i], arr[hi])  # pivot home',
    '  quicksort(arr, lo, i - 1)',
    '  quicksort(arr, i + 1, hi)',
  ],
  interviewTips: [
    'Worst case O(n²) happens on already-sorted input with a fixed pivot — randomize the pivot or use median-of-three.',
    'After partition, the pivot is in its FINAL sorted position. That fact powers Quickselect (find k-th smallest in O(n) average).',
    'Quicksort is not stable; mergesort is. Know when stability matters.',
    'Staff-level follow-up: why do standard libraries use introsort (quicksort + heapsort fallback + insertion sort for small ranges)?',
  ],
  generateSteps: () => {
    const arr = [7, 2, 9, 4, 3, 8, 5];
    const steps: Step[] = [];
    const done = new Set<number>();
    const mk = (over: Partial<ArrayState> = {}): ArrayState => {
      const highlights: Record<number, HighlightRole> = {};
      done.forEach((d) => (highlights[d] = 'done'));
      const o = over.highlights ? { ...highlights, ...over.highlights } : highlights;
      return { kind: 'array', values: [...arr], ...over, highlights: o };
    };

    steps.push({
      state: mk(),
      description: 'Quicksort: pick a pivot, move everything smaller to its left, then recurse on each side.',
      codeLine: 0,
    });

    let quizzed = false;
    const sort = (lo: number, hi: number, depth: number) => {
      if (lo >= hi) {
        if (lo === hi) {
          done.add(lo);
          steps.push({
            state: mk(),
            description: `Range [${lo}..${hi}] has one element — already sorted.`,
            codeLine: 1,
          });
        }
        return;
      }
      const pivot = arr[hi];
      steps.push({
        state: mk({ window: [lo, hi], highlights: { [hi]: 'pivot' } }),
        description: `Depth ${depth}: partition range [${lo}..${hi}] around pivot arr[${hi}] = ${pivot}.`,
        codeLine: 2,
      });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        const smaller = arr[j] < pivot;
        steps.push({
          state: mk({
            window: [lo, hi],
            highlights: { [hi]: 'pivot', [j]: 'compare', [i]: 'active' },
            pointers: [
              { label: 'i', index: i, color: '#818cf8' },
              { label: 'j', index: j, color: '#f472b6' },
            ],
          }),
          description: `Is arr[j] = ${arr[j]} < pivot ${pivot}? ${smaller ? 'Yes → swap into the "smaller" zone and grow it.' : 'No → leave it, it belongs right of the pivot.'}`,
          codeLine: 5,
          quiz:
            !quizzed && j === lo + 1
              ? ((quizzed = true),
                {
                  prompt: `arr[j] = ${arr[j]}, pivot = ${pivot}. What does the partition loop do with ${arr[j]}?`,
                  options: [
                    arr[j] < pivot
                      ? 'Swap it into the left "smaller than pivot" zone'
                      : 'Leave it — it stays on the pivot\'s right side',
                    arr[j] < pivot
                      ? 'Leave it — it stays on the pivot\'s right side'
                      : 'Swap it into the left "smaller than pivot" zone',
                    'Swap it with the pivot immediately',
                  ],
                  answerIndex: 0,
                  explanation:
                    arr[j] < pivot
                      ? `${arr[j]} < ${pivot}, so it joins the left zone of elements smaller than the pivot; i advances.`
                      : `${arr[j]} ≥ ${pivot}, so the loop skips it — only smaller elements are swapped left.`,
                })
              : undefined,
        });
        if (smaller) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            state: mk({
              window: [lo, hi],
              highlights: { [hi]: 'pivot', [i]: 'active', [j]: 'active' },
            }),
            description: `Swap arr[${i}] ↔ arr[${j}]. The "smaller" zone grows to include ${arr[i]}.`,
            codeLine: 6,
          });
          i++;
        }
      }
      [arr[i], arr[hi]] = [arr[hi], arr[i]];
      done.add(i);
      steps.push({
        state: mk({ window: [lo, hi] }),
        description: `Swap the pivot into position ${i}. ${pivot} is now in its FINAL sorted place — everything left is smaller, everything right is bigger.`,
        codeLine: 7,
      });
      sort(lo, i - 1, depth + 1);
      sort(i + 1, hi, depth + 1);
    };
    sort(0, arr.length - 1, 0);
    steps.push({
      state: mk(),
      description: 'Every pivot landed in its final spot — the array is sorted. Average O(n log n): each level of recursion does O(n) partitioning work across ~log n levels.',
      codeLine: 9,
    });
    return steps;
  },
};

export const mergeSort: AlgoModule = {
  id: 'merge-sort',
  name: 'Mergesort',
  category: 'Sorting & Heaps',
  tagline: 'Split in half, sort each, merge sorted halves',
  complexity: { time: 'O(n log n) always', space: 'O(n)' },
  pseudocode: [
    'mergesort(arr, lo, hi):',
    '  if lo >= hi: return',
    '  mid = (lo + hi) // 2',
    '  mergesort(arr, lo, mid)',
    '  mergesort(arr, mid+1, hi)',
    '  merge the two sorted halves:',
    '    take the smaller front element',
    '    of either half, repeatedly',
    '  copy merged result back',
  ],
  interviewTips: [
    'Guaranteed O(n log n) — no bad cases — but needs O(n) extra memory. That tradeoff vs quicksort is a classic question.',
    'Mergesort is stable: equal elements keep their order. Crucial for multi-key sorting.',
    'The merge step is its own famous interview problem: "merge two sorted lists / k sorted lists".',
    'External sorting (data bigger than RAM) is mergesort-based — a common staff-level systems tie-in.',
  ],
  generateSteps: () => {
    const arr = [6, 3, 8, 2, 7, 1, 5, 4];
    const steps: Step[] = [];
    const mk = (over: Partial<ArrayState> = {}): ArrayState => ({ kind: 'array', values: [...arr], ...over });

    steps.push({
      state: mk(),
      description: 'Mergesort: recursively split until pieces of size 1 (trivially sorted), then merge pairs of sorted runs back together.',
      codeLine: 0,
    });

    let quizzed = false;
    const merge = (lo: number, mid: number, hi: number) => {
      steps.push({
        state: mk({ window: [lo, hi], note: `merging [${lo}..${mid}] with [${mid + 1}..${hi}]` }),
        description: `Merge two sorted runs: [${arr.slice(lo, mid + 1).join(', ')}] and [${arr.slice(mid + 1, hi + 1).join(', ')}].`,
        codeLine: 5,
      });
      const out: (number | null)[] = Array(hi - lo + 1).fill(null);
      let i = lo, j = mid + 1, k = 0;
      while (i <= mid || j <= hi) {
        const takeLeft = j > hi || (i <= mid && arr[i] <= arr[j]);
        const src = takeLeft ? i : j;
        const val = arr[src];
        out[k] = val;
        const desc =
          i <= mid && j <= hi
            ? `Compare fronts: ${arr[i]} vs ${arr[j]} → take the smaller, ${val}.`
            : `One run is empty → take ${val} from the other.`;
        steps.push({
          state: mk({
            window: [lo, hi],
            highlights: { [src]: 'active' },
            aux: { label: 'merged', values: [...out] },
            note: `merging [${lo}..${mid}] with [${mid + 1}..${hi}]`,
          }),
          description: desc,
          codeLine: 6,
          quiz:
            !quizzed && i <= mid && j <= hi && k === 0 && hi - lo === 3
              ? ((quizzed = true),
                {
                  prompt: `We merge runs [${arr.slice(lo, mid + 1).join(', ')}] and [${arr.slice(mid + 1, hi + 1).join(', ')}]. Which element goes into the merged output first?`,
                  options: [String(Math.min(arr[i], arr[j])), String(Math.max(arr[i], arr[j])), String(arr[hi])],
                  answerIndex: 0,
                  explanation: `The merge always takes the smaller of the two front elements — here ${Math.min(arr[i], arr[j])}.`,
                })
              : undefined,
        });
        if (takeLeft) i++;
        else j++;
        k++;
      }
      for (let t = 0; t < out.length; t++) arr[lo + t] = out[t]!;
      steps.push({
        state: mk({
          window: [lo, hi],
          highlights: Object.fromEntries([...Array(hi - lo + 1)].map((_, t) => [lo + t, 'done'])),
        }),
        description: `Copy the merged run back: [${arr.slice(lo, hi + 1).join(', ')}] is now sorted.`,
        codeLine: 8,
      });
    };

    const sort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      sort(lo, mid);
      sort(mid + 1, hi);
      merge(lo, mid, hi);
    };
    sort(0, arr.length - 1);
    steps.push({
      state: mk({ highlights: Object.fromEntries(arr.map((_, i) => [i, 'done'])) }),
      description: 'Fully merged — sorted in guaranteed O(n log n): log n levels of merging, O(n) work per level.',
      codeLine: 8,
    });
    return steps;
  },
};

export const heapSort: AlgoModule = {
  id: 'heap-sort',
  name: 'Heapsort & Heap Operations',
  category: 'Sorting & Heaps',
  tagline: 'A max-heap in an array: parent i, children 2i+1 and 2i+2',
  complexity: { time: 'O(n log n)', space: 'O(1)' },
  pseudocode: [
    'buildMaxHeap(arr):',
    '  for i from n/2 - 1 down to 0:',
    '    siftDown(i)',
    'heapsort:',
    '  for end from n-1 down to 1:',
    '    swap(arr[0], arr[end])  # max to back',
    '    siftDown(0) within arr[0..end-1]',
    'siftDown(i): swap i with its largest',
    '  child while a child is bigger',
  ],
  interviewTips: [
    'The array IS the tree: children of i live at 2i+1 and 2i+2, parent at (i−1)/2. No pointers needed.',
    'buildMaxHeap is O(n), not O(n log n) — a favorite "gotcha" question. Most nodes sift down only a little.',
    'Heaps power top-K problems: keep a min-heap of size K for the K largest elements → O(n log K).',
    'Know heap push/pop cold: they appear inside Dijkstra, medians-of-stream, and merge-K-lists.',
  ],
  generateSteps: () => {
    const arr = [4, 10, 3, 5, 1, 8];
    const n = arr.length;
    const steps: Step[] = [];
    const sorted = new Set<number>();
    const mk = (over: Partial<ArrayState> = {}): ArrayState => {
      const highlights: Record<number, HighlightRole> = {};
      sorted.forEach((d) => (highlights[d] = 'done'));
      return {
        kind: 'array',
        values: [...arr],
        ...over,
        highlights: over.highlights ? { ...highlights, ...over.highlights } : highlights,
      };
    };

    steps.push({
      state: mk(),
      description: 'Heapsort phase 1: turn the array into a max-heap (every parent ≥ its children). Index i\'s children sit at 2i+1 and 2i+2.',
      codeLine: 0,
    });

    let quizzed = false;
    const siftDown = (i: number, size: number, codeLine: number) => {
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;
        if (l < size && arr[l] > arr[largest]) largest = l;
        if (r < size && arr[r] > arr[largest]) largest = r;
        const kids = [l, r].filter((c) => c < size);
        if (kids.length) {
          steps.push({
            state: mk({
              highlights: Object.fromEntries([[i, 'active'], ...kids.map((c) => [c, 'compare'])]),
              note: `parent arr[${i}]=${arr[i]} vs children ${kids.map((c) => `arr[${c}]=${arr[c]}`).join(', ')}`,
            }),
            description: `siftDown(${i}): compare parent ${arr[i]} with ${kids.map((c) => arr[c]).join(' and ')}.`,
            codeLine,
            quiz:
              !quizzed && kids.length === 2
                ? ((quizzed = true),
                  {
                    prompt: `Parent ${arr[i]} has children ${arr[l]} and ${arr[r]}. What does siftDown do?`,
                    options: [
                      largest === i
                        ? 'Nothing — the parent is already the largest'
                        : `Swap parent with ${arr[largest]} (the LARGER child)`,
                      `Swap parent with ${Math.min(arr[l], arr[r])} (the smaller child)`,
                      'Swap the two children with each other',
                    ],
                    answerIndex: 0,
                    explanation:
                      largest === i
                        ? 'The parent already dominates both children — heap property holds here.'
                        : 'To keep the max-heap property after the swap, the parent must swap with the larger child; otherwise the smaller child would become parent of the larger one.',
                  })
                : undefined,
          });
        }
        if (largest === i) break;
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        steps.push({
          state: mk({ highlights: { [i]: 'active', [largest]: 'active' } }),
          description: `Child ${arr[i]} was bigger → swap. ${arr[i]} moves up, ${arr[largest]} sinks to index ${largest}.`,
          codeLine: 7,
        });
        i = largest;
      }
    };

    for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n, 2);
    steps.push({
      state: mk({ highlights: { 0: 'found' } }),
      description: `Max-heap built — the maximum (${arr[0]}) is at the root. Fun fact: building took O(n), not O(n log n).`,
      codeLine: 2,
    });

    for (let end = n - 1; end >= 1; end--) {
      [arr[0], arr[end]] = [arr[end], arr[0]];
      sorted.add(end);
      steps.push({
        state: mk({ highlights: { 0: 'active' } }),
        description: `Swap the root (max) to position ${end} — it's final. Heap shrinks to size ${end}; the new root may violate the heap, so sift it down.`,
        codeLine: 5,
      });
      siftDown(0, end, 6);
    }
    sorted.add(0);
    steps.push({
      state: mk(),
      description: 'Sorted! n extract-max operations at O(log n) each: O(n log n) total, in place.',
      codeLine: 6,
    });
    return steps;
  },
};

export const sortingAlgos = [quickSort, mergeSort, heapSort];
