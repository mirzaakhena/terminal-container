import { views } from '../views';
import { LogoMark } from './icons';

interface Props {
  viewId: string;
  onViewChange(id: string): void;
}

export function Header({ viewId, onViewChange }: Props) {
  return (
    <header className="header">
      <div className="brand">
        <LogoMark />
        <span>PortTrack</span>
      </div>
      {views.length > 1 && (
        <nav className="view-tabs card" aria-label="Views">
          {views.map((v) => (
            <button key={v.id} className={v.id === viewId ? 'active' : ''} onClick={() => onViewChange(v.id)}>
              {v.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
