import type { ComponentType } from 'react';
import { YardView } from './YardView';
import { ContainersView } from './ContainersView';
import { TruckPanel, TruckView } from './TruckView';

/** Each view is a set of objects drawn on the shared stage, picked from the header. */
export interface ViewDef {
  id: string;
  label: string;
  Component: ComponentType;
  /** Optional HTML controls shown over the scene for this view. */
  Panel?: ComponentType;
}

export const views: ViewDef[] = [
  { id: 'yard', label: 'Yard', Component: YardView },
  { id: 'containers', label: 'Containers', Component: ContainersView },
  { id: 'truck', label: 'Truck', Component: TruckView, Panel: TruckPanel },
];

export const findView = (id: string | null): ViewDef => views.find((v) => v.id === id) ?? views[0];
