import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PCA3DPoint, PCA2DPoint } from '../types';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface Pca3DScatterChartProps {
  data: PCA3DPoint[] | PCA2DPoint[];
  title?: string;
  subtitle?: string;
  explainedVariance?: number[];
}

const CLUSTER_COLORS = [
  '#4F46E5', // Indigo (Cluster 0)
  '#10B981', // Emerald (Cluster 1)
  '#F59E0B', // Amber (Cluster 2)
  '#EF4444', // Rose (Cluster 3)
  '#06B6D4', // Cyan (Cluster 4)
  '#8B5CF6', // Purple (Cluster 5)
  '#EC4899', // Pink (Cluster 6)
  '#14B8A6', // Teal (Cluster 7)
  '#F97316', // Orange (Cluster 8)
  '#6366F1', // Blue-violet (Cluster 9)
];

const NOISE_COLOR = '#94A3B8';

export const Pca3DScatterChart: React.FC<Pca3DScatterChartProps> = ({
  data,
  title = "3D Interactive Principal Component Projection (PCA)",
  subtitle = "Interactive 3D orbital projection. Drag to rotate in 360°, scroll to zoom, hover on nodes to inspect cluster assignment.",
  explainedVariance
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D rotation angles & zoom state
  const [rotX, setRotX] = useState<number>(25); // degrees
  const [rotY, setRotY] = useState<number>(-35); // degrees
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<{ id: number; cluster: number; x: number; y: number; z: number; screenX: number; screenY: number } | null>(null);

  // Normalize coordinates into [-1, 1] bounding box
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    data.forEach((p) => {
      const pz = (p as any).z !== undefined ? (p as any).z : 0;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    });

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeY, rangeZ) / 2;

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const midZ = (minZ + maxZ) / 2;

    return data.map((p) => {
      const pz = (p as any).z !== undefined ? (p as any).z : 0;
      return {
        id: p.id,
        rawX: p.x,
        rawY: p.y,
        rawZ: pz,
        nx: (p.x - midX) / maxRange,
        ny: (p.y - midY) / maxRange,
        nz: (pz - midZ) / maxRange,
        cluster: p.cluster
      };
    });
  }, [data]);

  // Projected 2D screen positions for hit testing & rendering
  const projectedPointsRef = useRef<Array<{ id: number; cluster: number; rawX: number; rawY: number; rawZ: number; sx: number; sy: number; sz: number }>>([]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Convert Euler angles to radians
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const fov = 380 * zoom;
    const centerX = width / 2;
    const centerY = height / 2;

    // Helper for 3D coordinate transformation
    const project = (x: number, y: number, z: number) => {
      // Rotate around Y-axis
      const x1 = x * cosY + z * sinY;
      const y1 = y;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X-axis
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 3.2;
      const distance = cameraDistance + z2;
      const scale = distance > 0.1 ? fov / distance : fov / 0.1;

      return {
        sx: centerX + x2 * scale,
        sy: centerY - y2 * scale,
        sz: z2
      };
    };

    // Draw 3D Coordinate Bounding Grid Box
    const boxCorners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
    ];
    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back / Bottom
      [4, 5], [5, 6], [6, 7], [7, 4], // Front / Top
      [0, 4], [1, 5], [2, 6], [3, 7]  // Pillars
    ];

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    boxEdges.forEach(([i, j]) => {
      const p1 = project(boxCorners[i][0], boxCorners[i][1], boxCorners[i][2]);
      const p2 = project(boxCorners[j][0], boxCorners[j][1], boxCorners[j][2]);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    });

    ctx.setLineDash([]);

    // Draw 3D Axes (X=Red, Y=Green, Z=Blue)
    const origin = project(0, 0, 0);
    const axisX = project(1.2, 0, 0);
    const axisY = project(0, 1.2, 0);
    const axisZ = project(0, 0, 1.2);

    // Axis lines
    const drawAxis = (dest: { sx: number; sy: number }, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(dest.sx, dest.sy);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(label, dest.sx + 4, dest.sy + 4);
    };

    drawAxis(axisX, '#EF4444', 'PC1');
    drawAxis(axisY, '#10B981', 'PC2');
    drawAxis(axisZ, '#3B82F6', 'PC3');

    // Project all data points
    const projected = normalizedData.map((pt) => {
      const proj = project(pt.nx, pt.ny, pt.nz);
      return {
        id: pt.id,
        cluster: pt.cluster,
        rawX: pt.rawX,
        rawY: pt.rawY,
        rawZ: pt.rawZ,
        sx: proj.sx,
        sy: proj.sy,
        sz: proj.sz
      };
    });

    // Painter's algorithm: sort back-to-front by z-depth
    projected.sort((a, b) => b.sz - a.sz);
    projectedPointsRef.current = projected;

    // Render spheres
    projected.forEach((pt) => {
      const isHovered = hoveredPoint && hoveredPoint.id === pt.id;
      const baseRadius = isHovered ? 7 : Math.max(2.5, Math.min(6, 4.0 + pt.sz * 1.5));
      const color = pt.cluster === -1 ? NOISE_COLOR : CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length];

      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Border highlight
      ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = isHovered ? 2.5 : 1;
      ctx.stroke();

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, baseRadius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [rotX, rotY, zoom, normalizedData, hoveredPoint]);

  // Mouse handlers for Orbit Controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setRotY((prev) => (prev + deltaX * 0.6) % 360);
      setRotX((prev) => Math.max(-85, Math.min(85, prev + deltaY * 0.6)));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Hit testing for hover
      let found = null;
      for (let i = projectedPointsRef.current.length - 1; i >= 0; i--) {
        const pt = projectedPointsRef.current[i];
        const dist = Math.hypot(pt.sx - mouseX, pt.sy - mouseY);
        if (dist <= 8) {
          found = {
            id: pt.id,
            cluster: pt.cluster,
            x: pt.rawX,
            y: pt.rawY,
            z: pt.rawZ,
            screenX: pt.sx,
            screenY: pt.sy
          };
          break;
        }
      }
      setHoveredPoint(found);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.max(0.4, Math.min(3.0, prev + delta)));
  };

  const resetView = () => {
    setRotX(25);
    setRotY(-35);
    setZoom(1.0);
  };

  // Distinct cluster set for legend
  const uniqueClusters = useMemo(() => {
    const s = new Set<number>();
    data.forEach((p) => s.add(p.cluster));
    return Array.from(s).sort((a, b) => a - b);
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Header with Title and Variance Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              WebGL-Style 3D Space
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {explainedVariance && (
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
            <span>Variance:</span>
            <span className="font-bold text-red-600">PC1: {((explainedVariance[0] || 0) * 100).toFixed(1)}%</span>
            <span>|</span>
            <span className="font-bold text-emerald-600">PC2: {((explainedVariance[1] || 0) * 100).toFixed(1)}%</span>
            <span>|</span>
            <span className="font-bold text-blue-600">PC3: {((explainedVariance[2] || 0) * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* 3D Viewport Container */}
      <div className="relative w-full h-[460px] bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          width={880}
          height={460}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* 3D Control Action Overlay */}
        <div className="absolute top-4 right-4 flex flex-col space-y-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 text-white shadow-xl z-10">
          <button
            onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}
            className="p-1.5 hover:bg-slate-700/80 rounded-lg text-slate-200 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 hover:bg-slate-700/80 rounded-lg text-slate-200 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-slate-700/80 rounded-lg text-slate-200 hover:text-white transition"
            title="Reset 3D Camera Orbit"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Orbit Helper Watermark */}
        <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 flex items-center space-x-3 pointer-events-none">
          <span className="flex items-center space-x-1">
            <Move className="w-3.5 h-3.5 text-slate-500" />
            <span>Drag to Orbit</span>
          </span>
          <span>•</span>
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span className="font-mono text-slate-500">Angle: ({rotX.toFixed(0)}°, {rotY.toFixed(0)}°)</span>
        </div>

        {/* Hovered Point Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded-lg border border-slate-700 text-xs shadow-2xl backdrop-blur-md font-sans"
            style={{
              left: Math.min(window.innerWidth - 220, Math.max(20, hoveredPoint.screenX + 15)),
              top: Math.max(20, hoveredPoint.screenY - 45)
            }}
          >
            <div className="flex items-center space-x-2 font-bold text-white mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{
                  backgroundColor: hoveredPoint.cluster === -1 ? NOISE_COLOR : CLUSTER_COLORS[hoveredPoint.cluster % CLUSTER_COLORS.length]
                }}
              />
              <span>{hoveredPoint.cluster === -1 ? 'Noise / Outlier' : `Cluster ${hoveredPoint.cluster}`}</span>
              <span className="text-[10px] text-slate-400">#Index {hoveredPoint.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-300">
              <div>PC1: <span className="text-white font-bold">{hoveredPoint.x.toFixed(2)}</span></div>
              <div>PC2: <span className="text-white font-bold">{hoveredPoint.y.toFixed(2)}</span></div>
              <div>PC3: <span className="text-white font-bold">{hoveredPoint.z.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Cluster Legend */}
      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Cluster Partitions:</span>
        {uniqueClusters.map((c) => {
          const color = c === -1 ? NOISE_COLOR : CLUSTER_COLORS[c % CLUSTER_COLORS.length];
          const label = c === -1 ? 'Noise / Outlier' : `Cluster ${c}`;
          return (
            <div key={c} className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-slate-700 font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};