import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Terminal as TerminalIcon, 
  FileCode, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  CornerDownLeft, 
  BrainCircuit, 
  Play, 
  Sparkles, 
  ShieldAlert,
  Search,
  CheckCircle2,
  List
} from 'lucide-react';
import { TerminalMessage, ToolCall, ClaudeModel } from '../types';
import { slashCommands } from '../data/mockProject';

interface TerminalProps {
  messages: TerminalMessage[];
  isExecuting: boolean;
  onSendMessage: (text: string) => void;
  onPermissionDecision: (toolCallId: string, decision: 'allow' | 'allow-always' | 'deny') => void;
  onClear: () => void;
  currentModel: ClaudeModel;
}

export const TerminalComponent: React.FC<TerminalProps> = ({
  messages,
  isExecuting,
  onSendMessage,
  onPermissionDecision,
  onClear,
  currentModel
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  // Handle slash command suggestions
  useEffect(() => {
    if (input.startsWith('/') && input.length <= 8) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const trimmed = input.trim();
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');
    setShowSlashMenu(false);
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(nextIndex);
          setInput(history[nextIndex]);
        }
      }
    } else if (e.key === 'Tab' && showSlashMenu) {
      e.preventDefault();
      const filtered = slashCommands.filter(c => c.command.startsWith(input));
      if (filtered.length > 0) {
        setInput(filtered[0].command + ' ');
      }
    }
  };

  const toggleThinking = (id: string) => {
    setExpandedThinking(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSlashCommands = slashCommands.filter(c => 
    c.command.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0d0f14] font-mono text-sm overflow-hidden select-text">
      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Claude Code Terminal Welcome Banner */}
        <div className="border border-neutral-800 rounded-lg p-3 bg-neutral-900/40 text-xs">
          <div className="text-amber-400 font-bold flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Claude Code CLI (v0.2.29-preview)
            </span>
            <span className="text-neutral-500 font-normal">Anthropic AI</span>
          </div>
          <div className="text-neutral-400">
            Agentic coding engine with tool execution, project memory (CLAUDE.md), and diff validation.
          </div>
          <div className="mt-2 text-neutral-500 text-[11px] flex flex-wrap gap-2">
            <span>Model: <span className="text-neutral-300 font-semibold">{currentModel}</span></span>
            <span>•</span>
            <span>Working dir: <span className="text-neutral-300">~/enterprise-api</span></span>
            <span>•</span>
            <span>Branch: <span className="text-neutral-300">main</span></span>
          </div>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2.5">
            {/* User message */}
            {msg.sender === 'user' && (
              <div className="flex items-start gap-2.5 text-neutral-100 bg-neutral-900/60 rounded-lg p-3 border border-neutral-800/80">
                <span className="text-amber-400 font-bold select-none">&gt;</span>
                <div className="flex-1 whitespace-pre-wrap">{msg.content}</div>
                <span className="text-[10px] text-neutral-500 font-sans select-none">{msg.timestamp}</span>
              </div>
            )}

            {/* System message */}
            {msg.sender === 'system' && (
              <div className="text-xs text-sky-400 bg-sky-950/20 border border-sky-900/40 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>System Output</span>
                </div>
                <div className="whitespace-pre-wrap font-mono text-[12px]">{msg.content}</div>
              </div>
            )}

            {/* Claude Agent Response */}
            {msg.sender === 'claude' && (
              <div className="space-y-3">
                {/* Thinking Accordion (Claude 3.7 Hybrid Reasoning) */}
                {msg.thinking && (
                  <div className="border border-neutral-800 bg-neutral-900/30 rounded-lg overflow-hidden text-xs">
                    <button
                      onClick={() => toggleThinking(msg.id)}
                      className="w-full px-3 py-2 bg-neutral-900/60 hover:bg-neutral-850 flex items-center justify-between text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-semibold text-neutral-300">Claude Thinking Process</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {msg.tokensDelta?.thinking || 420} tokens
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                        <span>{expandedThinking[msg.id] ? 'Hide' : 'Inspect reasoning'}</span>
                        {expandedThinking[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                    {expandedThinking[msg.id] && (
                      <div className="p-3 text-neutral-400 font-sans text-xs whitespace-pre-line border-t border-neutral-800 bg-neutral-950/50 leading-relaxed">
                        {msg.thinking}
                      </div>
                    )}
                  </div>
                )}

                {/* Tool Calls Execution Cards */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2">
                    {msg.toolCalls.map((tool) => (
                      <div 
                        key={tool.id} 
                        className={`rounded-lg border text-xs overflow-hidden ${
                          tool.status === 'failed' 
                            ? 'border-rose-900/60 bg-rose-950/10'
                            : tool.status === 'running'
                            ? 'border-amber-600/60 bg-amber-950/10'
                            : 'border-neutral-800 bg-neutral-900/50'
                        }`}
                      >
                        {/* Tool Header */}
                        <div className="px-3 py-2 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {tool.tool === 'bash' && <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />}
                            {tool.tool === 'read' && <FileCode className="w-3.5 h-3.5 text-sky-400" />}
                            {tool.tool === 'edit' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                            {tool.tool === 'write' && <FileCode className="w-3.5 h-3.5 text-purple-400" />}
                            {tool.tool === 'grep' && <Search className="w-3.5 h-3.5 text-indigo-400" />}

                            <span className="font-semibold text-neutral-200">{tool.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {tool.status === 'running' && (
                              <span className="flex items-center gap-1 text-[11px] text-amber-400 animate-pulse">
                                <Clock className="w-3 h-3" /> Running...
                              </span>
                            )}
                            {tool.status === 'success' && (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            )}
                            {tool.status === 'denied' && (
                              <span className="flex items-center gap-1 text-[11px] text-rose-400">
                                <X className="w-3 h-3" /> Permission Denied
                              </span>
                            )}
                            {tool.status === 'pending' && tool.requiresPermission && (
                              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                                <ShieldAlert className="w-3.5 h-3.5" /> Awaiting Permission
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tool Content / Diff / Output */}
                        <div className="p-3 font-mono text-[11px] space-y-2">
                          {tool.command && (
                            <div className="text-neutral-400 flex items-center gap-1.5">
                              <span className="text-neutral-600">$</span>
                              <span className="text-neutral-200 font-semibold">{tool.command}</span>
                            </div>
                          )}

                          {/* Diff preview for EditTool */}
                          {tool.diff && (
                            <div className="border border-neutral-800 rounded bg-[#090a0e] p-2 space-y-1 font-mono text-[11px]">
                              <div className="text-neutral-500 text-[10px] mb-1 font-sans">Unified Diff Preview:</div>
                              {tool.diff.original.split('\n').map((line, idx) => (
                                <div key={`orig-${idx}`} className="text-rose-400/90 bg-rose-950/20 px-1 rounded flex">
                                  <span className="select-none text-rose-700 w-4">-</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                              {tool.diff.modified.split('\n').map((line, idx) => (
                                <div key={`mod-${idx}`} className="text-emerald-400/90 bg-emerald-950/20 px-1 rounded flex">
                                  <span className="select-none text-emerald-600 w-4">+</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Output */}
                          {tool.output && (
                            <div className="bg-[#090a0e] border border-neutral-800/80 rounded p-2 text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {tool.output}
                            </div>
                          )}

                          {/* Interactive Permission Prompt */}
                          {tool.requiresPermission && tool.status === 'pending' && (
                            <div className="mt-2 p-3 bg-amber-950/30 border border-amber-600/40 rounded-lg space-y-2.5">
                              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                                <span>Claude Code is requesting approval to modify {tool.filePath || 'files'}</span>
                              </div>
                              <p className="text-neutral-400 text-[11px] font-sans">
                                Review the proposed unified diff above. Confirming will write changes to the workspace.
                              </p>
                              <div className="flex items-center gap-2 pt-1 font-sans">
                                <button
                                  onClick={() => onPermissionDecision(tool.id, 'allow')}
                                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Allow Once (y)</span>
                                </button>
                                <button
                                  onClick={() => onPermissionDecision(tool.id, 'allow-always')}
                                  className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                                >
                                  <span>Always Allow for Session (a)</span>
                                </button>
                                <button
                                  onClick={() => onPermissionDecision(tool.id, 'deny')}
                                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-rose-950/50 hover:text-rose-400 text-neutral-400 text-xs border border-neutral-800 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Deny (n)</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Claude's Text Content */}
                {msg.content && (
                  <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans text-sm bg-neutral-900/30 p-3 rounded-lg border border-neutral-800/40">
                    {msg.content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Live Execution Status Indicator */}
        {isExecuting && (
          <div className="flex items-center gap-2.5 text-xs text-amber-400 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-semibold">Claude Code is analyzing codebase and executing tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Slash Command Autocomplete Popover */}
      {showSlashMenu && (
        <div className="mx-4 mb-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
          <div className="px-3 py-1.5 bg-neutral-800/80 text-[11px] text-neutral-400 font-semibold border-b border-neutral-700 flex justify-between">
            <span>Claude Code Commands</span>
            <span>Press Tab to autocomplete</span>
          </div>
          {filteredSlashCommands.map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => {
                setInput(cmd.command + ' ');
                setShowSlashMenu(false);
                inputRef.current?.focus();
              }}
              className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center justify-between text-xs transition-colors border-b border-neutral-800/50 last:border-b-0"
            >
              <span className="font-mono text-amber-400 font-bold">{cmd.command}</span>
              <span className="text-neutral-400 font-sans text-[11px] truncate ml-3">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Command Prompt Input Bar */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-neutral-900/90 border border-neutral-750 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/40 rounded-lg px-3 py-2 transition-all">
            <span className="text-amber-500 font-bold select-none">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isExecuting ? "Claude Code is running..." : "Type /help or describe coding tasks (e.g. 'audit jwt token', 'add rate limiter')..."}
              disabled={isExecuting}
              className="flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-500 text-sm focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isExecuting}
            className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
              input.trim() && !isExecuting
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <span>Run</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 px-1 font-sans">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px]">↑/↓</kbd> History</span>
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px]">Tab</kbd> Autocomplete</span>
            <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px]">/help</kbd> Commands</span>
          </div>
          <button 
            onClick={onClear}
            className="hover:text-neutral-300 transition-colors"
          >
            Clear Screen
          </button>
        </div>
      </div>
    </div>
  );
};
