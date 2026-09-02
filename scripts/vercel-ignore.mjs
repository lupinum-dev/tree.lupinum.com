import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA

if (!previousSha) process.exit(1)

const root = resolve(import.meta.dirname, '..')
const git = (args) => spawnSync('git', args, { cwd: root, stdio: 'ignore' }).status ?? 1

if (git(['cat-file', '-e', `${previousSha}^{commit}`]) !== 0) process.exit(1)

process.exit(
  git([
    'diff',
    '--quiet',
    previousSha,
    'HEAD',
    '--',
    'src',
    'public',
    'index.html',
    'scripts/prerender.mjs',
    'vite.config.ts',
    'vercel.json',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
  ]),
)
