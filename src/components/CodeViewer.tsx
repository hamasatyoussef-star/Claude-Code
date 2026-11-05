import React, { useState } from 'react';
import { 
  FileCode, 
  GitCompare, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  FileText,
  Sparkles
} from 'lucide-react';
import { VirtualFile } from '../types';

interface CodeViewerProps {
  file?: VirtualFile;
  onUpdateFileContent: (path: string, newContent: string) => void;
  onResetFile: (path: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  file,
  onUpdateFileContent,
  onResetFile,
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'diff'>('code');
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0e1017] text-neutral-500 font-mono text-xs">
        <FileCode className="w-10 h-10 mb-2 opacity-40" />
        <p>Select a file from the workspace explorer to inspect code or git diffs.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const startEditing = () => {
    setEditBuffer(file.content);
    setIsEditing(true);
  };

  const saveEditing = () => {
    onUpdateFileContent(file.path, editBuffer);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Generate unified diff lines
  const originalLines = (file.originalContent || file.content).split('\n');
  const currentLines = file.content.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-[#0e1017] border-l border-neutral-800 h-full overflow-hidden">
      {/* File Viewer Toolbar */}
      <div className="h-10 px-4 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-200">
            {file.path.endsWith('.md') ? (
              <FileText className="w-4 h-4 text-emerald-400" />
            ) : (
              <FileCode className="w-4 h-4 text-sky-400" />
            )}
            <span>{file.path}</span>
            {file.isModified && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                Modified
              </span>
            )}
          </div>

          {/* Mode switch: Code vs Diff */}
          <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[11px]">
            <button
              onClick={() => setViewMode('code')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'code' ? 'bg-neutral-800 text-neutral-100 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'diff' ? 'bg-neutral-800 text-neutral-100 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              <span>Diff</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={saveEditing}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs flex items-center gap-1 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={cancelEditing}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-sans text-xs transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-sans transition-colors"
                title="Edit file manually"
              >
                Edit
              </button>
              {file.isModified && (
                <button
                  onClick={() => onResetFile(file.path)}
                  className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 text-xs font-sans flex items-center gap-1 transition-colors"
                  title="Revert to original content"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert</span>
                </button>
              )}
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Copy code"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Content Viewport */}
      <div className="flex-1 overflow-auto font-mono text-xs p-4 leading-relaxed bg-[#0c0e14]">
        {isEditing ? (
          <textarea
            value={editBuffer}
            onChange={(e) => setEditBuffer(e.target.value)}
            className="w-full h-full bg-transparent text-neutral-100 resize-none focus:outline-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        ) : viewMode === 'code' ? (
          <div className="space-y-0.5">
            {currentLines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-neutral-800/30 -mx-4 px-4 py-0.5 group">
                <span className="w-10 shrink-0 text-neutral-600 select-none text-right pr-4 font-mono group-hover:text-neutral-400">
                  {idx + 1}
                </span>
                <span className="text-neutral-200 whitespace-pre font-mono">{line || ' '}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Diff Mode View */
          <div className="space-y-0.5">
            {!file.isModified ? (
              <div className="text-neutral-500 italic p-4 text-center">
                No local modifications. File matches original repository commit.
              </div>
            ) : (
              <div>
                <div className="text-neutral-500 text-[11px] mb-3 pb-2 border-b border-neutral-800 font-sans">
                  Showing git diff against working tree base commit:
                </div>
                {/* Visual diff output */}
                {originalLines.map((line, idx) => {
                  const currentLine = currentLines[idx];
                  if (currentLine !== line) {
                    return (
                      <React.Fragment key={`diff-${idx}`}>
                        <div className="flex bg-rose-950/30 text-rose-300 -mx-4 px-4 py-0.5 border-l-2 border-rose-500">
                          <span className="w-10 shrink-0 text-rose-500/70 select-none text-right pr-4 font-mono">-</span>
                          <span className="whitespace-pre font-mono">{line || ' '}</span>
                        </div>
                        {currentLine !== undefined && (
                          <div className="flex bg-emerald-950/30 text-emerald-300 -mx-4 px-4 py-0.5 border-l-2 border-emerald-500">
                            <span className="w-10 shrink-0 text-emerald-500/70 select-none text-right pr-4 font-mono">+</span>
                            <span className="whitespace-pre font-mono">{currentLine || ' '}</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }
                  return (
                    <div key={`diff-same-${idx}`} className="flex text-neutral-400 -mx-4 px-4 py-0.5">
                      <span className="w-10 shrink-0 text-neutral-600 select-none text-right pr-4 font-mono">{idx + 1}</span>
                      <span className="whitespace-pre font-mono">{line || ' '}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
