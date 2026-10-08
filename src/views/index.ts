import type { ComponentType } from 'react';
import { YardView } from './YardView';
import { ContainersView } from './ContainersView';
import { TruckPanel, TruckView } from './TruckView';
import { BlockPanel, BlockView } from './BlockView';

/** Each view is a set of objects drawn on the shared stage, picked from the header. */
export interface ViewDef {
  id: string;
  label: string;
  Component: ComponentType;
  /** Optional HTML controls shown over the scene for this view. */
  Panel?: ComponentType;
  /** Distance of the home view from the centre, for views bigger or smaller than the default. */
  homeDistance?: number;
}

export const views: ViewDef[] = [
  { id: 'yard', label: 'Yard', Component: YardView },
  { id: 'containers', label: 'Containers', Component: ContainersView },
  { id: 'truck', label: 'Truck', Component: TruckView, Panel: TruckPanel },
  { id: 'block', label: 'Block', Component: BlockView, Panel: BlockPanel, homeDistance: 120 },
];

export const findView = (id: string | null): ViewDef => views.find((v) => v.id === id) ?? views[0];
