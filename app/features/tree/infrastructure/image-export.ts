/** Download tree text as PNG; canvas uses element scroll extents where available. */
export async function exportTreeTextAsImageFromElement(opts: {
  treeText: string
  filenameBase: string
  treeOutputElementId: string
}): Promise<boolean> {
  if (!import.meta.client) return false

  await document.fonts.ready.catch(() => undefined)

  const treeElement = document.getElementById(opts.treeOutputElementId)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx || !treeElement) return false

  const computed = window.getComputedStyle(treeElement)
  const padding = Number.parseInt(computed.paddingLeft || '0', 10) || 0
  const fontSize = Number.parseInt(computed.fontSize || '14', 10) || 14
  const fontFamily = computed.fontFamily || 'monospace'
  const lineHeight = Math.round(fontSize * 1.35)

  const width = Math.max(treeElement.scrollWidth - padding * 2, treeElement.clientWidth)
  const textHeightGuess = opts.treeText.split('\n').length * lineHeight
  const height = Math.max(
    treeElement.scrollHeight - padding * 2,
    textHeightGuess + padding * 2
  )

  const MAX_DIMENSION = 16_384
  const safeW = Math.min(width + padding * 2, MAX_DIMENSION)
  const safeH = Math.min(height + padding * 2, MAX_DIMENSION)

  canvas.width = safeW
  canvas.height = safeH

  const isDark = document.documentElement.classList.contains('dark')
  ctx.fillStyle = isDark ? '#1f2937' : '#f3f4f6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = isDark ? '#e5e7eb' : '#111827'

  const lines = opts.treeText.split('\n')
  const textPad = Math.max(padding, 12)
  let y = textPad + lineHeight

  const approxChar = Math.max(ctx.measureText('M').width, 7)
  const maxChars = Math.floor((safeW - textPad * 2) / approxChar)

  for (const raw of lines) {
    const chunks = chunkLine(raw, Math.max(maxChars, 80))
    for (const chunk of chunks) {
      ctx.fillText(chunk, textPad, y)
      y += lineHeight
      if (y > safeH - lineHeight) break
    }
  }

  try {
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = opts.filenameBase.endsWith('.png') ? opts.filenameBase : `${opts.filenameBase}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    link.remove()
    return true
  } catch {
    return false
  }
}

function chunkLine(line: string, maxLen: number): string[] {
  if (line.length <= maxLen || maxLen < 8) return [line]
  const out: string[] = []
  for (let i = 0; i < line.length; i += maxLen) {
    out.push(line.slice(i, i + maxLen))
  }
  return out
}
