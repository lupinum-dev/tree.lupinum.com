export async function writeTextToClipboard(text: string): Promise<boolean> {
  if (!import.meta.client) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
