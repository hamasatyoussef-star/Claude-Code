import { VirtualFile, Scenario } from '../types';

export const initialClaudeMd = `# CLAUDE.md — Project Memory & Agent Guidelines

## Build & Test Commands
- \`npm run build\` - Compile TypeScript to dist/
- \`npm run test\` - Run Jest test suite
- \`npm run dev\` - Start development server on port 3000
- \`npm run lint\` - ESLint and type verification

## Architecture & Code Conventions
- Fastify/Express hybrid backend with modular service architecture
- Authentication uses HMAC SHA-256 JWT with refresh token rotation
- Strict TypeScript with zero \`any\` policy
- Error handling: always return standardized \`{ error: string, code: number }\` payload
- Database queries must use parameterized statements or connection pool transactions

## Security Constraints
- Never log raw passwords, authorization headers, or decrypted tokens
- All public route inputs must pass Zod schema validation
`;

export const initialProjectFiles: VirtualFile[] = [
  {
    path: '/CLAUDE.md',
    name: 'CLAUDE.md',
    language: 'markdown',
    content: initialClaudeMd,
    originalContent: initialClaudeMd,
  },
  {
    path: '/package.json',
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "enterprise-api",
  "version": "2.4.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.7",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.8",
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}`,
    originalContent: `{
  "name": "enterprise-api",
  "version": "2.4.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.7",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.8",
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}`
  },
  {
    path: '/src/server.ts',
    name: 'server.ts',
    language: 'typescript',
    content: `import express from 'express';
import { apiRouter } from './routes/api';
import { authenticate } from './auth/jwt';

const app = express();
app.use(express.json());

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Authenticated API router
app.use('/api', authenticate, apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
});`,
    originalContent: `import express from 'express';
import { apiRouter } from './routes/api';
import { authenticate } from './auth/jwt';

const app = express();
app.use(express.json());

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Authenticated API router
app.use('/api', authenticate, apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
});`
  },
  {
    path: '/src/auth/jwt.ts',
    name: 'jwt.ts',
    language: 'typescript',
    content: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-key-123';

export interface AuthUser {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser): string {
  // BUG: Missing token expiration and issuer verification!
  return jwt.sign(payload, JWT_SECRET);
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}`,
    originalContent: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-key-123';

export interface AuthUser {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser): string {
  // BUG: Missing token expiration and issuer verification!
  return jwt.sign(payload, JWT_SECRET);
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}`
  },
  {
    path: '/src/routes/api.ts',
    name: 'api.ts',
    language: 'typescript',
    content: `import { Router } from 'express';

export const apiRouter = Router();

apiRouter.get('/user/profile', (req, res) => {
  res.json({
    userId: req.user?.userId,
    role: req.user?.role,
    settings: {
      notifications: true,
      theme: 'dark'
    }
  });
});

