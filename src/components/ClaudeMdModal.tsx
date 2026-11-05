import React, { useState } from 'react';
import { FileText, X, Save, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ClaudeMdModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSave: (newContent: string) => void;
}

export const ClaudeMdModal: React.FC<ClaudeMdModalProps> = ({
  isOpen,
  onClose,
  content,
  onSave,
}) => {
  const [buffer, setBuffer] = useState(content);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(buffer);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#11141c] border border-neutral-750 rounded-xl shadow-2xl max-w-2xl w-full h-[75vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                CLAUDE.md Project Guidelines
                <span className="text-[10px] font-mono font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Agent Memory
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Claude Code reads this memory file on every tool dispatch to adhere to your project conventions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-4 bg-[#0c0e14] overflow-hidden">
          <textarea
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            className="w-full h-full bg-transparent text-neutral-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            {savedSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved to workspace memory
              </span>
            ) : (
              <span>Changes take effect immediately across all agent prompts.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
