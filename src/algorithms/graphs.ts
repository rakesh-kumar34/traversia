import type { AlgoModule, Step, GraphState, GraphNode, GraphEdge, NodeStatus, EdgeStatus, TableCell } from '../types';

// ---------- shared helpers ----------

interface GraphDef {
  nodes: { id: string; x: number; y: number }[];
  edges: { from: string; to: string; weight?: number; directed?: boolean }[];
}

function snapshot(
  def: GraphDef,
  nodeStatus: Record<string, NodeStatus>,
  edgeStatus: Record<number, EdgeStatus>,
  subs: Record<string, string>,
  note?: string,
): GraphState {
  return {
    kind: 'graph',
    note,
    nodes: def.nodes.map((n): GraphNode => ({ ...n, status: nodeStatus[n.id] ?? 'unvisited', sub: subs[n.id] })),
    edges: def.edges.map((e, i): GraphEdge => ({ ...e, status: edgeStatus[i] ?? 'idle' })),
  };
}

const BASIC_GRAPH: GraphDef = {
  nodes: [
    { id: 'A', x: 15, y: 20 },
    { id: 'B', x: 40, y: 12 },
    { id: 'C', x: 40, y: 45 },
    { id: 'D', x: 65, y: 20 },
    { id: 'E', x: 65, y: 55 },
    { id: 'F', x: 88, y: 35 },
    { id: 'G', x: 15, y: 60 },
    { id: 'H', x: 40, y: 80 },
  ],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'A', to: 'G' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'F' },
    { from: 'E', to: 'F' },
    { from: 'E', to: 'H' },
    { from: 'G', to: 'H' },
  ],
};

function neighbors(def: GraphDef, id: string): { other: string; edgeIdx: number }[] {
  const out: { other: string; edgeIdx: number }[] = [];
  def.edges.forEach((e, i) => {
    if (e.from === id) out.push({ other: e.to, edgeIdx: i });
    else if (!e.directed && e.to === id) out.push({ other: e.from, edgeIdx: i });
  });
  return out.sort((a, b) => a.other.localeCompare(b.other));
}

// ---------- BFS ----------

export const bfs: AlgoModule = {
  id: 'bfs',
  name: 'Breadth-First Search',
  category: 'Graphs & Trees',
  tagline: 'Explore level by level with a queue',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  pseudocode: [
    'queue = [start]; visited = {start}',
    'while queue not empty:',
    '  node = queue.popFront()',
    '  process(node)',
    '  for each neighbor of node:',
    '    if neighbor not visited:',
    '      mark visited',
    '      queue.pushBack(neighbor)',
  ],
  interviewTips: [
    'BFS finds SHORTEST paths in unweighted graphs — that is its superpower over DFS.',
    'Mark nodes visited when you ENQUEUE them, not when you dequeue — otherwise nodes get queued twice.',
    'Grid problems ("rotting oranges", "walls and gates") are BFS in disguise; multi-source BFS starts with several nodes in the queue.',
    'Level-order = BFS where you process the queue one full level at a time (track queue size per level).',
  ],
  generateSteps: () => {
    const def = BASIC_GRAPH;
    const steps: Step[] = [];
    const ns: Record<string, NodeStatus> = {};
    const es: Record<number, EdgeStatus> = {};
    const dist: Record<string, string> = {};
    const queue: string[] = ['A'];
    const visited = new Set(['A']);
    const d: Record<string, number> = { A: 0 };
    ns['A'] = 'frontier';
    dist['A'] = 'd=0';

    const qNote = () => `queue: [${queue.join(', ')}]`;
    steps.push({
      state: snapshot(def, ns, es, dist, qNote()),
      description: 'BFS from A. The queue holds the frontier; nodes come out in the order they went in (FIFO), so we sweep outward level by level.',
      codeLine: 0,
    });

    let quizzed = false;
    while (queue.length) {
      const node = queue.shift()!;
      ns[node] = 'current';
      steps.push({
        state: snapshot(def, ns, es, dist, qNote()),
        description: `Dequeue ${node} (distance ${d[node]}) and process it.`,
        codeLine: 2,
        quiz:
          !quizzed && queue.length >= 2
            ? ((quizzed = true),
              {
                prompt: `The queue is [${node}, ${queue.join(', ')}]. Which node does BFS process next, and why?`,
                options: [
                  `${node} — the queue is FIFO, oldest first`,
                  `${queue[queue.length - 1]} — most recently added first`,
                  'Whichever has the most neighbors',
                ],
                answerIndex: 0,
                explanation: `BFS uses a FIFO queue: ${node} was enqueued earliest, so it is processed before deeper nodes. This is exactly what guarantees level-by-level order.`,
              })
            : undefined,
      });
      const newly: string[] = [];
      for (const { other, edgeIdx } of neighbors(def, node)) {
        if (!visited.has(other)) {
          visited.add(other);
          d[other] = d[node] + 1;
          dist[other] = `d=${d[other]}`;
          ns[other] = 'frontier';
          es[edgeIdx] = 'included';
          queue.push(other);
          newly.push(other);
        }
      }
      if (newly.length) {
        steps.push({
          state: snapshot(def, ns, es, dist, qNote()),
          description: `Enqueue unvisited neighbors of ${node}: ${newly.join(', ')} — each at distance ${d[node] + 1}.`,
          codeLine: 7,
        });
      }
      ns[node] = 'visited';
    }
    steps.push({
      state: snapshot(def, ns, es, dist, 'queue: []'),
      description: 'Queue empty — every reachable node visited exactly once. The d-labels are shortest path lengths from A, and the green edges form a BFS tree.',
      codeLine: 1,
    });
    return steps;
  },
};

