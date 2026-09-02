import { parseTreeInput } from '../domain/parse-tree-input'
import { isFormatType } from '../domain/tree-formatters'
import { DEFAULT_TREE_OPTIONS, type SharedTree, type TreeOptions } from '../domain/workspace.types'

export const MAX_SHARE_FRAGMENT_LENGTH = 32 * 1024
export const MAX_SHARED_SOURCE_BYTES = 100 * 1024

const SHARE_PREFIX = '#t='
const RAW_CODEC = 'r'
const DEFLATE_CODEC = 'd'
const MAX_DECOMPRESSED_PAYLOAD_BYTES = MAX_SHARED_SOURCE_BYTES + 1024

type SharePayloadV1 =
  | readonly [version: 1, source: string]
  | readonly [version: 1, source: string, flags: number]
  | readonly [version: 1, source: string, flags: number, format: TreeOptions['format']]

export type ShareLinkErrorCode =
  | 'invalid-link'
  | 'unsupported-codec'
  | 'unsupported-version'
  | 'unsupported-format'
  | 'invalid-tree'
  | 'too-large'
  | 'compression-unavailable'

export type ShareLinkResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: ShareLinkErrorCode; message: string }

class PayloadTooLargeError extends Error {}

function optionsToFlags(options: TreeOptions): number {
  return (options.fullPath ? 1 : 0) | (options.trailingSlash ? 2 : 0) | (!options.rootDot ? 4 : 0)
}

function createPayload(sharedTree: SharedTree): SharePayloadV1 {
  const flags = optionsToFlags(sharedTree.options)
  if (sharedTree.options.format !== DEFAULT_TREE_OPTIONS.format) {
    return [1, sharedTree.source, flags, sharedTree.options.format]
  }
  if (flags !== 0) return [1, sharedTree.source, flags]
  return [1, sharedTree.source]
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(encoded: string): Uint8Array {
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) {
    throw new Error('Invalid Base64url payload')
  }

  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function collectBytes(
  stream: ReadableStream<Uint8Array>,
  maximumBytes: number,
): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let length = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > maximumBytes) {
      await reader.cancel()
      throw new PayloadTooLargeError('Decoded share payload is too large')
    }
    chunks.push(value)
  }

  const output = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}

async function transformBytes(
  bytes: Uint8Array,
  transform: {
    readable: ReadableStream<Uint8Array>
    writable: WritableStream<BufferSource>
  },
  maximumBytes: number,
): Promise<Uint8Array> {
  const output = collectBytes(transform.readable, maximumBytes)
  const writer = transform.writable.getWriter()
  const input = Uint8Array.from(bytes)
  const writing = (async () => {
    await writer.write(input)
    await writer.close()
  })()
  const [result] = await Promise.all([output, writing])
  return result
}

async function compress(bytes: Uint8Array): Promise<Uint8Array> {
  return transformBytes(bytes, new CompressionStream('deflate'), Number.POSITIVE_INFINITY)
}

async function decompress(bytes: Uint8Array): Promise<Uint8Array> {
  return transformBytes(bytes, new DecompressionStream('deflate'), MAX_DECOMPRESSED_PAYLOAD_BYTES)
}

function parsePayload(value: unknown): ShareLinkResult<SharedTree> {
  if (!Array.isArray(value) || value.length < 2 || value.length > 4) {
    return { ok: false, code: 'invalid-link', message: 'The share link has an invalid payload.' }
  }
  if (value[0] !== 1) {
    return {
      ok: false,
      code: 'unsupported-version',
      message: 'This share link was created by an unsupported version.',
    }
  }
  if (typeof value[1] !== 'string') {
    return { ok: false, code: 'invalid-link', message: 'The shared tree source is invalid.' }
  }

  const source = value[1]
  const flags = value[2] ?? 0
  if (!Number.isInteger(flags) || flags < 0 || flags > 7) {
    return { ok: false, code: 'invalid-link', message: 'The shared tree options are invalid.' }
  }

  const requestedFormat = value[3] ?? DEFAULT_TREE_OPTIONS.format
  if (!isFormatType(requestedFormat)) {
    return {
      ok: false,
      code: 'unsupported-format',
      message: 'This share link uses an unsupported output format.',
    }
  }
  if (new TextEncoder().encode(source).byteLength > MAX_SHARED_SOURCE_BYTES) {
    return { ok: false, code: 'too-large', message: 'The shared tree is too large to open.' }
  }

  const parsed = parseTreeInput(source)
  if (!parsed.ok) {
    return {
      ok: false,
      code: 'invalid-tree',
      message: parsed.errors[0]?.message ?? 'The shared tree is invalid.',
    }
  }

  return {
    ok: true,
    value: {
      source,
      options: {
        format: requestedFormat,
        fullPath: (flags & 1) !== 0,
        trailingSlash: (flags & 2) !== 0,
        rootDot: (flags & 4) === 0,
      },
    },
  }
}

