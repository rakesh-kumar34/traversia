import type { AlgoModule, Category } from '../types';
import { arrayAlgos } from './arrays';
import { sortingAlgos } from './sorting';
import { graphAlgos } from './graphs';
import { dpAlgos } from './dp';

export const ALL_ALGOS: AlgoModule[] = [...arrayAlgos, ...sortingAlgos, ...graphAlgos, ...dpAlgos];

export const CATEGORIES: Category[] = ['Arrays', 'Sorting & Heaps', 'Graphs & Trees', 'Dynamic Programming'];

export const CATEGORY_ICONS: Record<Category, string> = {
  Arrays: '🎯',
  'Sorting & Heaps': '📊',
  'Graphs & Trees': '🕸️',
  'Dynamic Programming': '🧩',
};
