import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, TrendingUp, History, Check } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

const COLOR_PALETTE = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink / Magenta
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
];

export default function FormulaBar({
  functions,
  setFunctions,
  graphType,
  setGraphType,
  parametricEq,
  setParametricEq,
  history,
  onSelectHistory,
  activeFunctionId,
  setActiveFunctionId
}) {
  const [showHistory, setShowHistory] = useState(false);

  const addFunction = () => {
    soundSynth.playKeyClick(650, 0.02);
    const newId = Date.now().toString();
    const nextColor = COLOR_PALETTE[functions.length % COLOR_PALETTE.length];
    const newFn = {
      id: newId,
      expression: 'sin(x)',
      color: nextColor,
      visible: true,
      showDerivative: false
    };
    setFunctions([...functions, newFn]);
    setActiveFunctionId(newId);
  };

  const removeFunction = (id) => {
    soundSynth.playKeyClick(400, 0.02);
    if (functions.length <= 1) return;
    const updated = functions.filter(f => f.id !== id);
    setFunctions(updated);
    if (activeFunctionId === id) {
      setActiveFunctionId(updated[0].id);
    }
  };

  const updateFunction = (id, key, value) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col gap-4">
      {/* Top Bar: Graph Type Selector & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'cartesian', label: 'y = f(x)' },
            { id: 'polar', label: 'r = f(θ)' },
            { id: 'parametric', label: 'x(t), y(t)' }
          ].map(gt => (
            <button
              key={gt.id}
              onClick={() => {
                soundSynth.playKeyClick(550, 0.02);
                setGraphType(gt.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                graphType === gt.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {gt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition ${
            showHistory
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Expression History Drawer */}
      {showHistory && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 max-h-40 overflow-y-auto flex flex-col gap-1 text-xs">
          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-2">No history yet</p>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  soundSynth.playKeyClick(600, 0.02);
                  onSelectHistory(item.expr);
                  setShowHistory(false);
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer font-mono transition border border-transparent hover:border-slate-800"
              >
                <span className="text-cyan-300 font-semibold">{item.expr}</span>
                <span className="text-slate-400">{item.result !== null ? `= ${item.result}` : ''}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Function Inputs Section */}
      {graphType !== 'parametric' ? (
        <div className="flex flex-col gap-2.5">
          {functions.map((fn, index) => {
            const isActive = activeFunctionId === fn.id;
            return (
              <div
                key={fn.id}
                onClick={() => setActiveFunctionId(fn.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-slate-800/70 border-slate-700 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/50'
                }`}
              >
                {/* Color Dot & Picker */}
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={fn.color}
                    onChange={(e) => updateFunction(fn.id, 'color', e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 opacity-0 absolute inset-0 z-10"
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: fn.color }}
                  />
                </div>

                <span className="font-mono text-xs font-semibold text-slate-400 w-12">
                  {graphType === 'polar' ? `r${index+1}(θ)` : `f${index+1}(x)`} =
                </span>

                <input
                  type="text"
                  value={fn.expression}
                  onChange={(e) => updateFunction(fn.id, 'expression', e.target.value)}
                  placeholder={graphType === 'polar' ? 'cos(4*theta)' : 'sin(x)'}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition"
                />

                {/* Controls: Derivative & Visibility & Delete */}
                <div className="flex items-center gap-1">
                  {graphType === 'cartesian' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundSynth.playKeyClick(600, 0.02);
                        updateFunction(fn.id, 'showDerivative', !fn.showDerivative);
                      }}
                      className={`p-1.5 rounded-lg border transition ${
                        fn.showDerivative
                          ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                      title="Toggle Derivative f'(x)"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFunction(fn.id, 'visible', !fn.visible);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      fn.visible
                        ? 'bg-slate-900 text-cyan-400 border-slate-800'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                  >
                    {fn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {functions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFunction(fn.id);
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 border border-rose-900/40 hover:bg-rose-900/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={addFunction}
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 text-xs font-semibold rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Function</span>
          </button>
        </div>
      ) : (
        /* Parametric Inputs */
        <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-purple-400 font-semibold w-12">x(t) =</span>
            <input
              type="text"
              value={parametricEq.x}
              onChange={(e) => setParametricEq({ ...parametricEq, x: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-purple-400 font-semibold w-12">y(t) =</span>
            <input
              type="text"
              value={parametricEq.y}
              onChange={(e) => setParametricEq({ ...parametricEq, y: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
