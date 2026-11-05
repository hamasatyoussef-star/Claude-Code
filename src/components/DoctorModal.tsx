import React from 'react';
import { Stethoscope, CheckCircle2, AlertCircle, X, Terminal, Cpu, HardDrive } from 'lucide-react';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const checks = [
    { title: 'Node.js Runtime', detail: 'v22.12.0 (linux-x64)', status: 'pass' },
    { title: 'Git Version & Tracking', detail: 'git version 2.45.2 (clean worktree)', status: 'pass' },
    { title: 'CLAUDE.md Memory File', detail: 'Found at project root (26 lines indexed)', status: 'pass' },
    { title: 'Anthropic API Connectivity', detail: 'Endpoints reachable, latency 74ms', status: 'pass' },
    { title: 'Claude Code Tool Dispatcher', detail: 'Bash, Read, Edit, Grep, Glob enabled', status: 'pass' },
    { title: 'File System Permissions', detail: 'Read/Write access verified on /', status: 'pass' },
    { title: 'Context Window Headroom', detail: '182,450 tokens available in budget', status: 'pass' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#11141c] border border-neutral-750 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                Claude Code /doctor
                <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  ALL SYSTEMS NOMINAL
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Environment and toolchain diagnostic checks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Items */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {checks.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-medium text-neutral-200">{item.title}</div>
                <div className="text-neutral-400 font-mono text-[11px]">{item.detail}</div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 shrink-0 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px]">OK</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-mono">Exit code: 0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
