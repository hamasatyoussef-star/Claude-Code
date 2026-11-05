import React from 'react';
import { Sparkles, X, Play, ArrowRight, ShieldCheck, Gauge, FileCode } from 'lucide-react';
import { scenarios } from '../data/mockProject';
import { Scenario } from '../types';

interface ScenarioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  isExecuting: boolean;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  isExecuting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-[#11141c] border-l border-neutral-750 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-neutral-100">Agentic Coding Tasks</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Scenarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-neutral-400 font-sans mb-3">
            Choose a pre-configured coding scenario to watch Claude Code plan, inspect repository files, execute bash commands, and generate unified git diffs in real time.
          </p>

          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-300 transition-colors">
                    {scenario.title}
                  </span>
                  <span className="text-[10px] font-medium font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    {scenario.badge}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-400 font-sans leading-relaxed">
                  {scenario.description}
                </p>
                <div className="mt-3 p-2 bg-neutral-950 rounded border border-neutral-800/80 font-mono text-[11px] text-neutral-300 truncate">
                  <span className="text-amber-400">&gt; </span>
                  {scenario.initialPrompt}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-sans">
                  {scenario.steps.length} automated steps + validation
                </span>
                <button
                  onClick={() => {
                    onSelectScenario(scenario);
                    onClose();
                  }}
                  disabled={isExecuting}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isExecuting
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom prompt hint */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 text-xs text-neutral-400 font-sans">
          💡 You can also type any arbitrary request in the terminal prompt (e.g. &ldquo;review recent git diffs&rdquo;, &ldquo;check for unhandled exceptions in routes&rdquo;, or &ldquo;/doctor&rdquo;).
        </div>
      </div>
    </div>
  );
};