// ---------- DFS ----------

export const dfs: AlgoModule = {
  id: 'dfs',
  name: 'Depth-First Search',
  category: 'Graphs & Trees',
  tagline: 'Dive deep first, backtrack when stuck',
  complexity: { time: 'O(V + E)', space: 'O(V) stack' },
  pseudocode: [
    'dfs(node):',
    '  mark node visited',
    '  process(node)',
    '  for each neighbor of node:',
    '    if neighbor not visited:',
    '      dfs(neighbor)',
    '  # all neighbors done → backtrack',
  ],
  interviewTips: [
    'DFS does NOT find shortest paths — a classic trap. Use it for reachability, connectivity, cycles, and ordering.',
    'The recursion stack IS the current path from the start — useful for backtracking problems and cycle detection.',
    'Cycle detection in directed graphs needs THREE colors (unvisited / in-progress / done); a back edge to an in-progress node means a cycle.',
    'Iterative DFS with an explicit stack matters when recursion depth could blow the call stack.',
  ],
  generateSteps: () => {
    const def = BASIC_GRAPH;
    const steps: Step[] = [];
    const ns: Record<string, NodeStatus> = {};
    const es: Record<number, EdgeStatus> = {};
    const visited = new Set<string>();
    const stack: string[] = [];
    const sNote = () => `call stack: [${stack.join(' → ')}]`;

    steps.push({
      state: snapshot(def, ns, es, {}, 'call stack: []'),
      description: 'DFS from A. We follow one path as deep as it goes, and only backtrack when a node has no unvisited neighbors.',
      codeLine: 0,
    });

    let quizzed = false;
    const visit = (node: string) => {
      visited.add(node);
      stack.push(node);
      ns[node] = 'current';
      steps.push({
        state: snapshot(def, ns, es, {}, sNote()),
        description: `Visit ${node} — push it onto the path. Now try its neighbors in order.`,
        codeLine: 1,
      });
      for (const { other, edgeIdx } of neighbors(def, node)) {
        if (!visited.has(other)) {
          es[edgeIdx] = 'included';
          if (!quizzed && stack.length === 3) {
            quizzed = true;
            steps.push({
              state: snapshot(def, ns, es, {}, sNote()),
              description: `From ${node}, the first unvisited neighbor is ${other}.`,
              codeLine: 4,
              quiz: {
                prompt: `We are at ${node} with unvisited neighbor ${other}. What does DFS do — and how does that differ from BFS?`,
                options: [
                  `Immediately dive into ${other}; BFS would instead finish all nodes at the current level first`,
                  `Add ${other} to the back of a queue and continue with ${node}'s other neighbors`,
                  'Visit the neighbor with the smallest label across the whole graph',
                ],
                answerIndex: 0,
                explanation:
                  'DFS recurses immediately — depth before breadth. BFS would enqueue the neighbor and keep sweeping the current level.',
              },
            });
          }
          ns[node] = 'visited';
          visit(other);
          ns[node] = 'current';
          steps.push({
            state: snapshot(def, ns, es, {}, sNote()),
            description: `Backtracked to ${node} — continue with its remaining neighbors.`,
            codeLine: 3,
          });
        }
      }
      stack.pop();
      ns[node] = 'visited';
      steps.push({
        state: snapshot(def, ns, es, {}, sNote()),
        description: `${node} has no unvisited neighbors left → done, pop it off the path.`,
        codeLine: 6,
      });
    };
    visit('A');
    steps.push({
      state: snapshot(def, ns, es, {}, 'call stack: []'),
      description: 'DFS complete. Every node and edge was examined once: O(V + E). The green edges form the DFS tree.',
      codeLine: 6,
    });
    return steps;
  },
};

