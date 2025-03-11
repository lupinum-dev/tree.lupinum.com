import { bench, describe } from 'vitest';
import { parseInput } from '../app/lib/parse-input';
import { generateTree } from '../app/lib/generate-tree';
import { formatTree } from '../app/lib/tree-formatters';
import type { FileStructure } from '../app/lib/FileStructure';

/**
 * Generates a deep file structure string for testing performance
 * @param depth How deep to make the tree
 * @param filesPerLevel How many files to create at each level
 * @returns A string representing a deeply nested file structure
 */
function generateDeepStructure(depth: number, filesPerLevel: number): string {
  const lines: string[] = ['root'];
  
  function addLevel(currentDepth: number, prefix: string) {
    if (currentDepth >= depth) return;
    
    // Add files at this level
    for (let i = 0; i < filesPerLevel; i++) {
      lines.push(`${prefix}file-${currentDepth}-${i}.txt`);
    }
    
    // Add directory for next level
    const nextDir = `${prefix}level-${currentDepth}`;
    lines.push(nextDir);
    
    // Recurse to next level
    addLevel(currentDepth + 1, `${nextDir}  `);
  }
  
  addLevel(0, '  ');
  return lines.join('\n');
}

/**
 * Generates a wide file structure string for testing performance
 * @param width How many top-level directories to create
 * @param filesPerDir How many files in each directory
 * @returns A string representing a wide file structure
 */
function generateWideStructure(width: number, filesPerDir: number): string {
  const lines: string[] = ['root'];
  
  for (let i = 0; i < width; i++) {
    lines.push(`  dir-${i}`);
    
    for (let j = 0; j < filesPerDir; j++) {
      lines.push(`    file-${i}-${j}.txt`);
    }
  }
  
  return lines.join('\n');
}

// Prepare structures for benchmarks
const smallInput = generateDeepStructure(3, 3);
const mediumInput = generateDeepStructure(5, 5);
const largeInput = generateWideStructure(50, 5);

const smallStructure = parseInput(smallInput);
const mediumStructure = parseInput(mediumInput);
const largeStructure = parseInput(largeInput);

describe('Parse Input Benchmarks', () => {
  bench('parse small structure', () => {
    parseInput(smallInput);
  });
  
  bench('parse medium structure', () => {
    parseInput(mediumInput);
  });
  
  bench('parse large structure', () => {
    parseInput(largeInput);
  });
});

describe('Generate Tree Benchmarks', () => {
  bench('generate small tree (utf-8)', () => {
    generateTree(smallStructure, { charset: 'utf-8' });
  });
  
  bench('generate small tree (ascii)', () => {
    generateTree(smallStructure, { charset: 'ascii' });
  });
  
  bench('generate medium tree (utf-8)', () => {
    generateTree(mediumStructure, { charset: 'utf-8' });
  });
  
  bench('generate large tree (utf-8)', () => {
    generateTree(largeStructure, { charset: 'utf-8' });
  });
});

describe('Format Tree Benchmarks', () => {
  bench('format as utf-8', () => {
    formatTree(mediumStructure, 'utf-8');
  });
  
  bench('format as json-nested', () => {
    formatTree(mediumStructure, 'json-nested');
  });
  
  bench('format as json-array', () => {
    formatTree(mediumStructure, 'json-array');
  });
  
  bench('format as json-flat', () => {
    formatTree(mediumStructure, 'json-flat');
  });
  
  bench('format as yaml', () => {
    formatTree(mediumStructure, 'yaml');
  });
  
  bench('format as xml', () => {
    formatTree(mediumStructure, 'xml');
  });
  
  bench('format as markdown', () => {
    formatTree(mediumStructure, 'markdown');
  });
});