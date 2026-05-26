import { ref } from 'vue'
import { pickFolderFiles } from '~/features/tree/infrastructure/folder-picker'
import { filesToTreeSourceText } from '~/features/tree/infrastructure/folder-tree-builder'

export function useFolderUpload() {
  const isProcessingUpload = ref(false)

  type ToastPayload = {
    title: string
    icon: string
    color: 'success' | 'error'
    duration: number
  }

  const pickFolderAndMergeText = async (
    applyText: (text: string) => void,
    toastAdd: (opts: ToastPayload) => void
  ) => {
    if (!import.meta.client) return

    try {
      isProcessingUpload.value = true
      const files = await pickFolderFiles()
      const text = filesToTreeSourceText(files)
      if (!text?.trim()) {
        return
      }
      applyText(text)
      toastAdd({
        title: 'Folder structure loaded successfully!',
        icon: 'i-heroicons-folder-open',
        color: 'success',
        duration: 1200
      })
    } catch (error) {
      console.error('Error processing folder upload:', error)
      toastAdd({
        title: 'Failed to process folder upload',
        icon: 'i-heroicons-exclamation-circle',
        color: 'error',
        duration: 1200
      })
    } finally {
      isProcessingUpload.value = false
    }
  }

  return {
    isProcessingUpload,
    pickFolderAndMergeText
  }
}
