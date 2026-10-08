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
  const use = () => useSyncExternalStore(subscribe, get, get);
  return { get, set, use };
}