apiRouter.post('/audit/log', (req, res) => {
  const { action, meta } = req.body;
  console.log(\`[AUDIT] User \${req.user?.userId} performed \${action}\`, meta);
  res.json({ status: 'logged', timestamp: new Date().toISOString() });
});`,
    originalContent: `import { Router } from 'express';

export const apiRouter = Router();

apiRouter.get('/user/profile', (req, res) => {
  res.json({
    userId: req.user?.userId,
    role: req.user?.role,
    settings: {
      notifications: true,
      theme: 'dark'
    }
  });
});

apiRouter.post('/audit/log', (req, res) => {
  const { action, meta } = req.body;
  console.log(\`[AUDIT] User \${req.user?.userId} performed \${action}\`, meta);
  res.json({ status: 'logged', timestamp: new Date().toISOString() });
});`
  },
  {
    path: '/tests/auth.test.ts',
    name: 'auth.test.ts',
    language: 'typescript',
    content: `import { generateToken } from '../src/auth/jwt';
import jwt from 'jsonwebtoken';

describe('Auth Service Security Tests', () => {
  test('Token should include expiry and subject claims', () => {
    const token = generateToken({ userId: 'usr_8831', role: 'admin' });
    const decoded = jwt.decode(token) as any;
    
    expect(decoded.exp).toBeDefined();
    expect(decoded.iss).toBe('enterprise-auth-service');
    expect(decoded.role).toBe('admin');
  });
});`,
    originalContent: `import { generateToken } from '../src/auth/jwt';
import jwt from 'jsonwebtoken';

describe('Auth Service Security Tests', () => {
  test('Token should include expiry and subject claims', () => {
    const token = generateToken({ userId: 'usr_8831', role: 'admin' });
    const decoded = jwt.decode(token) as any;
    
    expect(decoded.exp).toBeDefined();
    expect(decoded.iss).toBe('enterprise-auth-service');
    expect(decoded.role).toBe('admin');
  });
});`
  }
];

export const scenarios: Scenario[] = [
  {
    id: 'jwt-security-patch',
    title: 'Fix JWT Token Expiration & Security Vulnerability',
    badge: 'Security Patch',
    description: 'Inspect auth service, fix unexpiring tokens, add audience & issuer validation, and run test suite.',
    initialPrompt: 'Run the security audit on src/auth/jwt.ts, add expiration claims (15m access, 7d refresh), enforce issuer validation, and verify with tests.',
    steps: [
      {
        delayMs: 600,
        thinking: `1. The user requests a security audit and patch on \`src/auth/jwt.ts\`.
2. First, let's run \`npm run test\` to see the current baseline status.
3. Review \`CLAUDE.md\` guidelines on authentication: HMAC SHA-256 JWT with refresh token rotation and standardized error returns.
4. Let's read \`src/auth/jwt.ts\` to pinpoint vulnerabilities.`,
        toolCalls: [
          {
            id: 't-1',
            tool: 'bash',
            title: 'Bash: npm run test',
            command: 'npm run test',
            output: `FAIL tests/auth.test.ts
  Auth Service Security Tests
    ✕ Token should include expiry and subject claims (8 ms)

  ● Auth Service Security Tests › Token should include expiry and subject claims

    expect(received).toBeDefined()
    Received: undefined

      7 |     const decoded = jwt.decode(token) as any;
      8 |     
    > 9 |     expect(decoded.exp).toBeDefined();
        |                         ^
      10 |     expect(decoded.iss).toBe('enterprise-auth-service');

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        1.205 s`,
            status: 'success'
          },
          {
            id: 't-2',
            tool: 'read',
            title: 'FileView: src/auth/jwt.ts (lines 1-45)',
            filePath: '/src/auth/jwt.ts',
            output: `1: import { Request, Response, NextFunction } from 'express';
2: import jwt from 'jsonwebtoken';
...
19: export function generateToken(payload: AuthUser): string {
20:   // BUG: Missing token expiration and issuer verification!
21:   return jwt.sign(payload, JWT_SECRET);
22: }`,
            status: 'success'
          }
        ]
      },
      {
        delayMs: 1200,
        thinking: `The test failed as expected because \`generateToken\` in \`src/auth/jwt.ts\` issues persistent non-expiring tokens without \`iss\` or \`exp\` claims.
Let's patch \`src/auth/jwt.ts\`:
- Set \`expiresIn: '15m'\` for standard access tokens
- Add \`issuer: 'enterprise-auth-service'\`
- Add support for generating refresh tokens (\`7d\`)
- Update \`jwt.verify()\` with algorithm and issuer validation
- Confirm permission to edit \`src/auth/jwt.ts\`.`,
        toolCalls: [
          {
            id: 't-3',
            tool: 'edit',
            title: 'FileEdit: src/auth/jwt.ts',
            filePath: '/src/auth/jwt.ts',
            command: 'git apply patch to src/auth/jwt.ts',
            requiresPermission: true,
            diff: {
              original: `export function generateToken(payload: AuthUser): string {
  // BUG: Missing token expiration and issuer verification!
  return jwt.sign(payload, JWT_SECRET);
}`,
              modified: `export const TOKEN_ISSUER = 'enterprise-auth-service';
export const ACCESS_TOKEN_EXPIRY = '15m';

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: TOKEN_ISSUER,
    algorithm: 'HS256',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: TOKEN_ISSUER,
    algorithm: 'HS256',
  });
}`
            },
            output: 'Applied unified diff patch to /src/auth/jwt.ts successfully (1 file changed, 17 insertions, 3 deletions)',
            status: 'pending'
          }
        ],
        fileModifications: [
          {
            path: '/src/auth/jwt.ts',
            newContent: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-key-123';
export const TOKEN_ISSUER = 'enterprise-auth-service';
export const ACCESS_TOKEN_EXPIRY = '15m';

export interface AuthUser {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: TOKEN_ISSUER,
    algorithm: 'HS256',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: TOKEN_ISSUER,
    algorithm: 'HS256',
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: TOKEN_ISSUER,
      algorithms: ['HS256']
    }) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}`
          }
        ]
      },
      {
        delayMs: 1400,
        thinking: `Now that \`src/auth/jwt.ts\` has been patched with strict token expiration and issuer verification, let's run the test suite again to verify that all test assertions pass.`,
        toolCalls: [
          {
            id: 't-4',
            tool: 'bash',
            title: 'Bash: npm run test',
            command: 'npm run test',
            output: `PASS tests/auth.test.ts
  Auth Service Security Tests
    ✓ Token should include expiry and subject claims (4 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.912 s, estimated 1 s
Ran all test suites.`,
            status: 'success'
          }
        ],
        response: `I've audited and secured \`src/auth/jwt.ts\`:
- Added \`expiresIn: '15m'\` and \`issuer: 'enterprise-auth-service'\` to \`generateToken()\`
- Implemented \`generateRefreshToken()\` with 7-day lifetime
- Hardened \`authenticate()\` middleware with strict algorithm pinning (\`HS256\`) and issuer checks
- Executed \`npm run test\` — all security tests now pass with 0 failures.`
      }
    ]
  },
  {
    id: 'rate-limiting',
    title: 'Implement In-Memory Rate Limiter Middleware',
    badge: 'API Resilience',
    description: 'Add a token-bucket rate limiter to protect public and API routes against brute force attacks.',
    initialPrompt: 'Create a lightweight in-memory rate limiting middleware with sliding window algorithm and attach it to /api routes in src/server.ts.',
    steps: [
      {
        delayMs: 800,
        thinking: `1. Check existing server setup in \`src/server.ts\`.
2. Create \`src/middleware/rateLimiter.ts\` implementing a sliding window in-memory rate limiter (e.g. 100 requests per 15 minutes per IP).
3. Import and mount it before \`app.use('/api', ...)\` in \`src/server.ts\`.`,
        toolCalls: [
          {
            id: 't-rl-1',
            tool: 'read',
            title: 'FileView: src/server.ts',
            filePath: '/src/server.ts',
            output: `1: import express from 'express';
2: import { apiRouter } from './routes/api';
3: import { authenticate } from './auth/jwt';
4: 
5: const app = express();
6: app.use(express.json());`,
            status: 'success'
          },
          {
            id: 't-rl-2',
            tool: 'write',
            title: 'WriteFile: src/middleware/rateLimiter.ts',
            filePath: '/src/middleware/rateLimiter.ts',
            output: 'Created /src/middleware/rateLimiter.ts (42 lines)',
            status: 'success'
          }
        ],
        fileModifications: [
          {
            path: '/src/server.ts',
            newContent: `import express from 'express';
import { apiRouter } from './routes/api';
import { authenticate } from './auth/jwt';

// In-memory sliding window rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - 1);
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfterSeconds: retryAfter
    });
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - record.count);
  next();
}

const app = express();
app.use(express.json());

// Public health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Protected routes with rate limiting and auth
app.use('/api', rateLimiter, authenticate, apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
});`
          }
        ]
      },
      {
        delayMs: 1100,
        thinking: `Rate limiting middleware created and wired into Express.
Let's verify TypeScript compilation with \`npm run build\`.`,
        toolCalls: [
          {
            id: 't-rl-3',
            tool: 'bash',
            title: 'Bash: npm run build',
            command: 'npm run build',
            output: `> enterprise-api@2.4.0 build
> tsc

✨ TypeScript compilation completed successfully (0 errors).`,
            status: 'success'
          }
        ],
        response: `Implemented sliding window rate limiting in \`src/server.ts\`:
- Limits client IPs to 100 requests per 15-minute window
- Emits standard \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, and \`Retry-After\` HTTP headers
- Returns \`429 Too Many Requests\` when threshold is exceeded
- Verified zero TypeScript compilation errors with \`npm run build\`.`
      }
    ]
  },
  {
    id: 'claude-md-update',
    title: 'Initialize and Update CLAUDE.md Memory',
    badge: 'Project Memory',
    description: 'Document newly established rate limiting conventions and testing guidelines in CLAUDE.md.',
    initialPrompt: '/init --update Document the rate limiting rules and testing instructions in CLAUDE.md',
    steps: [
      {
        delayMs: 700,
        thinking: `The user invoked \`/init\` or requested updating \`CLAUDE.md\`.
Let's read \`CLAUDE.md\` to preserve existing guidelines and append the new rate limiting & testing sections.`,
        toolCalls: [
          {
            id: 't-cmd-1',
            tool: 'read',
            title: 'FileView: /CLAUDE.md',
            filePath: '/CLAUDE.md',
            output: initialClaudeMd,
            status: 'success'
          },
          {
            id: 't-cmd-2',
            tool: 'edit',
            title: 'FileEdit: /CLAUDE.md',
            filePath: '/CLAUDE.md',
            command: 'git apply patch to CLAUDE.md',
            output: 'Updated /CLAUDE.md with rate limiting and automated testing conventions.',
            status: 'success'
          }
        ],
        fileModifications: [
          {
            path: '/CLAUDE.md',
            newContent: `${initialClaudeMd}
## Rate Limiting & Resilience
- Default limit: 100 req / 15m window per client IP
- Headers required on all responses: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`
- In testing, mock the \`requestCounts\` Map or reset before test runs

## Git & PR Workflow
- Always run \`npm run test\` and \`npm run build\` before submitting changes
- Commit messages follow conventional commits (\`feat:\`, \`fix:\`, \`security:\`)
`
          }
        ],
        response: `Updated \`CLAUDE.md\` with:
- Rate Limiting & Resilience architectural constraints
- Standard HTTP rate limit headers documentation
- Automated testing and conventional commit workflow rules.`
      }
    ]
  }
];

export const slashCommands = [
  { command: '/help', description: 'Show all available Claude Code slash commands and shortcuts' },
  { command: '/compact', description: 'Compress conversation history and reclaim context tokens' },
  { command: '/cost', description: 'Inspect session tokens, cache hit rate, and API costs' },
  { command: '/doctor', description: 'Run health diagnostics on git, runtime environment & tools' },
  { command: '/init', description: 'Initialize or update CLAUDE.md project memory file' },
  { command: '/review', description: 'Review pending code modifications and git diffs' },
  { command: '/clear', description: 'Clear terminal viewport history' },
  { command: '/status', description: 'Show current branch, modified files, and agent permission mode' },
  { command: '/bug', description: 'File an issue or report agent behavior feedback' },
];
