import React, { useState } from 'react';
import { Delete, RotateCcw, ArrowRight } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

export default function Keypad({ 
  onInsert, 
  onClear, 
  onDelete, 
  onEvaluate, 
  angleUnit, 
  setAngleUnit, 
  memory, 
  setMemory 
}) {
  const [isSecond, setIsSecond] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'sci', 'calculus'

  const handleKeyPress = (val) => {
    soundSynth.playKeyClick(600, 0.02);
    onInsert(val);
  };

  const handleClear = () => {
    soundSynth.playKeyClick(400, 0.04);
    onClear();
  };

  const handleDelete = () => {
    soundSynth.playKeyClick(450, 0.02);
    onDelete();
  };

  const handleEval = () => {
    soundSynth.playSuccessChime();
    onEvaluate();
  };

  const keysMain = [
    { label: '2nd', action: () => setIsSecond(!isSecond), highlight: isSecond },
    { label: angleUnit, action: () => setAngleUnit(angleUnit === 'DEG' ? 'RAD' : 'DEG'), highlight: true },
    { label: '(', action: () => handleKeyPress('(') },
    { label: ')', action: () => handleKeyPress(')') },
    { label: 'AC', action: handleClear, color: 'bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border-rose-700/50' },

    { label: isSecond ? 'asin' : 'sin', action: () => handleKeyPress(isSecond ? 'asin(' : 'sin(') },
    { label: isSecond ? 'acos' : 'cos', action: () => handleKeyPress(isSecond ? 'acos(' : 'cos(') },
    { label: isSecond ? 'atan' : 'tan', action: () => handleKeyPress(isSecond ? 'atan(' : 'tan(') },
    { label: '^', action: () => handleKeyPress('^') },
    { label: '÷', action: () => handleKeyPress('/') },

    { label: '7', action: () => handleKeyPress('7'), num: true },
    { label: '8', action: () => handleKeyPress('8'), num: true },
    { label: '9', action: () => handleKeyPress('9'), num: true },
    { label: '×', action: () => handleKeyPress('*') },
    { label: isSecond ? 'x²' : '√', action: () => handleKeyPress(isSecond ? '^2' : 'sqrt(') },

    { label: '4', action: () => handleKeyPress('4'), num: true },
    { label: '5', action: () => handleKeyPress('5'), num: true },
    { label: '6', action: () => handleKeyPress('6'), num: true },
    { label: '-', action: () => handleKeyPress('-') },
    { label: isSecond ? '10^x' : 'log', action: () => handleKeyPress(isSecond ? '10^(' : 'log10(') },

    { label: '1', action: () => handleKeyPress('1'), num: true },
    { label: '2', action: () => handleKeyPress('2'), num: true },
    { label: '3', action: () => handleKeyPress('3'), num: true },
    { label: '+', action: () => handleKeyPress('+') },
    { label: isSecond ? 'e^x' : 'ln', action: () => handleKeyPress(isSecond ? 'exp(' : 'ln(') },

    { label: '0', action: () => handleKeyPress('0'), num: true },
    { label: '.', action: () => handleKeyPress('.'), num: true },
    { label: 'π', action: () => handleKeyPress('pi') },
    { label: 'x', action: () => handleKeyPress('x'), highlightVar: true },
    { label: '=', action: handleEval, color: 'bg-cyan-600 hover:bg-cyan-500 text-white font-bold border-cyan-400 shadow-md shadow-cyan-500/30' },
  ];

  const keysSci = [
    { label: 'sinh', action: () => handleKeyPress('sinh(') },
    { label: 'cosh', action: () => handleKeyPress('cosh(') },
    { label: 'tanh', action: () => handleKeyPress('tanh(') },
    { label: 'abs', action: () => handleKeyPress('abs(') },
    { label: 'n!', action: () => handleKeyPress('!') },

    { label: 'e', action: () => handleKeyPress('e') },
    { label: 'y', action: () => handleKeyPress('y') },
    { label: 't', action: () => handleKeyPress('t') },
    { label: 'theta', action: () => handleKeyPress('theta') },
    { label: 'a', action: () => handleKeyPress('a') },

    { label: 'MC', action: () => setMemory(0) },
    { label: 'MR', action: () => handleKeyPress(memory.toString()) },
    { label: 'M+', action: () => setMemory(m => m + 1) },
    { label: 'M-', action: () => setMemory(m => m - 1) },
    { label: 'Ans', action: () => handleKeyPress('Ans') }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex flex-col gap-2">
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
        <div className="flex gap-1">
          {['main', 'sci'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'main' ? 'Standard' : 'Scientific'}
            </button>
          ))}
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-md transition"
        >
          <Delete className="w-3.5 h-3.5" />
          <span>DEL</span>
        </button>
      </div>

      {/* Grid Keys */}
      {activeTab === 'main' && (
        <div className="grid grid-cols-5 gap-1.5">
          {keysMain.map((k, idx) => (
            <button
              key={idx}
              onClick={k.action}
              className={`py-2.5 px-1 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-95 flex items-center justify-center ${
                k.color 
                  ? k.color 
                  : k.highlight
                  ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700/60'
                  : k.highlightVar
                  ? 'bg-purple-950/80 hover:bg-purple-900 text-purple-300 border-purple-700/60'
                  : k.num
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border-slate-700/60 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-800'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'sci' && (
        <div className="grid grid-cols-5 gap-1.5">
          {keysSci.map((k, idx) => (
            <button
              key={idx}
              onClick={k.action}
              className="py-2.5 px-1 rounded-xl text-xs font-semibold bg-slate-800/70 hover:bg-slate-700 text-indigo-300 border border-slate-700/60 transition active:scale-95 flex items-center justify-center"
            >
              {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
