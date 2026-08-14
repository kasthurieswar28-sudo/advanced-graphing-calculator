import React, { useState } from 'react';
import { Grid3X3, BarChart2, Plus, Trash2 } from 'lucide-react';
import { calculateMatrixOps, calculateLinearRegression } from '../utils/mathEngine';
import { soundSynth } from '../utils/audioSynth';

export default function MatrixStatsPanel() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' or 'stats'

  // Matrix State (2x2 default)
  const [matrixA, setMatrixA] = useState([
    [2, 1],
    [5, 3]
  ]);

  const [matrixB, setMatrixB] = useState([
    [1, 0],
    [0, 1]
  ]);

  // Statistics Dataset State
  const [points, setPoints] = useState([
    { x: 1, y: 2.1 },
    { x: 2, y: 3.9 },
    { x: 3, y: 6.2 },
    { x: 4, y: 7.8 },
    { x: 5, y: 10.1 }
  ]);

  // Handle matrix element update
  const updateMatrixA = (r, c, val) => {
    const next = matrixA.map((row, i) =>
      row.map((col, j) => (i === r && j === c ? Number(val) || 0 : col))
    );
    setMatrixA(next);
  };

  const matrixResults = calculateMatrixOps(matrixA, matrixB);
  const regressionResults = calculateLinearRegression(points);

  const addPoint = () => {
    soundSynth.playKeyClick(600, 0.02);
    setPoints([...points, { x: points.length + 1, y: (points.length + 1) * 2 }]);
  };

  const removePoint = (idx) => {
    soundSynth.playKeyClick(400, 0.02);
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== idx));
  };

  const updatePoint = (idx, key, val) => {
    setPoints(points.map((p, i) => (i === idx ? { ...p, [key]: Number(val) || 0 } : p)));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'matrix'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Matrix Suite</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'stats'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Statistics & Regression</span>
        </button>
      </div>

      {activeTab === 'matrix' ? (
        /* Matrix Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matrix A Input */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-cyan-400 font-mono">Matrix A (2x2)</h3>
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 max-w-[200px]">
              {matrixA.map((row, r) =>
                row.map((col, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="number"
                    value={col}
                    onChange={(e) => updateMatrixA(r, c, e.target.value)}
                    className="w-full text-center bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 font-bold focus:border-cyan-500"
                  />
                ))
              )}
            </div>
          </div>

          {/* Matrix Results */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-300">Matrix Properties & Results</h3>
            {matrixResults.error ? (
              <p className="text-xs text-rose-400">{matrixResults.error}</p>
            ) : (
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Determinant det(A):</span>
                  <span className="text-cyan-300 font-bold">{matrixResults.detA}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400">Inverse A⁻¹:</span>
                  {typeof matrixResults.invA === 'string' ? (
                    <span className="text-rose-400">{matrixResults.invA}</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 text-center font-bold text-emerald-300 mt-1">
                      {matrixResults.invA.map((row, r) =>
                        row.map((val, c) => <div key={`inv-${r}-${c}`}>{val.toFixed(2)}</div>)
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400">Transpose Aᵀ:</span>
                  <div className="grid grid-cols-2 gap-1 text-center font-bold text-purple-300 mt-1">
                    {matrixResults.transA.map((row, r) =>
                      row.map((val, c) => <div key={`trans-${r}-${c}`}>{val}</div>)
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Statistics & Linear Regression Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Points Table */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-purple-400">Dataset Points (X, Y)</h3>
              <button
                onClick={addPoint}
                className="flex items-center gap-1 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-lg hover:bg-purple-900/60 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                  <input
                    type="number"
                    value={pt.x}
                    onChange={(e) => updatePoint(idx, 'x', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-cyan-300 text-center"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={pt.y}
                    onChange={(e) => updatePoint(idx, 'y', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs font-mono text-purple-300 text-center"
                    placeholder="Y"
                  />
                  {points.length > 2 && (
                    <button
                      onClick={() => removePoint(idx)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Linear Regression Results */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-300">Trendline & Correlation</h3>
            {regressionResults ? (
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400">Best Fit Trendline:</span>
                  <span className="text-sm font-bold text-cyan-300">{regressionResults.equation}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Slope (m):</span>
                    <span className="text-purple-300 font-bold">{regressionResults.slope}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Intercept (c):</span>
                    <span className="text-purple-300 font-bold">{regressionResults.intercept}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">R² Coefficient:</span>
                  <span className="text-emerald-300 font-bold text-sm">{regressionResults.rSquare}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Need at least 2 valid points for regression.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
