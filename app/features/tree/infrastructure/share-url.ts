import { writeTextToClipboard } from './write-clipboard'

/** Copy canonical page URL into the clipboard (SPA). */
export async function shareCurrentLocation(): Promise<boolean> {
  if (!import.meta.client) return false
  return writeTextToClipboard(window.location.href)
}