// ---------- Dijkstra ----------

export const dijkstra: AlgoModule = {
  id: 'dijkstra',
  name: "Dijkstra's Shortest Path",
  category: 'Graphs & Trees',
  tagline: 'Greedily settle the closest unvisited node',
  complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
  pseudocode: [
    'dist[start] = 0, all others = ∞',
    'PQ = min-heap of (dist, node)',
    'while PQ not empty:',
    '  u = pop node with smallest dist',
    '  if u already settled: skip',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w  # relax',
    '      push (dist[v], v)',
  ],
  interviewTips: [
    'Dijkstra fails with negative edge weights — once a node is settled it is never revisited. Use Bellman-Ford there.',
    'Why greedy works: the closest unsettled node cannot be improved, because any other route passes through nodes at least as far.',
    'Lazy deletion (push duplicates, skip stale pops) is simpler than a decrease-key heap and what you should code in interviews.',
    'A* is Dijkstra plus an admissible heuristic; BFS is Dijkstra when all weights are 1.',
  ],
  generateSteps: () => {
    const def: GraphDef = {
      nodes: [
        { id: 'A', x: 10, y: 50 },
        { id: 'B', x: 35, y: 18 },
        { id: 'C', x: 35, y: 82 },
        { id: 'D', x: 62, y: 18 },
        { id: 'E', x: 62, y: 82 },
        { id: 'F', x: 88, y: 50 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'C', weight: 2 },
        { from: 'B', to: 'C', weight: 1 },
        { from: 'B', to: 'D', weight: 5 },
        { from: 'C', to: 'E', weight: 8 },
        { from: 'D', to: 'E', weight: 2 },
        { from: 'D', to: 'F', weight: 6 },
        { from: 'E', to: 'F', weight: 3 },
      ],
    };
    const steps: Step[] = [];
    const ns: Record<string, NodeStatus> = {};
    const es: Record<number, EdgeStatus> = {};
    const dist: Record<string, number> = {};
    const settled = new Set<string>();
    def.nodes.forEach((n) => (dist[n.id] = Infinity));
    dist['A'] = 0;
    const subs = () =>
      Object.fromEntries(def.nodes.map((n) => [n.id, dist[n.id] === Infinity ? '∞' : String(dist[n.id])]));

    steps.push({
      state: snapshot(def, { A: 'frontier' }, es, subs(), 'source: A'),
      description: 'Dijkstra from A. Every node starts at distance ∞ except the source at 0. We repeatedly settle the closest unsettled node.',
      codeLine: 0,
    });

    let quizzed = 0;
    for (;;) {
      let u = '';
      let best = Infinity;
      for (const n of def.nodes) {
        if (!settled.has(n.id) && dist[n.id] < best) {
          best = dist[n.id];
          u = n.id;
        }
      }
      if (!u) break;
      settled.add(u);
      ns[u] = 'current';
      const candidates = def.nodes.filter((n) => !settled.has(n.id) && dist[n.id] < Infinity);
      steps.push({
        state: snapshot(def, ns, es, subs(), `settled: {${[...settled].join(', ')}}`),
        description: `Pop ${u} (dist ${dist[u]}) — the smallest tentative distance. ${u} is now SETTLED: no shorter route to it can ever appear.`,
        codeLine: 3,
        quiz:
          quizzed === 0 && settled.size === 2
            ? ((quizzed = 1),
              {
                prompt: `Unsettled distances: ${candidates.concat([{ id: u, x: 0, y: 0 }]).filter((n) => n.id !== u).map((n) => `${n.id}=${dist[n.id]}`).join(', ')}, ${u}=${dist[u]}. Why does Dijkstra settle ${u} now?`,
                options: [
                  `${u} has the smallest tentative distance — no other path could reach it more cheaply`,
                  'It was discovered first (FIFO order)',
                  'It has the fewest outgoing edges',
                ],
                answerIndex: 0,
                explanation:
                  'Greedy choice: any alternative path to the closest node would have to pass through a node that is already farther away — impossible with non-negative weights.',
              })
            : undefined,
      });
      for (const { other, edgeIdx } of neighbors(def, u)) {
        if (settled.has(other)) continue;
        const w = def.edges[edgeIdx].weight!;
        const nd = dist[u] + w;
        es[edgeIdx] = 'active';
        const improves = nd < dist[other];
        const old = dist[other];
        steps.push({
          state: snapshot(def, ns, es, subs(), `relaxing edge ${u}–${other} (w=${w})`),
          description: `Relax ${u}→${other}: ${dist[u]} + ${w} = ${nd} vs current ${old === Infinity ? '∞' : old}. ${improves ? 'Better → update!' : 'Not better → keep current.'}`,
          codeLine: 6,
          quiz:
            quizzed === 1 && improves && old !== Infinity
              ? ((quizzed = 2),
                {
                  prompt: `${other} currently has dist ${old}, but going through ${u} costs ${dist[u]} + ${w} = ${nd}. What happens?`,
                  options: [
                    `Update dist[${other}] to ${nd} — we found a shorter route`,
                    `Keep ${old} — first assigned value wins`,
                    `${other} becomes settled immediately`,
                  ],
                  answerIndex: 0,
                  explanation: `This is "relaxation": whenever a new path is shorter than the best known, we update. ${other} stays unsettled — an even better path might still appear.`,
                })
              : undefined,
        });
        if (improves) {
          dist[other] = nd;
          ns[other] = 'frontier';
          steps.push({
            state: snapshot(def, ns, es, subs(), `dist[${other}] ← ${nd}`),
            description: `Updated: dist[${other}] = ${nd}.`,
            codeLine: 7,
          });
        }
        es[edgeIdx] = 'idle';
      }
      ns[u] = 'visited';
    }
    steps.push({
      state: snapshot(def, ns, es, subs(), 'all nodes settled'),
      description: 'Done — every label is the true shortest distance from A. With a binary heap this runs in O((V+E) log V).',
      codeLine: 2,
    });
    return steps;
  },
};

