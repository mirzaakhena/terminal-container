import type { ComponentType } from 'react';
import { YardView } from './YardView';
import { ContainersView } from './ContainersView';
import { TruckPanel, TruckView } from './TruckView';
import { BlockPanel, BlockView } from './BlockView';
import { DrivePanel, DriveView } from './DriveView';
import { CranePanel, CraneView } from './CraneView';

/** Each view is a set of objects drawn on the shared stage, picked from the header. */
export interface ViewDef {
  id: string;
  label: string;
  Component: ComponentType;
  /** Optional HTML controls shown over the scene for this view. */
  Panel?: ComponentType;
  /** Distance of the home view from the centre, for views bigger or smaller than the default. */
  homeDistance?: number;
  /** Turns the home view about the vertical axis (radians), to look at a view from another side. */
  homeAzimuth?: number;
}

export const views: ViewDef[] = [
  { id: 'yard', label: 'Yard', Component: YardView },
  { id: 'containers', label: 'Containers', Component: ContainersView },
  { id: 'truck', label: 'Truck', Component: TruckView, Panel: TruckPanel },
  { id: 'block', label: 'Block', Component: BlockView, Panel: BlockPanel, homeDistance: 120 },
  { id: 'drive', label: 'Drive', Component: DriveView, Panel: DrivePanel, homeDistance: 150 },
  { id: 'crane', label: 'Crane', Component: CraneView, Panel: CranePanel, homeDistance: 140, homeAzimuth: Math.PI / 2 },
];

export const findView = (id: string | null): ViewDef => views.find((v) => v.id === id) ?? views[0];
