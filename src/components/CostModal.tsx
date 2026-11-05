import React from 'react';
import { DollarSign, X, Cpu, Layers, Zap, Sparkles } from 'lucide-react';
import { SessionStats, ClaudeModel } from '../types';

interface CostModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats;
  currentModel: ClaudeModel;
}

export const CostModal: React.FC<CostModalProps> = ({
  isOpen,
  onClose,
  stats,
  currentModel,
}) => {
  if (!isOpen) return null;

  const totalTokens = stats.inputTokens + stats.outputTokens + stats.thinkingTokens;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#11141c] border border-neutral-750 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">Session Usage &amp; Cost</h3>
              <p className="text-[11px] text-neutral-400">Tokens, cache metrics and billing estimation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost Stats */}
        <div className="p-5 space-y-4">
          {/* Main Total Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Total Estimated Cost</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-0.5">
                ${stats.totalCost.toFixed(4)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 font-medium">Model</span>
              <div className="text-xs font-semibold text-neutral-200 mt-0.5">{currentModel}</div>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block mt-1">
                Active Prompt Caching
              </span>
            </div>
          </div>

          {/* Token Breakdown Table */}
          <div className="rounded-lg border border-neutral-800 overflow-hidden text-xs font-mono">
            <div className="bg-neutral-900/80 px-3 py-2 border-b border-neutral-800 text-[11px] font-sans font-semibold text-neutral-400 flex justify-between">
              <span>Token Metric</span>
              <span>Count</span>
            </div>
            <div className="divide-y divide-neutral-850 bg-neutral-950/40">
              <div className="px-3 py-2 flex justify-between text-neutral-300">
                <span className="font-sans text-neutral-400">Input Tokens (Uncached)</span>
                <span>{stats.inputTokens.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between text-neutral-300">
                <span className="font-sans text-neutral-400">Cache Read Tokens (90% off)</span>
                <span className="text-emerald-400 font-semibold">{stats.cacheReadTokens.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between text-neutral-300">
                <span className="font-sans text-neutral-400">Thinking / Reasoning Tokens</span>
                <span className="text-purple-400 font-semibold">{stats.thinkingTokens.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between text-neutral-300">
                <span className="font-sans text-neutral-400">Output Tokens</span>
                <span>{stats.outputTokens.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between font-bold bg-neutral-900/40 text-neutral-100">
                <span className="font-sans text-neutral-300">Total Processed Tokens</span>
                <span>{totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Efficiency indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-medium">Cache Efficiency</div>
              <div className="text-base font-bold text-neutral-200 mt-0.5">89.4%</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Saved ~$0.18 on context</div>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-medium">Tool Dispatch Count</div>
              <div className="text-base font-bold text-neutral-200 mt-0.5">{stats.toolCallsCount} executed</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">avg 1.2s latency</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
