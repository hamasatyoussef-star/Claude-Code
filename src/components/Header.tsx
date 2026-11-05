import React from 'react';
import { 
  Terminal, 
  Cpu, 
  DollarSign, 
  Sparkles, 
  Stethoscope, 
  FileText, 
  RotateCcw, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { ClaudeModel, SessionStats } from '../types';

interface HeaderProps {
  currentModel: ClaudeModel;
  onModelChange: (model: ClaudeModel) => void;
  stats: SessionStats;
  onOpenDoctor: () => void;
  onOpenCost: () => void;
  onToggleClaudeMd: () => void;
  isClaudeMdOpen: boolean;
  onResetProject: () => void;
  onOpenScenarios: () => void;
  activeModifiedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onModelChange,
  stats,
  onOpenDoctor,
  onOpenCost,
  onToggleClaudeMd,
  isClaudeMdOpen,
  onResetProject,
  onOpenScenarios,
  activeModifiedCount
}) => {
  const modelLabels: Record<ClaudeModel, { name: string; tag: string; color: string }> = {
    'claude-3-7-sonnet': { name: 'Claude 3.7 Sonnet', tag: 'Hybrid Thinking', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', tag: 'High Speed', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    'claude-3-5-haiku': { name: 'Claude 3.5 Haiku', tag: 'Ultra Fast', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  };

  const contextPercent = Math.min(100, Math.round(((stats.inputTokens + stats.outputTokens) / 200000) * 100));

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950 px-4 flex items-center justify-between select-none">
      {/* Brand & Workspace */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-500/40">
            <span className="font-mono text-white font-bold text-sm leading-none">&gt;_</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-neutral-100 flex items-center gap-1.5">
                Claude Code
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-normal border border-neutral-700">
                  v0.2.29
                </span>
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>~/enterprise-api</span>
              <span className="text-neutral-600">|</span>
              <span className="text-amber-400/90 font-sans text-[11px]">git:(main)</span>
              {activeModifiedCount > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                  {activeModifiedCount} modified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="relative ml-2">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            {(['claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-3-5-haiku'] as ClaudeModel[]).map((m) => {
              const active = currentModel === m;
              return (
                <button
                  key={m}
                  onClick={() => onModelChange(m)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? `${modelLabels[m].color} border shadow-sm font-semibold`
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                  title={`Switch to ${modelLabels[m].name}`}
                >
                  <Cpu className="w-3 h-3" />
                  <span>{m === 'claude-3-7-sonnet' ? '3.7 Sonnet' : m === 'claude-3-5-sonnet' ? '3.5 Sonnet' : '3.5 Haiku'}</span>
                  {active && m === 'claude-3-7-sonnet' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      Thinking
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telemetry Stats & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Context Window Gauge */}
        <div 
          onClick={onOpenCost}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors text-xs"
          title="Click to inspect token usage & cost"
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 text-[10px] text-neutral-400">
              <span>Context</span>
              <span className="font-mono text-neutral-300 font-medium">
                {((stats.inputTokens + stats.outputTokens) / 1000).toFixed(1)}k / 200k
              </span>
            </div>
            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.max(4, contextPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cost Badge */}
        <button
          onClick={onOpenCost}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 text-xs font-mono text-neutral-300 transition-colors"
          title="Session cost"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>${stats.totalCost.toFixed(3)}</span>
        </button>

        {/* CLAUDE.md toggle */}
        <button
          onClick={onToggleClaudeMd}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            isClaudeMdOpen 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
          }`}
          title="View and edit CLAUDE.md project guidelines"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>CLAUDE.md</span>
        </button>

        {/* Quick Scenarios */}
        <button
          onClick={onOpenScenarios}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-800/50 text-xs font-medium text-amber-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tasks &amp; Scenarios</span>
        </button>

        {/* Doctor */}
        <button
          onClick={onOpenDoctor}
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 transition-colors"
          title="Run /doctor diagnostics"
        >
          <Stethoscope className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={onResetProject}
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 text-neutral-400 hover:text-rose-400 transition-colors"
          title="Reset project workspace files"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
