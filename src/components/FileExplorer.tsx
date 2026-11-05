import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FileJson, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  GitCommit, 
  Search,
  FilePlus,
  RotateCcw
} from 'lucide-react';
import { VirtualFile } from '../types';

interface FileExplorerProps {
  files: VirtualFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onResetFile: (path: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onResetFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({});

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.js')) {
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (fileName.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (fileName.endsWith('.md')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-neutral-400 shrink-0" />;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-neutral-800 bg-[#0b0d12] flex flex-col h-full select-none">
      {/* Explorer Header */}
      <div className="px-3 py-2.5 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Workspace Files</span>
        <span className="text-[11px] font-mono text-neutral-500">{files.length} items</span>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-transparent focus:outline-none placeholder:text-neutral-600 text-xs"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 font-mono text-xs">
        {filteredFiles.map((file) => {
          const isActive = activeFilePath === file.path;
          const isModified = file.isModified;

          return (
            <div
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-850 hover:text-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(file.name)}
                <span className="truncate">{file.path.replace(/^\//, '')}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isModified && (
                  <span 
                    title="Modified by Claude Code"
                    className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                  />
                )}
                {isModified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetFile(file.path);
                    }}
                    title="Revert modifications to original"
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-neutral-300 transition-opacity"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info: Git status & CLAUDE.md memory */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950/60 text-[11px] text-neutral-400 space-y-1.5 font-sans">
        <div className="flex items-center justify-between text-neutral-300">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
            <span>git:main</span>
          </span>
          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">clean</span>
        </div>
        <p className="text-[10px] text-neutral-500 leading-tight">
          Claude Code reads <span className="text-amber-400 font-mono">CLAUDE.md</span> at workspace root for agent instructions.
        </p>
      </div>
    </div>
  );
};
