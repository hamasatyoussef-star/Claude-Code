export type ClaudeModel = 'claude-3-7-sonnet' | 'claude-3-5-sonnet' | 'claude-3-5-haiku';

export type ToolType = 'bash' | 'read' | 'edit' | 'write' | 'grep' | 'glob' | 'todo';

export interface ToolCall {
  id: string;
  tool: ToolType;
  title: string;
  command?: string;
  filePath?: string;
  diff?: {
    original: string;
    modified: string;
  };
  output?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'denied';
  requiresPermission?: boolean;
}

export interface TerminalMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'claude' | 'system' | 'tool';
  content: string;
  thinking?: string;
  isThinkingExpanded?: boolean;
  toolCalls?: ToolCall[];
  costDelta?: number;
  tokensDelta?: {
    input: number;
    output: number;
    thinking?: number;
  };
}

export interface VirtualFile {
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent?: string;
  isModified?: boolean;
  isDir?: boolean;
  children?: VirtualFile[];
}

export interface ScenarioStep {
  delayMs: number;
  thinking?: string;
  response?: string;
  toolCalls?: ToolCall[];
  fileModifications?: {
    path: string;
    newContent: string;
  }[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  badge: string;
  initialPrompt: string;
  steps: ScenarioStep[];
}

export interface SessionStats {
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  durationSeconds: number;
  toolCallsCount: number;
}
