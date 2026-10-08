import { useEffect, useState, type FormEvent } from 'react';
import { views } from '../views';
import { yard, yardStore } from '../views/YardView';
import { select } from './dashboard/selection';
import { blockStats } from './dashboard/yardStats';
import { BellIcon, CheckIcon, ChevronDownIcon, LogoMark, SearchIcon } from './icons';
import { eventStore, markEventsRead } from './dashboard/events';
import { yardClock } from './dashboard/yardStats';
import { usePopover } from './usePopover';

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

/** The yard's blocks; the dashboard is about the marked one. One block for now. */
function SitePicker({ fill, teu, capacity, onPick }: { fill: number; teu: number; capacity: number; onPick(): void }) {
  const pop = usePopover<HTMLDivElement>();
  const blocks = [{ code: 'CY-01', name: 'Block A', crane: 'RTG-01', fill, teu, capacity, current: true }];
  return (
    <div className="popover-anchor" ref={pop.ref}>
      <button className="site-picker card" title="Terminal and block" aria-haspopup="listbox" aria-expanded={pop.open} onClick={pop.toggle}>
        <span className="site-code">CY-01</span>
        <span className="site-text">
          <strong>Block A · RTG-01</strong>
          <span>{Math.round(fill * 100)}% full · {teu}/{capacity} TEU</span>
        </span>
        <ChevronDownIcon />
      </button>
      {pop.open && (
        <div className="popover card" role="listbox" aria-label="Blocks">
          <div className="popover-title">Container yard · blocks</div>
          {blocks.map((b) => (
            <button
              key={b.code}
              role="option"
              aria-selected={b.current}
              className={b.current ? 'popover-row current' : 'popover-row'}
              onClick={() => { onPick(); pop.close(); }}
            >
              <span className="site-code">{b.code}</span>
              <span className="site-text">
                <strong>{b.name} · {b.crane}</strong>
                <span>{Math.round(b.fill * 100)}% full · {b.teu}/{b.capacity} TEU</span>
              </span>
              {b.current && <span className="current-mark"><CheckIcon /> Current</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The bell: recent job events, newest first; the red dot means some have not been seen. */
function Notifications() {
  const { events, unread } = eventStore.use();
  const pop = usePopover<HTMLDivElement>(markEventsRead);
  return (
    <div className="popover-anchor" ref={pop.ref}>
      <button className="icon-button card" aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'} aria-expanded={pop.open} onClick={pop.toggle}>
        <BellIcon />
        {unread > 0 && <span className="badge-dot" data-testid="unread-dot" />}
      </button>
      {pop.open && (
        <div className="popover card notifications" role="dialog" aria-label="Notifications">
          <div className="popover-title">Notifications</div>
          {events.length === 0 ? (
            <div className="hint">Nothing yet. Finished, stopped and refused jobs show up here.</div>
          ) : (
            <ul>
              {events.map((e) => (
                <li key={e.key} className={`event ${e.status}`}>
                  <span className="event-dot" />
                  <span className="event-text">{e.text}</span>
                  <span className="event-time">{yardClock(e.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
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
        <SitePicker fill={stats.fill} teu={stats.teu} capacity={stats.capacityTeu} onPick={() => onViewChange('yard')} />
        <div className="live card"><span className="dot" /> Live {clock}</div>
        <Notifications />
        <div className="user card">
          <span className="avatar">YP</span>
          <span className="user-text"><strong>Yard Planner</strong><span>Operations</span></span>
        </div>
      </div>
    </header>
  );
}
