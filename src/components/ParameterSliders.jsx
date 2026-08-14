import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Sliders } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

export default function ParameterSliders({ parameters, setParameters }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef(null);

  const updateParam = (key, val) => {
    setParameters(prev => ({ ...prev, [key]: Number(val) }));
  };

  // Animation Loop for automated parameter modulation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let time = 0;
    const animate = () => {
      time += 0.03;
      const modVal = Number((Math.sin(time) * 3).toFixed(2));
      setParameters(prev => ({
        ...prev,
        a: modVal
      }));
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, setParameters]);

  const togglePlay = () => {
    soundSynth.playKeyClick(650, 0.02);
    setIsPlaying(!isPlaying);
  };

  const paramKeys = Object.keys(parameters);

  if (paramKeys.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Dynamic Parameters</span>
        </div>

        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition ${
            isPlaying
              ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Animating' : 'Animate (a)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paramKeys.map(key => (
          <div key={key} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-cyan-400 font-bold">{key}</span>
              <span className="font-mono text-slate-200">{parameters[key]}</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={parameters[key]}
              onChange={(e) => updateParam(key, e.target.value)}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
