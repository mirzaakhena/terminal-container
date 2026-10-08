import { createStore } from '../../lib/store';

/** What the dashboard's detail panel shows: the block, the crane, or one container found by search. */
export type Selection = { kind: 'block' } | { kind: 'crane' } | { kind: 'container'; id: string };

export const selectionStore = createStore<{ selected: Selection }>({ selected: { kind: 'block' } });
export const select = (selected: Selection) => selectionStore.set({ selected });
