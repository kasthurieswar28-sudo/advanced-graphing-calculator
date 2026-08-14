import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { PRESETS } from '../utils/presetLibrary';
import { soundSynth } from '../utils/audioSynth';

export default function PresetGallery({ isOpen, onClose, onLoadPreset }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base text-slate-100">Math & Physics Presets Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                soundSynth.playSuccessChime();
                onLoadPreset(preset);
                onClose();
              }}
              className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 p-4 rounded-2xl cursor-pointer group transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between gap-3 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-md">
                    {preset.type}
                  </span>
                  <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
                </div>
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80 font-mono text-[11px] text-cyan-400 truncate">
                {preset.expression || preset.exprX || 'Custom Parametric'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