// ---------- Topological sort (Kahn) ----------

export const topoSort: AlgoModule = {
  id: 'topo-sort',
  name: "Topological Sort (Kahn's)",
  category: 'Graphs & Trees',
  tagline: 'Peel off nodes with no remaining prerequisites',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  pseudocode: [
    'compute in-degree of every node',
    'queue = all nodes with in-degree 0',
    'while queue not empty:',
    '  u = queue.pop()',
    '  append u to order',
    '  for each edge u → v:',
    '    in-degree[v] -= 1',
    '    if in-degree[v] == 0: queue.push(v)',
    'if order misses nodes → cycle!',
  ],
  interviewTips: [
    'The canonical framing is "course schedule": can you finish all courses given prerequisites, and in what order?',
    'Kahn\'s algorithm doubles as cycle detection: if the final order has fewer than V nodes, a cycle blocked the rest.',
    'The alternative is DFS finish-time order reversed — know both, and that multiple valid orders can exist.',
    'Real-world tie-ins for senior interviews: build systems, dependency resolution, task scheduling.',
  ],
  generateSteps: () => {
    const def: GraphDef = {
      nodes: [
        { id: 'A', x: 12, y: 25 },
        { id: 'B', x: 12, y: 75 },
        { id: 'C', x: 40, y: 50 },
        { id: 'D', x: 65, y: 25 },
        { id: 'E', x: 65, y: 75 },
        { id: 'F', x: 90, y: 50 },
      ],
      edges: [
        { from: 'A', to: 'C', directed: true },
        { from: 'B', to: 'C', directed: true },
        { from: 'B', to: 'E', directed: true },
        { from: 'C', to: 'D', directed: true },
        { from: 'C', to: 'E', directed: true },
        { from: 'D', to: 'F', directed: true },
        { from: 'E', to: 'F', directed: true },
      ],
    };
    const steps: Step[] = [];
    const ns: Record<string, NodeStatus> = {};
    const es: Record<number, EdgeStatus> = {};
    const indeg: Record<string, number> = {};
    def.nodes.forEach((n) => (indeg[n.id] = 0));
    def.edges.forEach((e) => indeg[e.to]++);
    const subs = () => Object.fromEntries(def.nodes.map((n) => [n.id, `in:${indeg[n.id]}`]));
    const order: string[] = [];
    const queue = def.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
    queue.forEach((q) => (ns[q] = 'frontier'));

    steps.push({
      state: snapshot(def, ns, es, subs(), `order: [] · queue: [${queue.join(', ')}]`),
      description: 'Think of edges as prerequisites (A→C means "A before C"). Nodes with in-degree 0 have no pending prerequisites — they can go first.',
      codeLine: 1,
      quiz: {
        prompt: 'Which nodes can start the topological order?',
        options: ['A and B — their in-degree is 0', 'F — it has no outgoing edges', 'C — it is in the middle'],
        answerIndex: 0,
        explanation: 'Only nodes with no incoming edges (no unmet prerequisites) may appear first. Here that is A and B.',
      },
    });

    let quizzed = false;
    while (queue.length) {
      const u = queue.shift()!;
      order.push(u);
      ns[u] = 'current';
      steps.push({
        state: snapshot(def, ns, es, subs(), `order: [${order.join(', ')}] · queue: [${queue.join(', ')}]`),
        description: `Take ${u} from the queue and append it to the order.`,
        codeLine: 4,
      });
      def.edges.forEach((e, i) => {
        if (e.from !== u) return;
        indeg[e.to]--;
        es[i] = 'rejected';
        const freed = indeg[e.to] === 0;
        if (freed) {
          queue.push(e.to);
          ns[e.to] = 'frontier';
        }
        steps.push({
          state: snapshot(def, ns, es, subs(), `order: [${order.join(', ')}] · queue: [${queue.join(', ')}]`),
          description: `Remove edge ${u}→${e.to}: in-degree of ${e.to} drops to ${indeg[e.to]}.${freed ? ` All prerequisites of ${e.to} are met → enqueue it!` : ''}`,
          codeLine: freed ? 7 : 6,
          quiz:
            !quizzed && freed
              ? ((quizzed = true),
                {
                  prompt: `${e.to}'s in-degree just hit 0. What does that mean?`,
                  options: [
                    `Every prerequisite of ${e.to} is already in the order — ${e.to} is ready to be scheduled`,
                    `${e.to} is unreachable and gets skipped`,
                    `${e.to} must be the last node in the order`,
                  ],
                  answerIndex: 0,
                  explanation: 'In-degree counts unprocessed prerequisites. Zero means everything it depends on is done, so it joins the ready queue.',
                })
              : undefined,
        });
      });
      ns[u] = 'visited';
    }
    steps.push({
      state: snapshot(def, ns, es, subs(), `order: [${order.join(', ')}]`),
      description: `All ${order.length} nodes processed → valid topological order found (a cycle would have starved the queue early). Every edge points forward in this order.`,
      codeLine: 8,
    });
    return steps;
  },
};