export async function encodeShareFragment(
  sharedTree: SharedTree,
): Promise<ShareLinkResult<string>> {
  const encoder = new TextEncoder()
  if (!isFormatType(sharedTree.options.format)) {
    return {
      ok: false,
      code: 'unsupported-format',
      message: 'This tree uses an unsupported output format.',
    }
  }
  if (encoder.encode(sharedTree.source).byteLength > MAX_SHARED_SOURCE_BYTES) {
    return {
      ok: false,
      code: 'too-large',
      message: 'This tree is too large for a share link. Copy the source instead.',
    }
  }
  const parsed = parseTreeInput(sharedTree.source)
  if (!parsed.ok) {
    return {
      ok: false,
      code: 'invalid-tree',
      message: parsed.errors[0]?.message ?? 'This tree is invalid.',
    }
  }

  const payloadBytes = encoder.encode(JSON.stringify(createPayload(sharedTree)))
  const raw = `${SHARE_PREFIX}${RAW_CODEC}.${bytesToBase64Url(payloadBytes)}`
  let fragment = raw

  if (typeof CompressionStream !== 'undefined') {
    try {
      const compressed = `${SHARE_PREFIX}${DEFLATE_CODEC}.${bytesToBase64Url(await compress(payloadBytes))}`
      if (compressed.length < raw.length) fragment = compressed
    } catch {
      // Raw encoding remains a complete, portable fallback.
    }
  }

  if (fragment.length > MAX_SHARE_FRAGMENT_LENGTH) {
    return {
      ok: false,
      code: 'too-large',
      message: 'This tree is too large for a share link. Copy the source instead.',
    }
  }
  return { ok: true, value: fragment }
}

export async function decodeShareFragment(fragment: string): Promise<ShareLinkResult<SharedTree>> {
  if (!fragment.startsWith(SHARE_PREFIX) || fragment.length > MAX_SHARE_FRAGMENT_LENGTH) {
    return {
      ok: false,
      code: fragment.length > MAX_SHARE_FRAGMENT_LENGTH ? 'too-large' : 'invalid-link',
      message:
        fragment.length > MAX_SHARE_FRAGMENT_LENGTH
          ? 'The share link is too large to open.'
          : 'The share link is invalid.',
    }
  }

  const encoded = fragment.slice(SHARE_PREFIX.length)
  const separator = encoded.indexOf('.')
  if (separator < 1) {
    return { ok: false, code: 'invalid-link', message: 'The share link is invalid.' }
  }

  const codec = encoded.slice(0, separator)
  const payload = encoded.slice(separator + 1)
  if (codec !== RAW_CODEC && codec !== DEFLATE_CODEC) {
    return {
      ok: false,
      code: 'unsupported-codec',
      message: 'This share link uses an unsupported compression format.',
    }
  }

  try {
    let bytes = base64UrlToBytes(payload)
    if (codec === DEFLATE_CODEC) {
      if (typeof DecompressionStream === 'undefined') {
        return {
          ok: false,
          code: 'compression-unavailable',
          message: 'This browser cannot decompress the shared tree.',
        }
      }
      bytes = await decompress(bytes)
    }
    if (bytes.byteLength > MAX_DECOMPRESSED_PAYLOAD_BYTES) {
      return { ok: false, code: 'too-large', message: 'The shared tree is too large to open.' }
    }

    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return parsePayload(JSON.parse(json))
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return { ok: false, code: 'too-large', message: 'The shared tree is too large to open.' }
    }
    return { ok: false, code: 'invalid-link', message: 'The share link is damaged or invalid.' }
  }
}

export async function createShareUrl(
  sharedTree: SharedTree,
  currentUrl: string,
): Promise<ShareLinkResult<string>> {
  const encoded = await encodeShareFragment(sharedTree)
  if (!encoded.ok) return encoded

  const url = new URL(currentUrl)
  url.search = ''
  url.hash = encoded.value
  return { ok: true, value: url.toString() }
}
