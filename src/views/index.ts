import type { ComponentType } from 'react';
import { YardView } from './YardView';
import { ContainersView } from './ContainersView';

/** Each view is a set of objects drawn on the shared stage, picked from the header. */
export interface ViewDef {
  id: string;
  label: string;
  Component: ComponentType;
}

export const views: ViewDef[] = [
  { id: 'yard', label: 'Yard', Component: YardView },
  { id: 'containers', label: 'Containers', Component: ContainersView },
];

export const findView = (id: string | null): ViewDef => views.find((v) => v.id === id) ?? views[0];