// ---------- Kruskal ----------

export const kruskal: AlgoModule = {
  id: 'kruskal',
  name: "Kruskal's MST",
  category: 'Graphs & Trees',
  tagline: 'Cheapest edges first, skip anything that makes a cycle',
  complexity: { time: 'O(E log E)', space: 'O(V)' },
  pseudocode: [
    'sort edges by weight ascending',
    'each node starts in its own set (union-find)',
    'for each edge (u, v) in order:',
    '  if find(u) != find(v):   # different trees',
    '    add edge to MST',
    '    union(u, v)',
    '  else: skip  # would create a cycle',
    'stop after V-1 edges',
  ],
  interviewTips: [
    'Kruskal = sorting + union-find. If you can\'t code union-find with path compression + union by rank, practice it.',
    'Why greedy is safe (cut property): the cheapest edge crossing any cut between two components is always in some MST.',
    "Prim's grows one tree with a heap; Kruskal merges a forest. Kruskal shines on sparse graphs / pre-sorted edges.",
    'Union-find alone is a frequent interview topic: number of islands II, accounts merge, redundant connection.',
  ],
  generateSteps: () => {
    const def: GraphDef = {
      nodes: [
        { id: 'A', x: 15, y: 22 },
        { id: 'B', x: 50, y: 10 },
        { id: 'C', x: 85, y: 22 },
        { id: 'D', x: 15, y: 78 },
        { id: 'E', x: 50, y: 90 },
        { id: 'F', x: 85, y: 78 },
      ],
      edges: [
        { from: 'D', to: 'E', weight: 1 },
        { from: 'B', to: 'E', weight: 2 },
        { from: 'C', to: 'F', weight: 3 },
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'D', weight: 5 },
        { from: 'B', to: 'C', weight: 6 },
        { from: 'E', to: 'F', weight: 7 },
      ],
    };
    const steps: Step[] = [];
    const es: Record<number, EdgeStatus> = {};
    const parent: Record<string, string> = {};
    def.nodes.forEach((n) => (parent[n.id] = n.id));
    const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const comps = () => {
      const groups: Record<string, string[]> = {};
      def.nodes.forEach((n) => {
        const r = find(n.id);
        (groups[r] ??= []).push(n.id);
      });
      return Object.values(groups)
        .map((g) => `{${g.join(',')}}`)
        .join(' ');
    };

    steps.push({
      state: snapshot(def, {}, es, {}, `components: ${comps()}`),
      description: 'Kruskal builds a Minimum Spanning Tree: connect all 6 nodes with minimum total weight. Edges are already sorted by weight: 1,2,3,4,5,6,7.',
      codeLine: 0,
    });

    let mstCount = 0;
    let total = 0;
    let quizzedReject = false;
    for (let i = 0; i < def.edges.length && mstCount < def.nodes.length - 1; i++) {
      const e = def.edges[i];
      es[i] = 'active';
      const ru = find(e.from);
      const rv = find(e.to);
      const cycle = ru === rv;
      steps.push({
        state: snapshot(def, {}, es, {}, `components: ${comps()}`),
        description: `Next cheapest edge: ${e.from}–${e.to} (w=${e.weight}). Are ${e.from} and ${e.to} already in the same component?`,
        codeLine: 3,
        quiz:
          cycle && !quizzedReject
            ? ((quizzedReject = true),
              {
                prompt: `Edge ${e.from}–${e.to} (w=${e.weight}): both endpoints are already in the same component. What does Kruskal do?`,
                options: [
                  'Reject the edge — adding it would create a cycle',
                  'Add it anyway — it is the cheapest remaining edge',
                  'Remove a heavier edge to make room for it',
                ],
                answerIndex: 0,
                explanation:
                  'A spanning tree has no cycles. If find(u) == find(v), a path between them already exists, so this edge is redundant — skip it.',
              })
            : undefined,
      });
      if (cycle) {
        es[i] = 'rejected';
        steps.push({
          state: snapshot(def, {}, es, {}, `components: ${comps()}`),
          description: `Yes — ${e.from} and ${e.to} are already connected. Adding ${e.from}–${e.to} would create a cycle → REJECT.`,
          codeLine: 6,
        });
      } else {
        parent[ru] = rv;
        es[i] = 'included';
        mstCount++;
        total += e.weight!;
        steps.push({
          state: snapshot(def, {}, es, {}, `components: ${comps()} · MST weight: ${total}`),
          description: `Different components → ADD ${e.from}–${e.to} to the MST and union the two trees. (${mstCount}/${def.nodes.length - 1} edges)`,
          codeLine: 4,
        });
      }
    }
    steps.push({
      state: snapshot(def, {}, es, {}, `MST total weight: ${total}`),
      description: `V−1 = 5 edges chosen — the MST is complete with total weight ${total}. The skipped edge never got a look: we stopped early.`,
      codeLine: 7,
    });
    return steps;
  },
};

