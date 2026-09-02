/**
 * Opens a native folder picker and returns chosen files.
 * If the user cancels, resolves to an empty array (when `oncancel` fires).
 */
export function pickFolderFiles(): Promise<File[]> {
  if (typeof document === 'undefined') return Promise.resolve([])

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.style.display = 'none'
    ;(input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory = true
    ;(input as HTMLInputElement & { directory?: boolean }).directory = true

    const done = (files: File[]) => {
      input.remove()
      resolve(files)
    }

    input.addEventListener(
      'change',
      () => {
        done(input.files ? [...input.files] : [])
      },
      { once: true },
    )

    // Non-standard but supported in Chromium
    ;(input as HTMLInputElement & { oncancel?: () => void }).oncancel = () => done([])

    document.body.appendChild(input)
    input.click()
  })
}
