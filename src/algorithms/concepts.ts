/**
 * "Understand the idea" copy for each algorithm, keyed by AlgoModule id.
 * Merged onto modules in ./index.ts so authoring stays in one place.
 */
export const CONCEPTS: Record<string, string[]> = {
  'binary-search': [
    'Binary search is a bet on sortedness: because the array is ordered, one comparison against the middle element tells you which half the target CANNOT be in. Throwing away half the candidates per step turns a linear scan into a logarithmic one — a million elements need only ~20 comparisons.',
    'The invariant to hold onto: the target, if it exists, is always inside [L, R]. Every move of L or R must preserve that promise. Off-by-one bugs are what happens when a move breaks it — for example setting R = mid when you have already ruled mid out.',
    'The deeper interview skill is recognizing binary search where there is no array at all: any question of the form "find the smallest x where some monotonic condition flips from false to true" — ship capacities, eating speeds, days to bloom — is binary search on the answer space.',
  ],
  'two-pointers': [
    'With the array sorted, the pair (L, R) has a useful property: moving L right can only grow the sum, moving R left can only shrink it. So one comparison against the target tells you which pointer is "wasted" — and you can discard it forever.',
    'Why this is O(n) and not O(n²): each step permanently eliminates one element from consideration. You never revisit a discarded candidate, so the two pointers together sweep the array exactly once.',
    'The pattern generalizes wherever a sorted structure lets one comparison rule out a whole family of pairs: 3Sum (fix one, two-pointer the rest), container-with-most-water (the shorter wall can never do better), merging sorted sequences.',
  ],
  'sliding-window': [
    'The insight is overlap: window [1..3] and window [2..4] share all but two elements. Recomputing the whole window from scratch throws that shared work away; adjusting for the one element entering and the one leaving keeps it — turning O(n·k) into O(n).',
    'Fixed-size windows (like this one) are the training wheels. Real interview questions usually make the window size variable: grow the right edge while the window is valid, shrink the left edge while it is invalid, and record the best window seen. The invariant "the window is always valid after adjustment" is what makes those solutions correct.',
    'Ask yourself what state must be maintained incrementally as the window slides — a sum, a character count map, a max in a deque. Choosing that state is the whole problem; the two-pointer motion is boilerplate.',
  ],
  'quick-sort': [
    'Quicksort\'s engine is partition: pick a pivot, then rearrange so everything smaller sits left of it and everything bigger sits right. That single pass buys something permanent — the pivot lands in its final sorted position and never moves again. Sorting is then just partitioning the two sides, recursively.',
    'Its speed comes from doing the work in place with sequential memory access — no merging, no copying. The risk is pivot quality: a pivot that splits 50/50 gives log n levels of O(n) work; a pivot that always lands at an end (sorted input, fixed pivot choice) gives n levels and O(n²). Randomizing the pivot makes the bad case astronomically unlikely.',
    'Partition is worth knowing on its own: Quickselect uses it to find the k-th smallest element in O(n) average time by recursing into only ONE side — the side that contains the answer.',
  ],
  'merge-sort': [
    'Mergesort splits until pieces have size 1 — trivially sorted — then rebuilds order by merging: repeatedly taking the smaller front element of two sorted runs. All the intelligence lives in the merge; the recursion is just scaffolding that guarantees merge is only ever asked to combine already-sorted inputs.',
    'Its defining trade: guaranteed O(n log n) — the split is always exactly in half, so there are always log n levels of O(n) merging — but it needs O(n) scratch space to merge into. Quicksort gambles on pivots to avoid that memory; mergesort refuses to gamble.',
    'Stability falls out of one small choice: on ties, take from the LEFT run. Equal elements then keep their original order, which matters when sorting by one key after another. It is also the shape of external sorting — when data exceeds RAM, you sort chunks and merge sorted files.',
  ],
  'heap-sort': [
    'A binary heap is a complete binary tree flattened into an array — children of index i live at 2i+1 and 2i+2, so parent/child hops are arithmetic, not pointers. The max-heap property (every parent ≥ its children) is deliberately weak: it does not sort anything, it only promises the maximum is at index 0. Weak promises are cheap to maintain — that is the whole trick.',
    'siftDown repairs the property when a node might be too small for its position: swap it with its larger child until both children are smaller. Always the larger child — otherwise the smaller one would become parent of the bigger one and the property would break again one level down.',
    'Heapsort is then: build the heap, and n times swap the root (current max) to the back and siftDown the new root over the shrunken heap. In interviews the heap itself matters more than the sort — it is the machinery inside Dijkstra, top-K problems, and streaming medians.',
  ],
  bfs: [
    'BFS explores in expanding rings: everything at distance 1, then everything at distance 2, and so on. The FIFO queue enforces this — nodes discovered earlier are processed earlier, so a node at distance d is never processed before all nodes at distance d−1 are done.',
    'That ordering is exactly why BFS finds shortest paths in unweighted graphs: the first time you reach a node is via a minimum-hop route, because any shorter route would have been discovered in an earlier ring. This is the property DFS lacks entirely.',
    'Two details make implementations correct: mark nodes visited when ENQUEUED (not dequeued), or the same node enters the queue multiple times; and for level-by-level logic (binary tree level order, "minimum steps" puzzles), process the queue one full ring at a time by snapshotting its size.',
  ],
  dfs: [
    'DFS commits to one path and follows it until it dead-ends, then backtracks to the most recent junction with an untried branch. The recursion stack does the bookkeeping for free: at any moment, the stack IS the path from the start to the current node.',
    'That "current path" view is what makes DFS the tool for structural questions — does a cycle exist? (you re-entered a node still on the stack), what order do dependencies complete? (record nodes as their recursion finishes), which nodes form a connected component? It is NOT a shortest-path tool: the first route DFS finds is just the first it stumbled into.',
    'DFS is also the skeleton of backtracking: permutations, N-queens, word search are all "DFS over a tree of partial solutions", where backtracking = undoing the current choice when the subtree is exhausted.',
  ],
  dijkstra: [
    'Dijkstra maintains a frontier of tentative distances and repeatedly makes one irreversible commitment: the closest unsettled node is DONE — its tentative distance is its true distance. That greedy step is safe because any alternative path to it would have to travel through some other unsettled node that is already farther away, and with non-negative edges the detour can only add cost.',
    'Everything else is relaxation: when a node is settled, check whether routes through it improve its neighbors\' tentative distances. The min-heap exists to answer "which unsettled node is closest?" in O(log V) instead of a linear scan.',
    'The non-negativity assumption is where the algorithm lives or dies: one negative edge means "farther now" might become "cheaper later", the commitment becomes unsafe, and you need Bellman-Ford. Understanding WHY it breaks — not just that it breaks — is the senior-level answer.',
  ],
  'topo-sort': [
    'A topological order is any sequence where every edge points forward — dependencies before dependents. Kahn\'s algorithm builds it by induction: a node with in-degree 0 has no unmet prerequisites, so it can safely go next. Scheduling it "removes" its outgoing edges, which may free new nodes.',
    'The in-degree counter is the whole data structure: it tracks how many prerequisites remain unprocessed for each node. When a counter hits zero, that node joins the ready queue. Using a queue vs a stack just picks among the (possibly many) valid orders.',
    'Cycle detection comes free: a cycle\'s nodes all wait on each other, so none ever reaches in-degree 0, the queue starves, and the output ends up shorter than V. That is precisely the "can you finish all courses?" question.',
  ],
  kruskal: [
    'Kruskal builds a minimum spanning tree by considering edges from cheapest to most expensive, with one rule: take the edge unless its endpoints are already connected. Sorted order guarantees minimality; the rule guarantees a tree (no cycles).',
    'Why greedy is safe here (the cut property): for any way of splitting the nodes into two groups, the cheapest edge crossing the split belongs to some MST — a more expensive crossing edge could always be swapped for it. Every edge Kruskal accepts is the cheapest crossing between the components it joins.',
    'Union-find is what makes "already connected?" fast: each component is a set, find gives a set\'s representative, union merges two sets. With path compression and union by rank, those operations are effectively constant time — and union-find alone shows up in a whole family of interview problems.',
  ],
  'bellman-ford': [
    'Bellman-Ford makes no commitments — it just relaxes EVERY edge, over and over. The induction: after k full passes, every shortest path that uses at most k edges has been found. Since a shortest path in a graph with V nodes can use at most V−1 edges (more would revisit a node), V−1 passes suffice.',
    'This patience is what lets it absorb negative edges: a route that looks worse early ("go to B first, cost 5") can win later thanks to a negative hop (B→A at −2), and repeated relaxation eventually propagates the correction. If a pass changes nothing, distances have converged and you can stop early.',
    'One extra pass makes it a detector: if anything still improves after V−1 passes, some cycle has negative total weight and "shortest" is undefined — walk the loop forever, pay less each lap. That is the arbitrage question in currency-exchange form.',
  ],
  'floyd-warshall': [
    'Floyd-Warshall answers every pair at once by growing the set of allowed layover nodes. The DP state: after processing k, dist[i][j] is the shortest path that only detours through nodes {1..k}. Round k asks each pair one question — is i → k → j cheaper than the best i → j so far?',
    'The correctness hinge is that a shortest path through k splits into two shorter paths (i→k and k→j) that avoid k internally — and those were already optimal in the previous round. That is also why the k-loop must be OUTERMOST; burying it inside i/j updates cells with half-grown detour sets.',
    'Three nested loops over V give O(V³) with a tiny constant and no heaps or adjacency lists — great for dense graphs or small V. Negative edges are fine; a negative number appearing on the diagonal (a node cheaper-than-free to itself) exposes a negative cycle.',
  ],
  'fib-memo': [
    'Naive recursive Fibonacci is slow for exactly one reason: it solves the same subproblems again and again — fib(50) computes fib(3) hundreds of millions of times. Memoization attacks the duplication directly: cache each result the first time, return the cached value every time after. The call tree collapses from 2ⁿ nodes to n distinct computations.',
    'This is dynamic programming in its most honest form: DP = recursion + overlapping subproblems + a cache. The "optimal substructure" requirement just means the cached sub-answers are reusable regardless of who asks for them.',
    'Top-down (memoize the recursion) and bottom-up (fill a table from base cases) are two evaluation orders for the same recurrence. In interviews, deriving the brute-force recursion first and THEN adding the memo shows the thinking; jumping straight to a table looks memorized.',
  ],
  knapsack: [
    'The knapsack recurrence is one binary decision repeated: for each item, skip it (best value with the previous items at the same capacity) or take it (its value plus the best with the previous items at the REDUCED capacity). The table exists so each (items, capacity) combination is decided once.',
    'The state definition — dp[i][c] = best value using the first i items within capacity c — is the real interview deliverable. Once stated, the recurrence writes itself and the answer\'s location (all items, full capacity) is obvious. Most DP failures are fuzzy state definitions, not coding errors.',
    'Knapsack is a family, not a problem: subset-sum ("can we hit exactly c?"), partition-equal-subset, target-sum are the same table with a different cell type. The one-row space optimization must iterate capacity right-to-left — left-to-right lets one item be counted twice, which silently turns 0/1 knapsack into unbounded knapsack.',
  ],
  lis: [
    'The unlock is the state definition: dp[i] = length of the longest increasing subsequence that ENDS exactly at index i. "Ends at" makes the recurrence local — any earlier element smaller than arr[i] can hand its chain to i: dp[i] = 1 + max(dp[j]) over all j < i with arr[j] < arr[i].',
    'The final answer is max over all dp[i], not dp[n−1] — the best subsequence can end anywhere. And "subsequence" means order preserved but gaps allowed, which is exactly why each i must look back at ALL earlier indices: its best predecessor may be far away.',
    'The O(n log n) upgrade keeps a different state — tails[k] = the smallest possible ending value of an increasing subsequence of length k+1. That array stays sorted, so each element binary-searches its place. Explaining why tails stays sorted is a classic senior-level probe.',
  ],
};
