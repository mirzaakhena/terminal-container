import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, MeshBasicMaterial } from 'three';
import type { P2 } from '../motion/route';

/** A flat strip of constant width following a polyline, lying just above the ground. */
export function RoadRibbon({ points, width, y = 0.01, material }: { points: P2[]; width: number; y?: number; material: MeshBasicMaterial }) {
  const geometry = useMemo(() => {
    const pos: number[] = [];
    const idx: number[] = [];
    const h = width / 2;
    points.forEach((p, i) => {
      const a = points[Math.max(0, i - 1)];
      const b = points[Math.min(points.length - 1, i + 1)];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const l = Math.hypot(dx, dz) || 1;
      const nx = -dz / l;
      const nz = dx / l;
      pos.push(p[0] + nx * h, y, p[1] + nz * h, p[0] - nx * h, y, p[1] - nz * h);
      if (i > 0) {
        const k = i * 2;
        idx.push(k - 2, k, k - 1, k - 1, k, k + 1); // counter-clockwise seen from above
      }
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [points, width, y]);
  return <mesh geometry={geometry} material={material} receiveShadow />;
}
