// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vite-plus/test'

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('repository operations', () => {
  it('keeps this app private to npm with complete verification commands', async () => {
    const packageJson = JSON.parse(await read('package.json'))

    expect(packageJson.private).toBe(true)
    expect(packageJson.scripts).toMatchObject({
      'audit:all': 'pnpm audit',
      'docs:build': 'pnpm build',
      verify: 'vp check && vp test && pnpm build',
      'release:verify': 'pnpm audit:all && pnpm verify',
    })
    expect(packageJson.scripts).not.toHaveProperty('publish')
  })

  it('enforces dependency quarantine and pinned GitHub Actions', async () => {
    const [workspace, ci] = await Promise.all([
      read('pnpm-workspace.yaml'),
      read('.github/workflows/ci.yml'),
    ])

    expect(workspace).toContain('minimumReleaseAge: 1440')
    expect(workspace).toContain('minimumReleaseAgeStrict: true')
    expect(ci).not.toMatch(/uses:\s*[^\n]+@(v\d+|main|master)\b/u)
    expect(ci).toContain('persist-credentials: false')
    expect(ci).toContain('pnpm verify')
  })

  it('keeps deployment static and rooted in this repository', async () => {
    const vercel = JSON.parse(await read('vercel.json'))

    expect(vercel).toMatchObject({
      framework: 'vite',
      buildCommand: 'pnpm build',
      outputDirectory: 'dist',
    })
    expect(vercel).not.toHaveProperty('functions')
  })
})
