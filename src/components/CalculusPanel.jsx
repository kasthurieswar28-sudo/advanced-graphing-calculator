import React, { useState } from 'react';
import { Sigma, TrendingUp, Table, Download, Check } from 'lucide-react';
import { 
  numericalIntegral, 
  numericalDerivative, 
  evaluateFunction2D, 
  findRoots 
} from '../utils/mathEngine';
import { exportTableToCSV } from '../utils/exportUtils';
import { soundSynth } from '../utils/audioSynth';

export default function CalculusPanel({ functions, parameters, setIntegralBounds }) {
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(Math.PI.toFixed(3));
  const [tangentX0, setTangentX0] = useState(1);
  const [tableMinX, setTableMinX] = useState(-5);
  const [tableMaxX, setTableMaxX] = useState(5);
  const [tableStep, setTableStep] = useState(1);

  const activeFn = functions[0] || { expression: 'sin(x)' };
  const expr = activeFn.expression;

  // Integral computation
  const aNum = Number(lowerBound) || 0;
  const bNum = Number(upperBound) || 0;
  const integralResult = numericalIntegral(expr, aNum, bNum, parameters);

  // Tangent line computation
  const x0Num = Number(tangentX0) || 0;
  const y0Num = evaluateFunction2D(expr, x0Num, parameters);
  const slopeNum = numericalDerivative(expr, x0Num, parameters);

  // Roots
  const roots = findRoots(expr, -10, 10, 0.2, parameters);

  const handleApplyIntegralShading = () => {
    soundSynth.playSuccessChime();
    setIntegralBounds({ a: aNum, b: bNum });
  };

  const handleExportCSV = () => {
    soundSynth.playSuccessChime();
    const rows = [];
    for (let x = Number(tableMinX); x <= Number(tableMaxX); x += Number(tableStep)) {
      const y = evaluateFunction2D(expr, x, parameters);
      if (!isNaN(y)) {
        rows.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
      }
    }
    exportTableToCSV(rows, `calculus-table-${expr}.csv`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sigma className="w-5 h-5 text-cyan-400" />
        <h2 className="font-bold text-base text-slate-100">Calculus & Numerical Analysis Suite</h2>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
          f(x) = {expr}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Definite Integration */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sigma className="w-4 h-4 text-cyan-400" />
            <span>Definite Area Integral ∫ [a, b] f(x) dx</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-mono">Lower Bound (a)</label>
              <input
                type="number"
                value={lowerBound}
                onChange={(e) => setLowerBound(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 font-mono">Upper Bound (b)</label>
              <input
                type="number"
                value={upperBound}
                onChange={(e) => setUpperBound(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Computed Area =</span>
            <span className="text-base font-bold font-mono text-cyan-300">
              {isNaN(integralResult) ? 'N/A' : integralResult.toFixed(5)}
            </span>
          </div>

          <button
            onClick={handleApplyIntegralShading}
            className="flex items-center justify-center gap-2 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold rounded-xl transition"
          >
            <Check className="w-4 h-4" />
            <span>Shade Region on 2D Graph</span>
          </button>
        </div>

        {/* Card 2: Instant Tangent & Slope */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Tangent Line & Derivative f'(x₀)</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono">Evaluation Point (x₀)</label>
            <input
              type="number"
              value={tangentX0}
              onChange={(e) => setTangentX0(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-purple-300 focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Point Coordinates:</span>
              <span className="text-purple-300 font-bold">({x0Num}, {isNaN(y0Num) ? 'N/A' : y0Num.toFixed(3)})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Slope m = f'(x₀):</span>
              <span className="text-cyan-300 font-bold">{isNaN(slopeNum) ? 'N/A' : slopeNum.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span className="text-slate-400">Tangent Equation:</span>
              <span className="text-emerald-300 font-bold">
                y = {slopeNum.toFixed(2)}x { (y0Num - slopeNum * x0Num) >= 0 ? '+' : '' } {(y0Num - slopeNum * x0Num).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-1">Located Roots (x = 0):</span>
            <div className="flex flex-wrap gap-1.5">
              {roots.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No roots found in [-10, 10]</span>
              ) : (
                roots.map((r, i) => (
                  <span key={i} className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-xs font-mono">
                    x = {r}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Value Table Exporter */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Table Data Exporter</h3>
            <p className="text-[11px] text-slate-400 font-mono">Generate discrete values table for spreadsheet software</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Range:</span>
            <input
              type="number"
              value={tableMinX}
              onChange={(e) => setTableMinX(e.target.value)}
              className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-cyan-300"
            />
            <span>to</span>
            <input
              type="number"
              value={tableMaxX}
              onChange={(e) => setTableMaxX(e.target.value)}
              className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-cyan-300"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
