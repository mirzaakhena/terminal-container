import { useEffect, useState, type FormEvent } from 'react';
import { views } from '../views';
import { yard, yardStore } from '../views/YardView';
import { select } from './dashboard/selection';
import { blockStats } from './dashboard/yardStats';
import { BellIcon, ChevronDownIcon, LogoMark, SearchIcon } from './icons';

interface Props {
  viewId: string;
  onViewChange(id: string): void;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Finds a container by its number in the yard and shows it in the detail panel. */
function Search({ onFound }: { onFound(): void }) {
  const [q, setQ] = useState('');
  const [miss, setMiss] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const needle = q.trim().toUpperCase();
    if (!needle) return;
    const hit = Object.keys(yard.crane.world.block.containers).find((id) => id.includes(needle));
    setMiss(!hit);
    if (hit) {
      select({ kind: 'container', id: hit });
      onFound();
    }
  };
  return (
    <form className={miss ? 'search card miss' : 'search card'} onSubmit={submit} role="search">
      <SearchIcon />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setMiss(false); }}
        placeholder="Search containers, trucks, cranes…"
        aria-label="Search the yard by container number"
      />
      {miss ? <span className="search-miss">Not in the yard</span> : <kbd>/</kbd>}
    </form>
  );
}

export function Header({ viewId, onViewChange }: Props) {
  const clock = useClock();
  yardStore.use((s) => s.containers);
  const stats = blockStats(yard.crane.world.block);

  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.search input')?.focus();
      }
    };
    window.addEventListener('keydown', focus);
    return () => window.removeEventListener('keydown', focus);
  }, []);

  return (
    <header className="header">
      <div className="brand">
        <LogoMark />
        <span>PortTrack</span>
      </div>
      <nav className="view-tabs card" aria-label="Views">
        {views.map((v) => (
          <button key={v.id} className={v.id === viewId ? 'active' : ''} onClick={() => onViewChange(v.id)}>
            {v.label}
          </button>
        ))}
      </nav>
      <Search onFound={() => onViewChange('yard')} />
      <div className="header-right">
        <button className="site-picker card" title="Terminal and block">
          <span className="site-code">CY-01</span>
          <span className="site-text">
            <strong>Block A · RTG-01</strong>
            <span>{Math.round(stats.fill * 100)}% full · {stats.teu}/{stats.capacityTeu} TEU</span>
          </span>
          <ChevronDownIcon />
        </button>
        <div className="live card"><span className="dot" /> Live {clock}</div>
        <button className="icon-button card" aria-label="Notifications"><BellIcon /><span className="badge-dot" /></button>
        <div className="user card">
          <span className="avatar">YP</span>
          <span className="user-text"><strong>Yard Planner</strong><span>Operations</span></span>
        </div>
      </div>
    </header>
  );
}
