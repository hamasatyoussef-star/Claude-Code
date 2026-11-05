import { useState } from 'react';
import { Header } from './components/Header';
import { TerminalComponent } from './components/Terminal';
import { FileExplorer } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';
import { DoctorModal } from './components/DoctorModal';
import { CostModal } from './components/CostModal';
import { ClaudeMdModal } from './components/ClaudeMdModal';
import { ScenarioDrawer } from './components/ScenarioDrawer';
import { initialProjectFiles, initialClaudeMd } from './data/mockProject';
import { 
  VirtualFile, 
  TerminalMessage, 
  SessionStats, 
  ClaudeModel, 
  Scenario,
  ToolCall 
} from './types';

export default function App() {
  const [files, setFiles] = useState<VirtualFile[]>(initialProjectFiles);
  const [activeFilePath, setActiveFilePath] = useState<string>('/src/auth/jwt.ts');
  const [currentModel, setCurrentModel] = useState<ClaudeModel>('claude-3-7-sonnet');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isCostOpen, setIsCostOpen] = useState(false);
  const [isClaudeMdOpen, setIsClaudeMdOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const [autoApproveAlways, setAutoApproveAlways] = useState(false);

  // Active scenario execution pointer
  const [pendingScenario, setPendingScenario] = useState<{
    scenario: Scenario;
    currentStepIndex: number;
  } | null>(null);

  const [stats, setStats] = useState<SessionStats>({
    inputTokens: 18450,
    outputTokens: 4230,
    thinkingTokens: 1980,
    cacheReadTokens: 16500,
    totalCost: 0.048,
    durationSeconds: 142,
    toolCallsCount: 4,
  });

  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: 'init-msg',
      timestamp: '14:38',
      sender: 'claude',
      content: `Welcome to Claude Code. I'm connected to your local enterprise-api repository.
I have read your project memory at CLAUDE.md. You can ask me to write code, review diffs, run tests, diagnose issues, or refactor components.

Quick start commands:
• Type /help to see all commands and keyboard shortcuts
• Click "Tasks & Scenarios" in the top bar to run interactive coding tasks
• Type any command (e.g. "audit jwt token", "run test suite", "check git status")`,
      thinking: `Project workspace initialized:
- Root directory: ~/enterprise-api
- Git branch: main (tracking origin/main)
- CLAUDE.md detected and loaded into agent context window
- Configured models: Claude 3.7 Sonnet (Hybrid Reasoning enabled), 3.5 Sonnet, 3.5 Haiku
- Tool capabilities: Bash, FileView, FileEdit, GlobTool, GrepTool`,
      toolCalls: [
        {
          id: 'tool-init-1',
          tool: 'bash',
          title: 'Bash: git status --porcelain',
          command: 'git status --porcelain',
          output: 'Workspace tree clean (branch: main)',
          status: 'success'
        },
        {
          id: 'tool-init-2',
          tool: 'read',
          title: 'Read: /CLAUDE.md',
          filePath: '/CLAUDE.md',
          output: 'Indexed 26 lines of project conventions and test commands.',
          status: 'success'
        }
      ]
    }
  ]);

  const activeFile = files.find(f => f.path === activeFilePath) || files[0];
  const activeModifiedCount = files.filter(f => f.isModified).length;

  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
  };

  const handleUpdateFileContent = (path: string, newContent: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path === path) {
        return {
          ...f,
          content: newContent,
          isModified: f.originalContent ? f.originalContent !== newContent : true
        };
      }
      return f;
    }));
  };

  const handleResetFile = (path: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path === path && f.originalContent) {
        return {
          ...f,
          content: f.originalContent,
          isModified: false
        };
      }
      return f;
    }));
  };

  const handleResetAllFiles = () => {
    setFiles(initialProjectFiles);
    setActiveFilePath('/src/auth/jwt.ts');
  };

  // Helper to execute scenario steps sequentially
  const runScenarioStep = (scenario: Scenario, stepIndex: number) => {
    if (stepIndex >= scenario.steps.length) {
      setIsExecuting(false);
      setPendingScenario(null);
      return;
    }

    const step = scenario.steps[stepIndex];
    setIsExecuting(true);

    setTimeout(() => {
      // Check if step has a tool call requiring permission
      const hasPermissionReq = step.toolCalls?.some(t => t.requiresPermission) && !autoApproveAlways;

      const newMsgId = `scenario-${scenario.id}-step-${stepIndex}-${Date.now()}`;
      const newMsg: TerminalMessage = {
        id: newMsgId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'claude',
        content: step.response || '',
        thinking: step.thinking,
        toolCalls: step.toolCalls ? step.toolCalls.map(t => ({
          ...t,
          status: t.requiresPermission && !autoApproveAlways ? 'pending' : (t.status || 'success')
        })) : [],
        tokensDelta: {
          input: 850,
          output: 320,
          thinking: step.thinking ? 450 : 0
        }
      };

      setMessages(prev => [...prev, newMsg]);

      // Update session stats
      setStats(prev => ({
        ...prev,
        inputTokens: prev.inputTokens + 850,
        outputTokens: prev.outputTokens + 320,
        thinkingTokens: prev.thinkingTokens + (step.thinking ? 450 : 0),
        totalCost: prev.totalCost + 0.006,
        toolCallsCount: prev.toolCallsCount + (step.toolCalls?.length || 0)
      }));

      if (hasPermissionReq) {
        // Pause and await permission decision
        setPendingScenario({ scenario, currentStepIndex: stepIndex });
        setIsExecuting(false);
      } else {
        // Apply modifications immediately
        if (step.fileModifications) {
          step.fileModifications.forEach(mod => {
            handleUpdateFileContent(mod.path, mod.newContent);
            setActiveFilePath(mod.path);
          });
        }

        // Proceed to next step
        runScenarioStep(scenario, stepIndex + 1);
      }
    }, step.delayMs || 1000);
  };

  const handleSelectScenario = (scenario: Scenario) => {
    if (isExecuting) return;

    // Post user prompt message
    const userMsg: TerminalMessage = {
      id: `user-scenario-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      content: scenario.initialPrompt
    };
    setMessages(prev => [...prev, userMsg]);

    // Kick off scenario steps
    runScenarioStep(scenario, 0);
  };

  // Permission decision handler for pending tool calls
  const handlePermissionDecision = (toolCallId: string, decision: 'allow' | 'allow-always' | 'deny') => {
    if (decision === 'allow-always') {
      setAutoApproveAlways(true);
    }

    setMessages(prev => prev.map(msg => {
      if (!msg.toolCalls) return msg;
      const updatedTools = msg.toolCalls.map(tool => {
        if (tool.id === toolCallId) {
          return {
            ...tool,
            status: (decision === 'deny' ? 'denied' : 'success') as ToolCall['status']
          };
        }
        return tool;
      });
      return { ...msg, toolCalls: updatedTools };
    }));

    if (decision === 'deny') {
      setPendingScenario(null);
      setIsExecuting(false);
      setMessages(prev => [...prev, {
        id: `sys-deny-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'system',
        content: `Tool execution cancelled by user. Workspace files were NOT modified.`
      }]);
      return;
    }

    // Apply pending step file modifications
    if (pendingScenario) {
      const step = pendingScenario.scenario.steps[pendingScenario.currentStepIndex];
      if (step.fileModifications) {
        step.fileModifications.forEach(mod => {
          handleUpdateFileContent(mod.path, mod.newContent);
          setActiveFilePath(mod.path);
        });
      }

      // Resume next step
      runScenarioStep(pendingScenario.scenario, pendingScenario.currentStepIndex + 1);
    }
  };

  // Handle arbitrary prompts or slash commands
  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Post user message
    const userMsg: TerminalMessage = {
      id: `usr-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      content: trimmed
    };
    setMessages(prev => [...prev, userMsg]);

    // Handle slash commands
    if (trimmed === '/clear') {
      setMessages([]);
      return;
    }

    if (trimmed === '/help') {
      setMessages(prev => [...prev, {
        id: `sys-help-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'system',
        content: `Claude Code Commands & Shortcuts:
• /help     - Show this help summary
• /cost     - Show total token usage and billing analytics
• /doctor   - Run health diagnostics on git, runtime environment & API
• /init     - View or initialize CLAUDE.md project memory
• /review   - Review pending git diffs in working tree
• /status   - Show current branch, active model and modified files
• /clear    - Clear terminal messages

Keyboard Shortcuts:
• Up/Down Arrow: Navigate command history
• Tab: Autocomplete slash commands
• Enter: Run command or submit prompt`
      }]);
      return;
    }

    if (trimmed === '/doctor') {
      setIsDoctorOpen(true);
      return;
    }

    if (trimmed === '/cost') {
      setIsCostOpen(true);
      return;
    }

    if (trimmed === '/init') {
      setIsClaudeMdOpen(true);
      return;
    }

    if (trimmed === '/status') {
      const modFiles = files.filter(f => f.isModified).map(f => f.path);
      setMessages(prev => [...prev, {
        id: `sys-status-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'system',
        content: `Repository Status:
• Working Directory: ~/enterprise-api
• Branch: main (synced with remote)
• Active Model: ${currentModel}
• Modified Files (${modFiles.length}): ${modFiles.length > 0 ? modFiles.join(', ') : 'None (clean worktree)'}
• CLAUDE.md: Loaded and indexed`
      }]);
      return;
    }

    if (trimmed === '/review') {
      const modFiles = files.filter(f => f.isModified);
      if (modFiles.length === 0) {
        setMessages(prev => [...prev, {
          id: `sys-rev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'system',
          content: 'No uncommitted changes in workspace tree to review.'
        }]);
      } else {
        setActiveFilePath(modFiles[0].path);
        setMessages(prev => [...prev, {
          id: `sys-rev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'system',
          content: `Opened diff review for ${modFiles.map(f => f.path).join(', ')} in the Code/Diff viewer on the right.`
        }]);
      }
      return;
    }

    // Dynamic prompt simulation
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      const isTestReq = /test|jest|pass/i.test(trimmed);
      const isAuditReq = /audit|jwt|security|auth/i.test(trimmed);
      const isBuildReq = /build|tsc|compile/i.test(trimmed);

      let toolCalls: ToolCall[] = [];
      let replyContent = '';
      let thinking = '';

      if (isTestReq) {
        toolCalls = [
          {
            id: `tool-${Date.now()}-1`,
            tool: 'bash',
            title: 'Bash: npm run test',
            command: 'npm run test',
            output: `PASS tests/auth.test.ts
  Auth Service Security Tests
    ✓ Token should include expiry and subject claims (4 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.942 s
Ran all test suites.`,
            status: 'success'
          }
        ];
        thinking = `User asked to test the suite.
Running Jest via npm run test.
Checking exit code and test suite output.`;
        replyContent = `Ran Jest test suite: all 1 suite and 1 test passed successfully with zero errors.`;
      } else if (isAuditReq) {
        toolCalls = [
          {
            id: `tool-${Date.now()}-2`,
            tool: 'read',
            title: 'FileView: src/auth/jwt.ts',
            filePath: '/src/auth/jwt.ts',
            output: `Reading /src/auth/jwt.ts...
Verifying token expiration, signature algorithm HS256, and issuer enterprise-auth-service.`,
            status: 'success'
          }
        ];
        thinking = `Inspecting /src/auth/jwt.ts for cryptographic hygiene and JWT standard claims.
Checking accordance with CLAUDE.md conventions.`;
        replyContent = `I inspected \`src/auth/jwt.ts\`. The service uses HMAC SHA-256 JWT validation with Bearer token authentication, complying with CLAUDE.md security constraints.`;
      } else if (isBuildReq) {
        toolCalls = [
          {
            id: `tool-${Date.now()}-3`,
            tool: 'bash',
            title: 'Bash: npm run build',
            command: 'npm run build',
            output: `> enterprise-api@2.4.0 build
> tsc

✨ TypeScript compilation completed successfully (0 errors).`,
            status: 'success'
          }
        ];
        thinking = `Invoking TypeScript compiler 'tsc' to ensure zero type errors.`;
        replyContent = `Compiled project with TypeScript: 0 errors found. Build output ready in dist/.`;
      } else {
        toolCalls = [
          {
            id: `tool-${Date.now()}-4`,
            tool: 'grep',
            title: `GrepTool: "${trimmed.slice(0, 20)}"`,
            command: `grep -rn "${trimmed.slice(0, 20)}" src/`,
            output: `Found matches across 2 project files in src/`,
            status: 'success'
          }
        ];
        thinking = `User entered: "${trimmed}".
Searching workspace tree and consulting CLAUDE.md architecture rules.`;
        replyContent = `I processed your request regarding "${trimmed}". I inspected the workspace structure and confirmed your project configuration conforms to the guidelines set in CLAUDE.md. You can also pick a specific task from "Tasks & Scenarios" above.`;
      }

      setMessages(prev => [...prev, {
        id: `claude-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'claude',
        content: replyContent,
        thinking,
        toolCalls,
        tokensDelta: {
          input: 720,
          output: 240,
          thinking: 310
        }
      }]);

      setStats(prev => ({
        ...prev,
        inputTokens: prev.inputTokens + 720,
        outputTokens: prev.outputTokens + 240,
        thinkingTokens: prev.thinkingTokens + 310,
        totalCost: prev.totalCost + 0.004,
        toolCallsCount: prev.toolCallsCount + toolCalls.length
      }));
    }, 1100);
  };

  const handleSaveClaudeMd = (newContent: string) => {
    handleUpdateFileContent('/CLAUDE.md', newContent);
    setIsClaudeMdOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0c10] text-neutral-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        stats={stats}
        onOpenDoctor={() => setIsDoctorOpen(true)}
        onOpenCost={() => setIsCostOpen(true)}
        onToggleClaudeMd={() => setIsClaudeMdOpen(prev => !prev)}
        isClaudeMdOpen={isClaudeMdOpen}
        onResetProject={handleResetAllFiles}
        onOpenScenarios={() => setIsScenariosOpen(true)}
        activeModifiedCount={activeModifiedCount}
      />

      {/* Main Workspace Split Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Project File Explorer */}
        <FileExplorer
          files={files}
          activeFilePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onResetFile={handleResetFile}
        />

        {/* Center: Interactive Claude Code Terminal */}
        <TerminalComponent
          messages={messages}
          isExecuting={isExecuting}
          onSendMessage={handleSendMessage}
          onPermissionDecision={handlePermissionDecision}
          onClear={() => setMessages([])}
          currentModel={currentModel}
        />

        {/* Right: Code & Git Diff Inspector */}
        <CodeViewer
          file={activeFile}
          onUpdateFileContent={handleUpdateFileContent}
          onResetFile={handleResetFile}
        />
      </div>

      {/* Modals & Drawers */}
      <DoctorModal
        isOpen={isDoctorOpen}
        onClose={() => setIsDoctorOpen(false)}
      />

      <CostModal
        isOpen={isCostOpen}
        onClose={() => setIsCostOpen(false)}
        stats={stats}
        currentModel={currentModel}
      />

      <ClaudeMdModal
        isOpen={isClaudeMdOpen}
        onClose={() => setIsClaudeMdOpen(false)}
        content={files.find(f => f.path === '/CLAUDE.md')?.content || initialClaudeMd}
        onSave={handleSaveClaudeMd}
      />

      <ScenarioDrawer
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        onSelectScenario={handleSelectScenario}
        isExecuting={isExecuting}
      />
    </div>
  );
}
