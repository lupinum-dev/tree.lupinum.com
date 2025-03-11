import { ref } from 'vue'

type ToastFunction = (options: { 
  title: string, 
  icon: string, 
  color: string, 
  duration: number 
}) => void

export function useFileUpload() {
  const isProcessingUpload = ref(false)

  const handleFolderUpload = async (updateSource: (text: string) => void, toast: ToastFunction) => {
    if (!process.client) return
    
    try {
      isProcessingUpload.value = true
      
      // Create a file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.webkitdirectory = true // Non-standard attribute for directory selection
      
      // @ts-ignore - Firefox support
      input.directory = true 
      input.multiple = true
      
      // Create a promise to handle the file selection
      const fileSelectionPromise = new Promise<FileList | null>((resolve) => {
        input.onchange = () => resolve(input.files)
        input.oncancel = () => resolve(null)
      })
      
      // Trigger the file selection dialog
      input.click()
      
      // Wait for user to select files
      const files = await fileSelectionPromise
      
      if (!files || files.length === 0) {
        isProcessingUpload.value = false
        return
      }
      
      // Process the files to create a tree structure
      const fileStructure: Map<string, Set<string>> = new Map()
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = file.webkitRelativePath
        
        // Skip files in .ignore directories
        if (path.includes('/.ignore/') || path.split('/').some(part => part.endsWith('.ignore'))) {
          continue
        }
        
        // Split the path into directories
        const parts = path.split('/')
        
        // Process each directory level
        for (let j = 0; j < parts.length; j++) {
          const currentPath = parts.slice(0, j).join('/')
          const childName = parts[j]
          
          if (!fileStructure.has(currentPath)) {
            fileStructure.set(currentPath, new Set())
          }
          
          fileStructure.get(currentPath)?.add(childName)
        }
      }
      
      // Convert the file structure to the expected input format
      let result = ''
      
      // Helper function to build the tree
      const buildTree = (path: string, indent: number) => {
        const children = fileStructure.get(path)
        if (!children) return
        
        // Sort children (directories first, then files)
        const sortedChildren = Array.from(children).sort((a, b) => {
          const aIsDir = fileStructure.has(path ? `${path}/${a}` : a)
          const bIsDir = fileStructure.has(path ? `${path}/${b}` : b)
          
          if (aIsDir && !bIsDir) return -1
          if (!aIsDir && bIsDir) return 1
          return a.localeCompare(b)
        })
        
        for (const child of sortedChildren) {
          const childPath = path ? `${path}/${child}` : child
          const isDirectory = fileStructure.has(childPath)
          
          // Add indentation
          result += ' '.repeat(indent)
          
          // Add the file/directory name
          result += isDirectory ? `${child}/` : child
          result += '\n'
          
          // Process subdirectories
          if (isDirectory) {
            buildTree(childPath, indent + 2)
          }
        }
      }
      
      // Start building from the root
      const rootDir = files[0].webkitRelativePath.split('/')[0]
      result = `${rootDir}/\n`
      buildTree(rootDir, 2)
      
      // Update the source with the generated tree
      updateSource(result.trim())
      
      toast({
        title: 'Folder structure loaded successfully!',
        icon: 'i-heroicons-folder-open',
        color: 'success',
        duration: 1200
      })
    } catch (error) {
      console.error('Error processing folder upload:', error)
      toast({
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
    handleFolderUpload
  }
}