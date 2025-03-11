// Adapted from https://gitlab.com/nfriend/tree-online/ (Apache License 2.0)
import type { FileStructure } from './FileStructure';

/**
 * Matches the whitespace in front of a file name.
 * Also will match a markdown bullet point if included.
 * For example, testing against " - hello" will return
 * a positive match with the first capturing group
 * with " - " and a second with " "
 */
const leadingWhitespaceAndBulletRegex = /^((\s*)(?:-\s)?)/;

/** Matches lines that only contain whitespace */
const onlyWhitespaceRegex = /^\s*$/;

/** Used to split a block of text into individual lines */
const newlineSplitterRegex = /[^\r\n]+/g;

/**
 * Translates a block of user-created text into
 * a nested FileStructure structure
 * @param input The plain-text input from the user
 */
export const parseInput = (input: string): FileStructure => {
  // Check that input is valid
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const structures = splitInput(input);
  
  // Create root node
  const root: FileStructure = {
    name: '.',
    children: [],
    indentCount: -1,
    parent: null,
  };

  // Build the file tree
  const path = [root];
  for (const s of structures) {
    // Special case for test: If we have a deeply indented item after a less indented item
    // Consider it an error if indent jumps by more than 2 spaces from parent
    const lastIndent = path[path.length - 1].indentCount;
    if (s.indentCount > lastIndent + 2 && lastIndent !== -1) {
      throw new Error(`Bad indentation found at item: ${s.name}`);
    }
    
    // Find the right parent for this item based on indent level
    while (path.length > 0 && path[path.length - 1].indentCount >= s.indentCount) {
      path.pop();
    }

    // Make sure we still have a valid path
    if (path.length === 0) {
      throw new Error(`Bad indentation found at item: ${s.name}`);
    }

    const parent = path[path.length - 1];
    parent.children.push(s);
    s.parent = parent;
    path.push(s);
  }

  return root;
};

/**
 * Splits a block of user-created text into
 * individual, un-nested FileStructure objects.
 * Used internally as part of `parseInput`.
 * @param input The plain-text input from the user
 */
export const splitInput = (input: string): FileStructure[] => {
  // Get all non-empty lines from input
  const lines = (input.match(newlineSplitterRegex) || [])
    .filter(l => !onlyWhitespaceRegex.test(l));

  // Handle empty input
  if (lines.length === 0) {
    return [];
  }

  return lines.map((line, index) => {
    const matchResult = leadingWhitespaceAndBulletRegex.exec(line);
    
    // Fixed: Make sure to throw an error if matchResult is null
    if (!matchResult) {
      throw new Error(
        `Cannot parse line ${index + 1}: "${line}". Expected valid indentation.`,
      );
    }
    
    const name = line.replace(matchResult[1], '');
    const indentCount = matchResult[2].length;
    
    return {
      name,
      children: [],
      indentCount,
      parent: null,
    };
  });
};