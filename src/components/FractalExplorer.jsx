import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

export default function FractalExplorer({ canvasRef }) {
  const containerRef = useRef(null);
  const [fractalType, setFractalType] = useState('mandelbrot'); // 'mandelbrot' or 'julia'
  const [maxIter, setMaxIter] = useState(100);
  const [colorPalette, setColorPalette] = useState('neon'); // 'neon', 'fire', 'violet', 'emerald'

  // Julia set constants
  const [juliaC, setJuliaC] = useState({ re: -0.7, im: 0.27015 });

  // Viewport bounds: xMin, xMax, yMin, yMax
  const [bounds, setBounds] = useState({ xMin: -2.0, xMax: 1.0, yMin: -1.2, yMax: 1.2 });

  // Color Mapping Helper
  const getColor = (iter, max) => {
    if (iter === max) return [9, 13, 22]; // Dark interior

    const norm = iter / max;
    if (colorPalette === 'neon') {
      const r = Math.sin(norm * Math.PI * 4) * 127 + 128;
      const g = Math.sin(norm * Math.PI * 4 + 2) * 127 + 128;
      const b = 240;
      return [r, g, b];
    } else if (colorPalette === 'fire') {
      const r = Math.min(255, norm * 400);
      const g = Math.min(255, norm * 200);
      const b = Math.min(255, norm * 50);
      return [r, g, b];
    } else if (colorPalette === 'violet') {
      const r = Math.sin(norm * Math.PI * 3) * 100 + 155;
      const g = Math.sin(norm * Math.PI * 2) * 50 + 50;
      const b = Math.sin(norm * Math.PI * 4) * 127 + 128;
      return [r, g, b];
    } else {
      // Emerald
      const r = 20;
      const g = Math.sin(norm * Math.PI * 3) * 127 + 128;
      const b = Math.sin(norm * Math.PI * 2) * 80 + 100;
      return [r, g, b];
    }
  };

  // Canvas Render Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const { xMin, xMax, yMin, yMax } = bounds;

    for (let py = 0; py < height; py++) {
      const y0 = yMin + (py / height) * (yMax - yMin);
      for (let px = 0; px < width; px++) {
        const x0 = xMin + (px / width) * (xMax - xMin);

        let zr = fractalType === 'mandelbrot' ? 0 : x0;
        let zi = fractalType === 'mandelbrot' ? 0 : y0;
        let cr = fractalType === 'mandelbrot' ? x0 : juliaC.re;
        let ci = fractalType === 'mandelbrot' ? y0 : juliaC.im;

        let iter = 0;
        while (zr * zr + zi * zi <= 4 && iter < maxIter) {
          const nextZr = zr * zr - zi * zi + cr;
          const nextZi = 2 * zr * zi + ci;
          zr = nextZr;
          zi = nextZi;
          iter++;
        }

        const [r, g, b] = getColor(iter, maxIter);
        const idx = (py * width + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [bounds, fractalType, maxIter, colorPalette, juliaC, canvasRef]);

  // Click Zoom Handler
  const handleCanvasClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = rect.width;
    const height = 480;

    const centerReal = bounds.xMin + (clickX / width) * (bounds.xMax - bounds.xMin);
    const centerImag = bounds.yMin + (clickY / height) * (bounds.yMax - bounds.yMin);

    const newWidth = (bounds.xMax - bounds.xMin) * 0.4;
    const newHeight = (bounds.yMax - bounds.yMin) * 0.4;

    setBounds({
      xMin: centerReal - newWidth / 2,
      xMax: centerReal + newWidth / 2,
      yMin: centerImag - newHeight / 2,
      yMax: centerImag + newHeight / 2
    });
  };

  const resetView = () => {
    soundSynth.playKeyClick(500, 0.02);
    setBounds({ xMin: -2.0, xMax: 1.0, yMin: -1.2, yMax: 1.2 });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Set Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['mandelbrot', 'julia'].map(type => (
            <button
              key={type}
              onClick={() => {
                soundSynth.playKeyClick(600, 0.02);
                setFractalType(type);
                resetView();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
                fractalType === type
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type} Set
            </button>
          ))}
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Theme:</span>
          <select
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="neon">Neon Cyberpunk</option>
            <option value="fire">Solar Fire</option>
            <option value="violet">Psychedelic Violet</option>
            <option value="emerald">Emerald Crystal</option>
          </select>
        </div>

        {/* Julia Parameter Sliders */}
        {fractalType === 'julia' && (
          <div className="flex items-center gap-3 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-purple-400">C = {juliaC.re} + {juliaC.im}i</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={juliaC.re}
              onChange={(e) => setJuliaC({ ...juliaC, re: Number(e.target.value) })}
              className="w-20 h-1 bg-slate-800 accent-purple-400"
            />
          </div>
        )}

        <button
          onClick={resetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Zoom</span>
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full h-[480px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-md">
          Click anywhere to zoom in!
        </div>
      </div>
    </div>
  );
}
