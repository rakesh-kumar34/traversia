// ---------- Visualization states ----------

/** A pointer/label attached to an array index (e.g. L, R, mid, i, j). */
export interface ArrayPointer {
  label: string;
  index: number;
  color?: string;
}

export interface ArrayState {
  kind: 'array';
  values: number[];
  pointers?: ArrayPointer[];
  /** index -> highlight role */
  highlights?: Record<number, HighlightRole>;
  /** inclusive range rendered as the active window/subarray */
  window?: [number, number];
  /** optional second array shown below (e.g. merge output) */
  aux?: { label: string; values: (number | null)[] };
  /** free-form annotation shown above the array */
  note?: string;
}

export type HighlightRole =
  | 'active' // currently being examined
  | 'compare' // being compared
  | 'found' // success / final answer
  | 'done' // sorted / finalized
  | 'discard' // eliminated from consideration
  | 'pivot';

export type NodeStatus = 'unvisited' | 'frontier' | 'current' | 'visited';

export interface GraphNode {
  id: string;
  x: number; // 0..100 layout coordinates
  y: number; // 0..100
  status?: NodeStatus;
  /** small label under the node, e.g. distance */
  sub?: string;
}

export type EdgeStatus = 'idle' | 'active' | 'included' | 'rejected';

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  status?: EdgeStatus;
}

export interface GraphState {
  kind: 'graph';
  nodes: GraphNode[];
  edges: GraphEdge[];
  note?: string;
}

export interface TableCell {
  value: string | number | null;
  role?: HighlightRole;
}

export interface TableState {
  kind: 'table';
  rows: TableCell[][];
  rowLabels?: string[];
  colLabels?: string[];
  note?: string;
}

export type VizState = ArrayState | GraphState | TableState;

// ---------- Steps & quizzes ----------

export interface Quiz {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Step {
  state: VizState;
  description: string;
  /** 0-based line of the pseudocode to highlight */
  codeLine?: number;
  /** if present, playback pauses and the user must answer before this step is applied */
  quiz?: Quiz;
}

// ---------- Algorithm module ----------

export type Category = 'Arrays' | 'Sorting & Heaps' | 'Graphs & Trees' | 'Dynamic Programming';

export interface AlgoModule {
  id: string;
  name: string;
  category: Category;
  tagline: string;
  pseudocode: string[];
  complexity: { time: string; space: string };
  interviewTips: string[];
  /** builds the full step sequence for one run */
  generateSteps: () => Step[];
}
