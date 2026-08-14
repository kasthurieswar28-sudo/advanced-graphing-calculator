import React, { useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Keypad from './components/Keypad';
import FormulaBar from './components/FormulaBar';
import ParameterSliders from './components/ParameterSliders';
import Graph2D from './components/Graph2D';
import Graph3D from './components/Graph3D';
import FractalExplorer from './components/FractalExplorer';
import CalculusPanel from './components/CalculusPanel';
import MatrixStatsPanel from './components/MatrixStatsPanel';
import PresetGallery from './components/PresetGallery';
import { evaluateExpression } from './utils/mathEngine';
import { exportCanvasToPNG } from './utils/exportUtils';
import { soundSynth } from './utils/audioSynth';

export default function App() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState('2d'); // '2d', '3d', 'calculus', 'matrix', 'fractal'

  // Audio & Presets Modal State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // 2D Functions State
  const [functions, setFunctions] = useState([
    { id: '1', expression: 'sin(x)', color: '#06b6d4', visible: true, showDerivative: false },
    { id: '2', expression: 'cos(a * x)', color: '#ec4899', visible: true, showDerivative: false }
  ]);
  const [activeFunctionId, setActiveFunctionId] = useState('1');

  // Plot Types & Parameters
  const [graphType, setGraphType] = useState('cartesian'); // 'cartesian', 'polar', 'parametric'
  const [parametricEq, setParametricEq] = useState({
    x: '3 * sin(3 * t)',
    y: '3 * sin(2 * t)'
  });
  const [parameters, setParameters] = useState({ a: 2, b: 1 });

  // Calculus Shaded Bounds
  const [integralBounds, setIntegralBounds] = useState(null);

  // Scientific Calculator Keypad State
  const [expressionInput, setExpressionInput] = useState('sin(pi / 4)^2');
  const [calcDisplayResult, setCalcDisplayResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [angleUnit, setAngleUnit] = useState('RAD');

  // Canvas Refs for Export
  const canvas2DRef = useRef(null);
  const canvas3DRef = useRef(null);
  const canvasFractalRef = useRef(null);

  // Handle Keypad Insert
  const handleInsertKey = (val) => {
    setExpressionInput(prev => prev + val);
  };

  // Handle Keypad Clear
  const handleClearKey = () => {
    setExpressionInput('');
    setCalcDisplayResult(null);
  };

  // Handle Keypad Delete
  const handleDeleteKey = () => {
    setExpressionInput(prev => prev.slice(0, -1));
  };

  // Handle Scientific Calculator Evaluation
  const handleEvaluateKey = () => {
    if (!expressionInput.trim()) return;
    const { result, error } = evaluateExpression(expressionInput, parameters);
    if (error) {
      soundSynth.playErrorBuzz();
      setCalcDisplayResult('Error');
    } else {
      const formatted = typeof result === 'number' ? Number(result.toFixed(6)) : result;
      setCalcDisplayResult(formatted);
      setHistory(prev => [{ expr: expressionInput, result: formatted }, ...prev]);
    }
  };

  // Preset Selection Handler
  const handleLoadPreset = (preset) => {
    if (preset.type === '3D') {
      setActiveMode('3d');
    } else if (preset.type === 'Polar') {
      setActiveMode('2d');
      setGraphType('polar');
      setFunctions([{ id: '1', expression: preset.expression, color: '#06b6d4', visible: true }]);
    } else if (preset.type === 'Parametric') {
      setActiveMode('2d');
      setGraphType('parametric');
      setParametricEq({ x: preset.exprX, y: preset.exprY });
    } else {
      setActiveMode('2d');
      setGraphType('cartesian');
      setFunctions([{ id: '1', expression: preset.expression, color: '#06b6d4', visible: true }]);
    }

    if (preset.params) {
      setParameters(preset.params);
    }
  };

  // Export Active Graph Canvas
  const handleExportGraph = () => {
    let targetCanvas = null;
    let name = 'apex-graph';
    if (activeMode === '2d') {
      targetCanvas = canvas2DRef.current;
      name = 'apex-2d-plot';
    } else if (activeMode === '3d') {
      targetCanvas = canvas3DRef.current;
      name = 'apex-3d-surface';
    } else if (activeMode === 'fractal') {
      targetCanvas = canvasFractalRef.current;
      name = 'apex-fractal';
    }
    if (targetCanvas) {
      exportCanvasToPNG(targetCanvas, `${name}-${Date.now()}.png`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onResetView={() => {
          setIntegralBounds(null);
        }}
        onExportGraph={handleExportGraph}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* MODE 1: 2D GRAPHING & CALCULATOR */}
        {activeMode === '2d' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Keypad & Formula Bar & Sliders */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Scientific Calculator Workspace Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                  <span>Scientific Tape</span>
                  <span className="text-cyan-400 font-semibold">{angleUnit} Mode</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-end justify-center min-h-[56px]">
                  <input
                    type="text"
                    value={expressionInput}
                    onChange={(e) => setExpressionInput(e.target.value)}
                    placeholder="Enter expression..."
                    className="w-full bg-transparent text-right font-mono text-cyan-300 text-sm focus:outline-none"
                  />
                  {calcDisplayResult !== null && (
                    <span className="font-mono text-lg font-bold text-emerald-400 mt-1">
                      = {calcDisplayResult}
                    </span>
                  )}
                </div>
              </div>

              {/* Keypad */}
              <Keypad
                onInsert={handleInsertKey}
                onClear={handleClearKey}
                onDelete={handleDeleteKey}
                onEvaluate={handleEvaluateKey}
                angleUnit={angleUnit}
                setAngleUnit={setAngleUnit}
                memory={memory}
                setMemory={setMemory}
              />

              {/* Formula & Function List */}
              <FormulaBar
                functions={functions}
                setFunctions={setFunctions}
                graphType={graphType}
                setGraphType={setGraphType}
                parametricEq={parametricEq}
                setParametricEq={setParametricEq}
                history={history}
                onSelectHistory={(expr) => setExpressionInput(expr)}
                activeFunctionId={activeFunctionId}
                setActiveFunctionId={setActiveFunctionId}
              />

              {/* Parameter Sliders */}
              <ParameterSliders
                parameters={parameters}
                setParameters={setParameters}
              />
            </div>

            {/* Right Column: 2D Canvas Display */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <Graph2D
                functions={functions}
                graphType={graphType}
                parametricEq={parametricEq}
                parameters={parameters}
                integralBounds={integralBounds}
                canvasRef={canvas2DRef}
              />
            </div>
          </div>
        )}

        {/* MODE 2: 3D WEBGL SURFACE */}
        {activeMode === '3d' && (
          <div className="flex flex-col gap-6">
            <Graph3D
              parameters={parameters}
              canvasRef={canvas3DRef}
            />
            <div className="max-w-md">
              <ParameterSliders
                parameters={parameters}
                setParameters={setParameters}
              />
            </div>
          </div>
        )}

        {/* MODE 3: CALCULUS SUITE */}
        {activeMode === 'calculus' && (
          <CalculusPanel
            functions={functions}
            parameters={parameters}
            setIntegralBounds={setIntegralBounds}
          />
        )}

        {/* MODE 4: MATRIX & STATISTICS */}
        {activeMode === 'matrix' && (
          <MatrixStatsPanel />
        )}

        {/* MODE 5: FRACTALS & CHAOS */}
        {activeMode === 'fractal' && (
          <FractalExplorer
            canvasRef={canvasFractalRef}
          />
        )}
      </main>

      {/* Preset Library Modal */}
      <PresetGallery
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onLoadPreset={handleLoadPreset}
      />
    </div>
  );
}