// ---------- Bellman-Ford ----------

export const bellmanFord: AlgoModule = {
  id: 'bellman-ford',
  name: 'Bellman-Ford',
  category: 'Graphs & Trees',
  tagline: 'Relax ALL edges, V−1 times — negatives welcome',
  complexity: { time: 'O(V · E)', space: 'O(V)' },
  pseudocode: [
    'dist[start] = 0, all others = ∞',
    'repeat V - 1 times:',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w',
    '  if nothing changed: stop early',
    'one more pass: if any edge still',
    '  relaxes → negative cycle!',
  ],
  interviewTips: [
    'Use Bellman-Ford when edges can be negative — the one thing Dijkstra cannot handle.',
    'Why V−1 passes? A shortest path has at most V−1 edges; each pass guarantees paths one edge longer are correct.',
    'A V-th pass that still improves something proves a negative cycle — the classic arbitrage-detection question.',
    '"Cheapest flights within K stops" is Bellman-Ford capped at K+1 passes (relax from a frozen copy).',
  ],
  generateSteps: () => {
    const def: GraphDef = {
      nodes: [
        { id: 'S', x: 8, y: 50 },
        { id: 'A', x: 40, y: 18 },
        { id: 'B', x: 40, y: 82 },
        { id: 'C', x: 72, y: 18 },
        { id: 'D', x: 72, y: 82 },
      ],
      edges: [
        { from: 'S', to: 'A', weight: 4, directed: true },
        { from: 'S', to: 'B', weight: 5, directed: true },
        { from: 'A', to: 'C', weight: 3, directed: true },
        { from: 'C', to: 'D', weight: 2, directed: true },
        { from: 'B', to: 'A', weight: -2, directed: true },
        { from: 'B', to: 'D', weight: 4, directed: true },
      ],
    };
    const steps: Step[] = [];
    const es: Record<number, EdgeStatus> = {};
    const dist: Record<string, number> = { S: 0, A: Infinity, B: Infinity, C: Infinity, D: Infinity };
    const subs = () =>
      Object.fromEntries(def.nodes.map((n) => [n.id, dist[n.id] === Infinity ? '∞' : String(dist[n.id])]));

    steps.push({
      state: snapshot(def, { S: 'current' }, es, subs(), 'note the NEGATIVE edge B→A (−2)'),
      description: 'Bellman-Ford from S. This graph has a negative edge (B→A, weight −2) — Dijkstra would get this wrong, Bellman-Ford handles it.',
      codeLine: 0,
    });

    let quizzed = false;
    for (let pass = 1; pass < def.nodes.length; pass++) {
      let changed = false;
      steps.push({
        state: snapshot(def, {}, {}, subs(), `pass ${pass} of at most ${def.nodes.length - 1}`),
        description: `Pass ${pass}: relax every edge in order. After pass k, all shortest paths using ≤ k edges are correct.`,
        codeLine: 1,
      });
      def.edges.forEach((e, i) => {
        const nd = dist[e.from] + e.weight!;
        const improves = dist[e.from] !== Infinity && nd < dist[e.to];
        es[i] = 'active';
        if (improves) {
          const old = dist[e.to];
          dist[e.to] = nd;
          changed = true;
          steps.push({
            state: snapshot(def, {}, es, subs(), `pass ${pass}`),
            description: `Relax ${e.from}→${e.to} (w=${e.weight}): ${dist[e.from]} + ${e.weight} = ${nd} beats ${old === Infinity ? '∞' : old} → dist[${e.to}] = ${nd}.`,
            codeLine: 4,
            quiz:
              !quizzed && e.weight! < 0
                ? ((quizzed = true),
                  {
                    prompt: `Edge B→A has weight −2 and dist[B] = ${dist[e.from]}. Path S→B→A costs ${dist[e.from]} + (−2) = ${nd}, but dist[A] is already ${old}. What happens?`,
                    options: [
                      `dist[A] improves to ${nd} — the "longer" route is cheaper thanks to the negative edge`,
                      `Keep ${old} — A was reached first via the direct edge`,
                      'Negative edges are ignored',
                    ],
                    answerIndex: 0,
                    explanation:
                      'This is exactly why Dijkstra fails with negative weights: the direct S→A route (4) is NOT optimal. Bellman-Ford keeps relaxing and finds S→B→A = 3.',
                  })
                : undefined,
          });
        }
        es[i] = 'idle';
      });
      if (!changed) {
        steps.push({
          state: snapshot(def, {}, {}, subs(), `pass ${pass}: no changes`),
          description: `Pass ${pass} changed nothing → distances have converged. Stop early.`,
          codeLine: 5,
        });
        break;
      }
      steps.push({
        state: snapshot(def, {}, {}, subs(), `after pass ${pass}`),
        description: `End of pass ${pass}. ${changed ? 'Some distances improved — another pass is needed.' : ''}`,
        codeLine: 1,
      });
    }
    steps.push({
      state: snapshot(def, {}, {}, subs(), 'final shortest distances from S'),
      description: 'Converged: S→A is 3 (via B!), S→C is 6, S→D is 8. A verification pass with any further improvement would have signaled a negative cycle.',
      codeLine: 6,
    });
    return steps;
  },
};

