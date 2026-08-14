import React, { useEffect, useRef, useState } from 'react';
import { 
  evaluateFunction2D, 
  evaluatePolar, 
  evaluateParametric, 
  numericalDerivative, 
  findRoots 
} from '../utils/mathEngine';
import { ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';

export default function Graph2D({
  functions,
  graphType,
  parametricEq,
  parameters,
  integralBounds,
  canvasRef
}) {
  const containerRef = useRef(null);

  // Viewport offset and zoom state
  const [scale, setScale] = useState(40); // 40 pixels per unit
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset from center in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tracer state
  const [hoverCoord, setHoverCoord] = useState(null);

  // Responsive Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    // Center Origin in pixels
    const originX = width / 2 + offset.x * dpr;
    const originY = height / 2 + offset.y * dpr;
    const currentScale = scale * dpr;

    // --- DRAW GRID & AXES ---
    ctx.lineWidth = 1 * dpr;

    if (graphType === 'polar') {
      // Polar Concentric Grid
      ctx.strokeStyle = '#1e293b';
      ctx.fillStyle = '#64748b';
      ctx.font = `${10 * dpr}px monospace`;
      const maxRadius = Math.max(width, height) / currentScale;

      for (let r = 1; r <= maxRadius; r += 1) {
        ctx.beginPath();
        ctx.arc(originX, originY, r * currentScale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(`r=${r}`, originX + r * currentScale + 4, originY - 4);
      }

      // Radial Spokes
      for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(
          originX + Math.cos(angle) * width,
          originY - Math.sin(angle) * width
        );
        ctx.stroke();
      }
    } else {
      // Cartesian Grid Lines
      const step = currentScale;
      ctx.strokeStyle = '#1e293b';
      ctx.fillStyle = '#64748b';
      ctx.font = `${11 * dpr}px Inter, monospace`;

      // Vertical Grid Lines
      const minXVal = Math.floor((-originX) / currentScale);
      const maxXVal = Math.ceil((width - originX) / currentScale);

      for (let x = minXVal; x <= maxXVal; x++) {
        const px = originX + x * currentScale;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        if (x !== 0 && px > 0 && px < width) {
          ctx.fillText(x.toString(), px + 4, originY + 14 * dpr);
        }
      }

      // Horizontal Grid Lines
      const minYVal = Math.floor((originY - height) / currentScale);
      const maxYVal = Math.ceil(originY / currentScale);

      for (let y = minYVal; y <= maxYVal; y++) {
        const py = originY - y * currentScale;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();

        if (y !== 0 && py > 0 && py < height) {
          ctx.fillText(y.toString(), originX + 4, py - 4);
        }
      }

      // Main Axes (X & Y)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2 * dpr;

      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();
    }

    // --- DRAW CALCULUS SHADED INTEGRAL (Cartesian Mode) ---
    if (graphType === 'cartesian' && integralBounds && functions.length > 0) {
      const activeFn = functions[0];
      if (activeFn && activeFn.visible) {
        const lowerPx = originX + integralBounds.a * currentScale;
        const upperPx = originX + integralBounds.b * currentScale;

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(lowerPx, originY);

        for (let px = lowerPx; px <= upperPx; px += 2 * dpr) {
          const xMath = (px - originX) / currentScale;
          const yMath = evaluateFunction2D(activeFn.expression, xMath, parameters);
          if (!isNaN(yMath)) {
            const py = originY - yMath * currentScale;
            ctx.lineTo(px, py);
          }
        }
        ctx.lineTo(upperPx, originY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- DRAW FUNCTIONS / CURVES ---
    if (graphType === 'cartesian') {
      functions.forEach(fn => {
        if (!fn.visible || !fn.expression.trim()) return;

        // Draw Main Function Curve y = f(x)
        ctx.strokeStyle = fn.color;
        ctx.lineWidth = 2.5 * dpr;
        ctx.shadowColor = fn.color;
        ctx.shadowBlur = 8 * dpr;

        ctx.beginPath();
        let started = false;

        for (let px = 0; px <= width; px += 2 * dpr) {
          const xMath = (px - originX) / currentScale;
          const yMath = evaluateFunction2D(fn.expression, xMath, parameters);

          if (!isNaN(yMath) && isFinite(yMath)) {
            const py = originY - yMath * currentScale;
            if (py >= -100 && py <= height + 100) {
              if (!started) {
                ctx.moveTo(px, py);
                started = true;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              started = false;
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset glow

        // Draw Derivative Curve f'(x) if toggled
        if (fn.showDerivative) {
          ctx.strokeStyle = '#c084fc'; // Purple accent
          ctx.lineWidth = 1.5 * dpr;
          ctx.setLineDash([4 * dpr, 4 * dpr]);
          ctx.beginPath();
          let derivStarted = false;

          for (let px = 0; px <= width; px += 3 * dpr) {
            const xMath = (px - originX) / currentScale;
            const dyMath = numericalDerivative(fn.expression, xMath, parameters);

            if (!isNaN(dyMath) && isFinite(dyMath)) {
              const py = originY - dyMath * currentScale;
              if (py >= -100 && py <= height + 100) {
                if (!derivStarted) {
                  ctx.moveTo(px, py);
                  derivStarted = true;
                } else {
                  ctx.lineTo(px, py);
                }
              } else {
                derivStarted = false;
              }
            } else {
              derivStarted = false;
            }
          }
          ctx.stroke();
          ctx.setLineDash([]); // Reset dashed lines
        }

        // Draw Zeros / Roots Glowing Rings
        const roots = findRoots(fn.expression, -width / currentScale, width / currentScale, 0.2, parameters);
        roots.forEach(rootVal => {
          const px = originX + rootVal * currentScale;
          if (px >= 0 && px <= width) {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10 * dpr;
            ctx.beginPath();
            ctx.arc(px, originY, 4 * dpr, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      });
    } else if (graphType === 'polar') {
      // Draw Polar Curve r = f(theta)
      functions.forEach(fn => {
        if (!fn.visible || !fn.expression.trim()) return;

        ctx.strokeStyle = fn.color;
        ctx.lineWidth = 2.5 * dpr;
        ctx.shadowColor = fn.color;
        ctx.shadowBlur = 8 * dpr;

        ctx.beginPath();
        let started = false;
        const maxTheta = 6 * Math.PI;

        for (let theta = 0; theta <= maxTheta; theta += 0.02) {
          const rMath = evaluatePolar(fn.expression, theta, parameters);
          if (!isNaN(rMath) && isFinite(rMath)) {
            const xMath = rMath * Math.cos(theta);
            const yMath = rMath * Math.sin(theta);
            const px = originX + xMath * currentScale;
            const py = originY - yMath * currentScale;

            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    } else if (graphType === 'parametric' && parametricEq) {
      // Draw Parametric Curve x(t), y(t)
      ctx.strokeStyle = '#a855f7'; // Violet accent
      ctx.lineWidth = 2.5 * dpr;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8 * dpr;

      ctx.beginPath();
      let started = false;
      const tMin = 0;
      const tMax = 37.7; // ~ 12 * pi

      for (let t = tMin; t <= tMax; t += 0.03) {
        const { x, y } = evaluateParametric(parametricEq.x, parametricEq.y, t, parameters);
        if (!isNaN(x) && !isNaN(y)) {
          const px = originX + x * currentScale;
          const py = originY - y * currentScale;

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // --- DRAW INTERACTIVE HOVER TRACER CURSOR ---
    if (hoverCoord && graphType === 'cartesian' && functions.length > 0) {
      const activeFn = functions[0];
      const px = hoverCoord.px * dpr;
      const xMath = (px - originX) / currentScale;
      const yMath = evaluateFunction2D(activeFn.expression, xMath, parameters);

      if (!isNaN(yMath) && isFinite(yMath)) {
        const py = originY - yMath * currentScale;

        // Vertical Guide Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([2 * dpr, 2 * dpr]);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Dot
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12 * dpr;
        ctx.beginPath();
        ctx.arc(px, py, 6 * dpr, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }, [functions, graphType, parametricEq, parameters, integralBounds, scale, offset, hoverCoord, canvasRef]);

  // Mouse Controls for Dragging & Zooming
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update Tracer
    setHoverCoord({ px: mouseX, py: mouseY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale(prev => Math.max(5, Math.min(500, prev * zoomFactor)));
  };

  const resetView = () => {
    setScale(40);
    setOffset({ x: 0, y: 0 });
  };

  // Compute tooltip math data
  let cursorTooltip = null;
  if (hoverCoord && functions.length > 0 && graphType === 'cartesian') {
    const canvas = canvasRef.current;
    if (canvas) {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const originX = width / 2 + offset.x;
      const xMath = (hoverCoord.px - originX) / scale;
      const yMath = evaluateFunction2D(functions[0].expression, xMath, parameters);
      const slope = numericalDerivative(functions[0].expression, xMath, parameters);

      if (!isNaN(yMath)) {
        cursorTooltip = {
          x: xMath.toFixed(3),
          y: yMath.toFixed(3),
          slope: !isNaN(slope) ? slope.toFixed(3) : 'N/A'
        };
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoverCoord(null);
        }}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating Toolbar Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-xl backdrop-blur-md">
        <button
          onClick={() => setScale(s => Math.min(500, s * 1.25))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(5, s * 0.8))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Cursor HUD Tooltip */}
      {cursorTooltip && (
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800/90 p-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-3 font-mono text-xs text-slate-200">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-slate-400">x:</span> <span className="text-cyan-300 font-bold">{cursorTooltip.x}</span>
          </div>
          <div>
            <span className="text-slate-400">y:</span> <span className="text-emerald-300 font-bold">{cursorTooltip.y}</span>
          </div>
          <div>
            <span className="text-slate-400">f'(x):</span> <span className="text-purple-300 font-bold">{cursorTooltip.slope}</span>
          </div>
        </div>
      )}
    </div>
  );
}
