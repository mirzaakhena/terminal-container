import { useSyncExternalStore } from 'react';

/** Minimal shared state for a view's 3D scene and its HTML panel, which live in different React roots. */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const get = () => state;
  const set = (patch: Partial<T> | ((s: T) => Partial<T>)) => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    listeners.forEach((l) => l());
  };
  /** Subscribe a component; pass a selector returning a primitive to re-render only when that value changes. */
  function use(): T;
  function use<U>(selector: (s: T) => U): U;
  function use<U>(selector?: (s: T) => U): T | U {
    const read: () => T | U = selector ? () => selector(state) : get;
    return useSyncExternalStore<T | U>(subscribe, read, read);
  }
  return { get, set, use };
}
