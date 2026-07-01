import { useState } from 'react';
import type { AlgoModule } from './types';
import Home from './components/Home';
import Player from './components/Player';
import './App.css';

export default function App() {
  const [algo, setAlgo] = useState<AlgoModule | null>(null);
  return algo ? (
    <Player key={algo.id} algo={algo} onBack={() => setAlgo(null)} />
  ) : (
    <Home onPick={setAlgo} />
  );
}
