import type { AlgoModule } from '../types';
import { ALL_ALGOS, CATEGORIES, CATEGORY_ICONS } from '../algorithms';
import { loadProgress } from '../progress';

export default function Home({ onPick }: { onPick: (algo: AlgoModule) => void }) {
  const progress = loadProgress();
  const completed = Object.keys(progress).length;

  return (
    <div className="home">
      <header className="home-header">
        <h1>
          Traver<span className="accent">sia</span>
        </h1>
        <p className="subtitle">
          Watch classic interview algorithms run step by step — and prove you can predict their next move.
        </p>
        <div className="home-progress">
          {completed}/{ALL_ALGOS.length} algorithms completed
          <div className="progress-track wide">
            <div className="progress-fill" style={{ width: `${(completed / ALL_ALGOS.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="category">
          <h2>
            <span className="cat-icon">{CATEGORY_ICONS[cat]}</span> {cat}
          </h2>
          <div className="algo-grid">
            {ALL_ALGOS.filter((a) => a.category === cat).map((a) => {
              const p = progress[a.id];
              return (
                <button key={a.id} className="algo-card" onClick={() => onPick(a)}>
                  <div className="algo-card-top">
                    <span className="algo-name">{a.name}</span>
                    {p && <span className="badge done-badge">✓</span>}
                  </div>
                  <span className="algo-tagline">{a.tagline}</span>
                  <div className="algo-card-bottom">
                    <span className="badge">{a.complexity.time}</span>
                    {p && <span className="best-score">best {p.bestScore} 🏆</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <footer className="home-footer">Answer the ⚡ checkpoints during playback to score points — streaks multiply.</footer>
    </div>
  );
}
