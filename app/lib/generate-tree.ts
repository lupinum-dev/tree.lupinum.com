import type { FileStructure } from './FileStructure';
import { LINE_STRINGS } from './line-strings';

/**
 * Represents all rendering options available
 * when calling `generateTree`
 */
export interface GenerateTreeOptions {
  /**
   * Which set of characters to use when
   * rendering directory lines
   */
  charset?: 'ascii' | 'utf-8';

  /**
   * Whether or not to append trailing slashes
   * to directories. Items that already include a
   * trailing slash will not have another appended.
   */
  trailingDirSlash?: boolean;

  /**
   * Whether or not to print the full
   * path of the item
   */
  fullPath?: boolean;

  /**
   * Whether or not to render a dot as the root of the tree
   */
  rootDot?: boolean;
}

/** The default options if no options are provided */
const defaultOptions: GenerateTreeOptions = {
  charset: 'utf-8',
  trailingDirSlash: false,
  fullPath: false,
  rootDot: true,
};

/**
 * Generates an ASCII tree diagram, given a FileStructure
 * @param structure The FileStructure object to convert into ASCII
 * @param options The rendering options
 */
export const generateTree = (
  structure: FileStructure,
  options?: GenerateTreeOptions,
): string => {
  // Check that input is valid
  if (!structure) {
    throw new Error('Structure is required');
  }
  
  // Merge options with defaults
  const mergedOptions: GenerateTreeOptions = { 
    ...defaultOptions, 
    ...(options || {}) 
  };
  
  // Use a stack instead of recursion for better speed with deep trees
  const lines: string[] = [];
  const stack: FileStructure[] = [structure];
  
  while (stack.length > 0) {
    const item = stack.pop()!;
    
    // Add line for current item
    const line = getAsciiLine(item, mergedOptions);
    if (line !== null) {
      lines.push(line);
    }
    
    // Add children to stack in reverse order
    // so they get processed in the right order
    for (let i = item.children.length - 1; i >= 0; i--) {
      stack.push(item.children[i]);
    }
  }
  
  return lines.join('\n');
};

/**
 * Returns a line of ASCII that represents
 * a single FileStructure object
 * @param structure The file to render
 * @param options The rendering options
 */
const getAsciiLine = (
  structure: FileStructure,
  options: GenerateTreeOptions,
): string | null => {
  // Make sure we have a valid charset
  const charset = options.charset || 'utf-8';
  if (!LINE_STRINGS[charset]) {
    throw new Error(`Unknown charset: ${charset}`);
  }
  
  const lines = LINE_STRINGS[charset];

  // Special case for the root element
  if (!structure.parent) {
    return options.rootDot ? structure.name : null;
  }

  const chunks = [
    isLastChild(structure) ? lines.LAST_CHILD : lines.CHILD,
    getName(structure, options),
  ];

  let current = structure.parent;
  while (current && current.parent) {
    chunks.unshift(isLastChild(current) ? lines.EMPTY : lines.DIRECTORY);
    current = current.parent;
  }

  // Join all the chunks together to create the final line.
  // If we're not rendering the root `.`, chop off the first 4 characters.
  return chunks.join('').substring(options.rootDot ? 0 : lines.CHILD.length);
};

/**
 * Returns the name of a file or folder according to the
 * rules specified by the rendering rules
 * @param structure The file or folder to get the name of
 * @param options The rendering options
 */
const getName = (
  structure: FileStructure,
  options: GenerateTreeOptions,
): string => {
  // Basic file/folder name
  const nameChunks = [structure.name];

  // Optionally append a trailing slash
  if (
    // if the trailing slash option is enabled
    options.trailingDirSlash &&
    // and if the item has at least one child
    structure.children.length > 0 &&
    // and if the item doesn't already have a trailing slash
    !/\/\s*$/.test(structure.name)
  ) {
    nameChunks.push('/');
  }

  // Optionally prefix the name with its full path
  if (options.fullPath && structure.parent) {
    // For full path, we build it from root to current item
    const pathParts = [];
    let current: FileStructure | null = structure.parent;
    
    // Collect path parts going up to the root
    while (current && current.name !== '.') {
      pathParts.unshift(current.name);
      current = current.parent;
    }
    
    // Build the path
    if (pathParts.length > 0) {
      const path = pathParts.join('/');
      nameChunks.unshift(`${path}/`);
    }
  }

  return nameChunks.join('');
};

/**
 * A utility function do determine if a file or folder
 * is the last child of its parent
 * @param structure The file or folder to test
 */
const isLastChild = (structure: FileStructure): boolean => {
  if (!structure.parent || !structure.parent.children.length) {
    return false;
  }
  
  return structure.parent.children[structure.parent.children.length - 1] === structure;
};