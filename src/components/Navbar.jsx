import React from 'react';
import { 
  Activity, 
  Box, 
  Sigma, 
  Grid3X3, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Download, 
  RotateCcw 
} from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

export default function Navbar({ 
  activeMode, 
  setActiveMode, 
  soundEnabled, 
  setSoundEnabled, 
  onOpenPresets, 
  onResetView, 
  onExportGraph 
}) {
  const modes = [
    { id: '2d', label: '2D Grapher', icon: Activity },
    { id: '3d', label: '3D WebGL Surface', icon: Box },
    { id: 'calculus', label: 'Calculus Suite', icon: Sigma },
    { id: 'matrix', label: 'Matrix & Stats', icon: Grid3X3 },
    { id: 'fractal', label: 'Fractals & Chaos', icon: Sparkles },
  ];

  const handleModeClick = (modeId) => {
    soundSynth.playKeyClick(700, 0.02);
    setActiveMode(modeId);
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundSynth.toggleSound(next);
    if (next) soundSynth.playSuccessChime();
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleModeClick('2d')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
              APEX GRAPH
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Scientific & Visual Math Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
          {modes.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {mode.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundSynth.playKeyClick(650, 0.02);
              onOpenPresets();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition duration-200 shadow-sm"
            title="Preset Functions Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Presets</span>
          </button>

          {activeMode === '2d' && (
            <button
              onClick={() => {
                soundSynth.playKeyClick(500, 0.02);
                onResetView();
              }}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/50 transition"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {(activeMode === '2d' || activeMode === '3d' || activeMode === 'fractal') && (
            <button
              onClick={() => {
                soundSynth.playSuccessChime();
                onExportGraph();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-medium transition duration-200 shadow-sm"
              title="Export Plot Image"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? 'bg-cyan-950/40 text-cyan-400 border-cyan-700/50 hover:bg-cyan-900/50'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40 hover:bg-slate-800/80'
            }`}
            title={soundEnabled ? 'Mute Audio Synth' : 'Enable Audio Synth'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
