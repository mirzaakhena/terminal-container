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
export const SearchIcon = () => (
  <svg {...base}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const BellIcon = () => (
  <svg {...base}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
);
export const ChevronDownIcon = () => (
  <svg {...base}><path d="M6 9l6 6 6-6" /></svg>
);
export const ContainerIcon = () => (
  <svg {...base}><rect x="2" y="7" width="20" height="11" rx="1.5" /><path d="M6 7v11M10 7v11M14 7v11M18 7v11" /></svg>
);
export const TruckIcon = () => (
  <svg {...base}><path d="M1 6h13v10H1zM14 10h4l3 3v3h-7" /><circle cx="5" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
);
export const CraneIcon = () => (
  <svg {...base}><path d="M4 21V4h16v17M4 4l8 0M12 4v6M10 10h4v3h-4z" /></svg>
);
export const ClockIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const ListIcon = () => (
  <svg {...base}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
);
export const CheckIcon = () => (
  <svg {...base}><path d="M5 12l5 5L20 7" /></svg>
);
