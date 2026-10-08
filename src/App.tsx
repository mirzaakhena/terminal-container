import { useMemo, useState } from 'react';
import { Stage } from './scene/Stage';
import { createCameraApi } from './scene/cameraApi';
import { CameraControls } from './ui/CameraControls';
import { Header } from './ui/Header';
import { findView } from './views';

const initialView = () => findView(new URLSearchParams(location.search).get('view')).id;

export function App() {
  const cameraApi = useMemo(createCameraApi, []);
  const [showGrid, setShowGrid] = useState(true);
  const [viewId, setViewId] = useState(initialView);
  const view = findView(viewId);

  const changeView = (id: string) => {
    setViewId(id);
    const url = new URL(location.href);
    url.searchParams.set('view', id);
    history.replaceState(null, '', url);
  };

  return (
    <div className="app">
      <Stage cameraApi={cameraApi} showGrid={showGrid}>
        <view.Component key={view.id} />
      </Stage>
      <Header viewId={view.id} onViewChange={changeView} />
      <CameraControls api={cameraApi} showGrid={showGrid} onToggleGrid={() => setShowGrid((s) => !s)} />
    </div>
  );
}
