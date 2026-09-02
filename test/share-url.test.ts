// @vitest-environment node
import { deflateSync } from 'node:zlib'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { DEFAULT_TREE_OPTIONS, type SharedTree } from '../src/features/tree/domain/workspace.types'
import {
  createShareUrl,
  decodeShareFragment,
  encodeShareFragment,
  MAX_SHARED_SOURCE_BYTES,
  MAX_SHARE_FRAGMENT_LENGTH,
} from '../src/features/tree/infrastructure/share-url'
import { TREE_RENDERERS } from '../src/features/tree/domain/tree-formatters'

const source = 'app\n  src\n    🌳.ts'

function rawFragment(payload: unknown): string {
  return `#t=r.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`
}

function compressedFragment(payload: unknown): string {
  return `#t=d.${deflateSync(Buffer.from(JSON.stringify(payload))).toString('base64url')}`
}

describe('share URL codec', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses the fixed minimal v1 representation for defaults', async () => {
    await expect(
      encodeShareFragment({ source: 'app\n  src', options: { ...DEFAULT_TREE_OPTIONS } }),
    ).resolves.toEqual({
      ok: true,
      value: '#t=r.WzEsImFwcFxuICBzcmMiXQ',
    })
  })

  it('decodes fixed raw and compressed version 1 links', async () => {
    const expected = { source: 'app\n  src', options: { ...DEFAULT_TREE_OPTIONS } }
    await expect(decodeShareFragment('#t=r.WzEsImFwcFxuICBzcmMiXQ')).resolves.toEqual({
      ok: true,
      value: expected,
    })
    await expect(decodeShareFragment('#t=d.eJyLNtRRSiwoiMlTUCguSlaKBQAomgTt')).resolves.toEqual({
      ok: true,
      value: expected,
    })
  })

  it('round-trips every format and option combination', async () => {
    for (const renderer of TREE_RENDERERS) {
      for (let flags = 0; flags < 8; flags++) {
        const sharedTree: SharedTree = {
          source,
          options: {
            format: renderer.id,
            fullPath: (flags & 1) !== 0,
            trailingSlash: (flags & 2) !== 0,
            rootDot: (flags & 4) === 0,
          },
        }
        const encoded = await encodeShareFragment(sharedTree)
        expect(encoded.ok).toBe(true)
        if (!encoded.ok) continue
        await expect(decodeShareFragment(encoded.value)).resolves.toEqual({
          ok: true,
          value: sharedTree,
        })
      }
    }
  })

  it('preserves CRLF source text exactly', async () => {
    const sharedTree = {
      source: 'app\r\n  src\r\n    index.ts',
      options: { ...DEFAULT_TREE_OPTIONS },
    }
    const encoded = await encodeShareFragment(sharedTree)
    expect(encoded.ok).toBe(true)
    if (encoded.ok) {
      await expect(decodeShareFragment(encoded.value)).resolves.toEqual({
        ok: true,
        value: sharedTree,
      })
    }
  })

  it('uses deflate when it makes a realistic tree shorter', async () => {
    const largeSource = [
      'app',
      ...Array.from({ length: 500 }, (_, index) => `  file-${index}.ts`),
    ].join('\n')
    const encoded = await encodeShareFragment({
      source: largeSource,
      options: { ...DEFAULT_TREE_OPTIONS },
    })
    expect(encoded.ok && encoded.value.startsWith('#t=d.')).toBe(true)
  })

  it('falls back to raw encoding when compression is unavailable', async () => {
    vi.stubGlobal('CompressionStream', undefined)
    const encoded = await encodeShareFragment({ source, options: { ...DEFAULT_TREE_OPTIONS } })
    expect(encoded.ok && encoded.value.startsWith('#t=r.')).toBe(true)
  })

  it('reports when a compressed link cannot be decoded by the browser', async () => {
    vi.stubGlobal('DecompressionStream', undefined)
    await expect(
      decodeShareFragment('#t=d.eJyLNtRRSiwoiMlTUCguSlaKBQAomgTt'),
    ).resolves.toMatchObject({ ok: false, code: 'compression-unavailable' })
  })

  it.each([
    ['bad Base64url', '#t=r.!', 'invalid-link'],
    ['damaged deflate', '#t=d.eA', 'invalid-link'],
    ['unknown codec', '#t=x.abc', 'unsupported-codec'],
    ['unknown version', rawFragment([2, 'app']), 'unsupported-version'],
    ['unknown format', rawFragment([1, 'app', 0, 'yaml']), 'unsupported-format'],
    ['invalid flags', rawFragment([1, 'app', 8]), 'invalid-link'],
    ['invalid source tree', rawFragment([1, '']), 'invalid-tree'],
  ])('rejects %s', async (_, fragment, code) => {
    await expect(decodeShareFragment(fragment)).resolves.toMatchObject({ ok: false, code })
  })

  it('enforces encoded and decompressed size limits', async () => {
    await expect(
      decodeShareFragment(`#t=r.${'a'.repeat(MAX_SHARE_FRAGMENT_LENGTH)}`),
    ).resolves.toMatchObject({ ok: false, code: 'too-large' })

    const oversizedSource = 'a'.repeat(MAX_SHARED_SOURCE_BYTES + 1)
    await expect(
      encodeShareFragment({ source: oversizedSource, options: { ...DEFAULT_TREE_OPTIONS } }),
    ).resolves.toMatchObject({ ok: false, code: 'too-large' })
    await expect(
      decodeShareFragment(compressedFragment([1, oversizedSource])),
    ).resolves.toMatchObject({ ok: false, code: 'too-large' })
  })

  it('rejects invalid trees and formats before encoding', async () => {
    await expect(
      encodeShareFragment({ source: '', options: { ...DEFAULT_TREE_OPTIONS } }),
    ).resolves.toMatchObject({ ok: false, code: 'invalid-tree' })
    await expect(
      encodeShareFragment({
        source: 'app',
        options: { ...DEFAULT_TREE_OPTIONS, format: 'yaml' as never },
      }),
    ).resolves.toMatchObject({ ok: false, code: 'unsupported-format' })
  })

  it('creates a canonical URL without query parameters', async () => {
    await expect(
      createShareUrl(
        { source: 'app', options: { ...DEFAULT_TREE_OPTIONS } },
        'https://tree.lupinum.com/workbench?campaign=test#old',
      ),
    ).resolves.toEqual({
      ok: true,
      value: 'https://tree.lupinum.com/workbench#t=r.WzEsImFwcCJd',
    })
  })
})
