import { useEffect, useRef, useState } from 'react';

/** Open/close state for a small dropdown: closes on a click outside it or on Escape. */
export function usePopover<T extends HTMLElement>(onOpen?: () => void) {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    window.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', outside);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);
  const toggle = () => {
    if (!open) onOpen?.();
    setOpen(!open);
  };
  return { open, toggle, close: () => setOpen(false), ref };
}