// ---------- Floyd-Warshall ----------

export const floydWarshall: AlgoModule = {
  id: 'floyd-warshall',
  name: 'Floyd-Warshall',
  category: 'Graphs & Trees',
  tagline: 'All-pairs shortest paths with one triple loop',
  complexity: { time: 'O(V³)', space: 'O(V²)' },
  pseudocode: [
    'dist = adjacency matrix (∞ if no edge)',
    'for k in 1..V:      # allowed via-node',
    '  for i in 1..V:',
    '    for j in 1..V:',
    '      if dist[i][k] + dist[k][j] < dist[i][j]:',
    '        dist[i][j] = dist[i][k] + dist[k][j]',
    '# after k, paths may use nodes {1..k}',
  ],
  interviewTips: [
    'The DP insight: after iteration k, dist[i][j] is the shortest path using only intermediate nodes from {1..k}.',
    'The k-loop MUST be outermost — a classic bug is putting it inside.',
    'Handles negative edges; a negative value on the diagonal (dist[i][i] < 0) reveals a negative cycle.',
    'Choose it for dense graphs or small V when you need ALL pairs; for one source, Dijkstra/Bellman-Ford wins.',
  ],
  generateSteps: () => {
    const V = 4;
    const INF = Infinity;
    const graphDef: GraphDef = {
      nodes: [
        { id: '1', x: 20, y: 20 },
        { id: '2', x: 20, y: 80 },
        { id: '3', x: 72, y: 20 },
        { id: '4', x: 72, y: 80 },
      ],
      edges: [
        { from: '1', to: '3', weight: -2, directed: true },
        { from: '2', to: '1', weight: 4, directed: true },
        { from: '2', to: '3', weight: 3, directed: true },
        { from: '3', to: '4', weight: 2, directed: true },
        { from: '4', to: '2', weight: -1, directed: true },
      ],
    };
    const d: number[][] = [...Array(V)].map((_, i) => [...Array(V)].map((_, j) => (i === j ? 0 : INF)));
    d[0][2] = -2;
    d[1][0] = 4;
    d[1][2] = 3;
    d[2][3] = 2;
    d[3][1] = -1;

    const labels = ['1', '2', '3', '4'];
    const table = (roles: Record<string, 'active' | 'found' | 'compare'> = {}, note?: string) => ({
      kind: 'table' as const,
      rows: d.map((row, i) =>
        row.map((v, j): TableCell => ({ value: v === INF ? '∞' : v, role: roles[`${i},${j}`] })),
      ),
      rowLabels: labels.map((l) => `from ${l}`),
      colLabels: labels.map((l) => `to ${l}`),
      note,
    });

    const steps: Step[] = [];
    steps.push({
      state: { kind: 'graph', ...graphDef, nodes: graphDef.nodes, edges: graphDef.edges.map((e) => ({ ...e })), note: 'the input graph (note the negative weights)' },
      description: 'Floyd-Warshall computes shortest paths between ALL pairs at once. Here is the graph — we now switch to its distance matrix.',
      codeLine: 0,
    });
    steps.push({
      state: table({}, 'initial matrix: direct edges only'),
      description: 'The matrix starts with direct edges: dist[i][j] = edge weight, 0 on the diagonal, ∞ where no direct edge exists.',
      codeLine: 0,
    });

    let quizzed = false;
    for (let k = 0; k < V; k++) {
      steps.push({
        state: table(
          Object.fromEntries([...Array(V)].flatMap((_, t) => [[`${k},${t}`, 'compare' as const], [`${t},${k}`, 'compare' as const]])),
          `k = ${labels[k]}: paths may now detour through node ${labels[k]}`,
        ),
        description: `Round k=${labels[k]}: for every pair (i, j), ask — is going i → ${labels[k]} → j shorter than the best known i → j?`,
        codeLine: 1,
      });
      for (let i = 0; i < V; i++) {
        for (let j = 0; j < V; j++) {
          if (d[i][k] + d[k][j] < d[i][j]) {
            const via = d[i][k] + d[k][j];
            const old = d[i][j];
            const quiz =
              !quizzed
                ? ((quizzed = true),
                  {
                    prompt: `dist[${labels[i]}][${labels[j]}] is ${old === INF ? '∞' : old}. Going via ${labels[k]} costs dist[${labels[i]}][${labels[k]}] + dist[${labels[k]}][${labels[j]}] = ${d[i][k]} + ${d[k][j]} = ${via}. What happens?`,
                    options: [
                      `Update the cell to ${via} — the detour through ${labels[k]} is shorter`,
                      'Keep it — detours never help',
                      'Mark the pair unreachable',
                    ],
                    answerIndex: 0,
                    explanation:
                      'That is the whole algorithm: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for every pair, for every allowed via-node k.',
                  })
                : undefined;
            d[i][j] = via;
            steps.push({
              state: table(
                { [`${i},${j}`]: 'found', [`${i},${k}`]: 'active', [`${k},${j}`]: 'active' },
                `k = ${labels[k]}`,
              ),
              description: `Improve (${labels[i]} → ${labels[j]}): via ${labels[k]} costs ${d[i][k]} + ${d[k][j]} = ${via}, better than ${old === INF ? '∞' : old}.`,
              codeLine: 5,
              quiz,
            });
          }
        }
      }
    }
    steps.push({
      state: table({}, 'final: shortest distances for every pair'),
      description: 'All rounds done — every cell now holds the true shortest distance between that pair. Three nested loops over V: O(V³).',
      codeLine: 6,
    });
    return steps;
  },
};

export const graphAlgos = [bfs, dfs, dijkstra, topoSort, kruskal, bellmanFord, floydWarshall];
