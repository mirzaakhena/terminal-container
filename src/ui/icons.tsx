const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PlusIcon = () => (
  <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = () => (
  <svg {...base}><path d="M5 12h14" /></svg>
);
export const RotateLeftIcon = () => (
  <svg {...base}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
);
export const RotateRightIcon = () => (
  <svg {...base}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></svg>
);
export const HomeIcon = () => (
  <svg {...base}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
);
export const GridIcon = () => (
  <svg {...base}><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
);
export const LogoMark = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 2 29 9v14l-13 7-13-7V9z" fill="#2f5bea" />
    <path d="M16 2 29 9l-13 7L3 9z" fill="#6f8ff5" />
    <path d="M16 16v14l13-7V9z" fill="#1f3fb8" />
  </svg>
);
