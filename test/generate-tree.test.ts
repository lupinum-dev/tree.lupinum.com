import { describe, it, expect } from 'vitest';
import { generateTree } from '../app/lib/generate-tree';
import { parseInput } from '../app/lib/parse-input';
import type { FileStructure } from '../app/lib/FileStructure';
import { LINE_STRINGS } from '../app/lib/line-strings';

// Helper function to create a simple test structure
function createTestStructure(): FileStructure {
  // Create a simple structure:
  // .
  // └── app
  //     ├── src
  //     │   └── index.js
  //     └── package.json
  return parseInput('app\n  src\n    index.js\n  package.json');
}

describe('generateTree', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => generateTree(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => generateTree(undefined)).toThrow('Structure is required');
  });
  
  it('should generate a tree with utf-8 charset by default', () => {
    const structure = createTestStructure();
    const result = generateTree(structure);
    
    // Check that the result contains UTF-8 specific characters
    expect(result).toContain('├──');
    expect(result).toContain('└──');
    expect(result).toContain('│');
    
    // Check that the whole tree structure is formatted correctly
    expect(result).toBe([
      '.',
      '└── app',
      '    ├── src',
      '    │   └── index.js',
      '    └── package.json'
    ].join('\n'));
  });
  
  it('should generate a tree with ascii charset when specified', () => {
    const structure = createTestStructure();
    const result = generateTree(structure, { charset: 'ascii' });
    
    // Check that the result contains ASCII specific characters
    expect(result).toContain('|--');
    expect(result).toContain('`--');
    expect(result).toContain('|');
    
    // Check that the whole tree structure is formatted correctly
    expect(result).toBe([
      '.',
      '`-- app',
      '    |-- src',
      '    |   `-- index.js',
      '    `-- package.json'
    ].join('\n'));
  });
  
  it('should generate a tree without root dot when specified', () => {
    const structure = createTestStructure();
    const result = generateTree(structure, { rootDot: false });
    
    // Check that the result doesn't start with a dot
    expect(result).not.toMatch(/^\./);
    
    // Check that the tree still shows the rest of the structure
    expect(result).toBe([
      'app',
      '├── src',
      '│   └── index.js',
      '└── package.json'
    ].join('\n'));
  });
  
  it('should append trailing slashes to directories when specified', () => {
    const structure = createTestStructure();
    const result = generateTree(structure, { trailingDirSlash: true });
    
    // Check that directories have trailing slashes
    expect(result).toContain('app/');
    expect(result).toContain('src/');
    
    // But files don't
    expect(result).not.toContain('index.js/');
    expect(result).not.toContain('package.json/');
    
    // Check complete output
    expect(result).toBe([
      '.',
      '└── app/',
      '    ├── src/',
      '    │   └── index.js',
      '    └── package.json'
    ].join('\n'));
  });
  
  it('should print full paths when specified', () => {
    const structure = createTestStructure();
    const result = generateTree(structure, { fullPath: true });
    
    // Check that full paths are included
    expect(result).toContain('app/src/index.js');
    expect(result).toContain('app/package.json');
    
    // Check complete output
    expect(result).toBe([
      '.',
      '└── app',
      '    ├── app/src',
      '    │   └── app/src/index.js',
      '    └── app/package.json'
    ].join('\n'));
  });
  
  it('should throw an error for unknown charset', () => {
    const structure = createTestStructure();
    // @ts-expect-error Testing invalid charset
    expect(() => generateTree(structure, { charset: 'invalid' }))
      .toThrow('Unknown charset: invalid');
  });
  
  it('should handle a complex nested tree', () => {
    const input = [
      'project',
      '  src',
      '    components',
      '      Button.tsx',
      '      Card.tsx',
      '      index.ts',
      '    utils',
      '      format.ts',
      '      validation.ts',
      '    App.tsx',
      '    index.tsx',
      '  tests',
      '    components',
      '      Button.test.tsx',
      '    utils',
      '      format.test.ts',
      '    App.test.tsx',
      '  public',
      '    index.html',
      '    favicon.ico',
      '  package.json',
      '  README.md'
    ].join('\n');
    
    const structure = parseInput(input);
    const result = generateTree(structure);
    
    // Test specific parts of the output
    expect(result).toContain('project');
    expect(result).toContain('src');
    expect(result).toContain('components');
    expect(result).toContain('Button.tsx');
    
    // Verify proper nesting with indentation
    const lines = result.split('\n');
    const projectLine = lines.findIndex(line => line.endsWith('project'));
    expect(lines[projectLine + 1].includes('├──')).toBe(true);
    expect(lines[projectLine + 1].includes('src')).toBe(true);
    
    // Verify correct line characters for last items
    const readmeLine = lines.findIndex(line => line.endsWith('README.md'));
    expect(lines[readmeLine].includes('└──')).toBe(true);
  });
  
  it('should handle empty children', () => {
    const structure: FileStructure = {
      name: '.',
      children: [],
      indentCount: -1,
      parent: null
    };
    
    const result = generateTree(structure);
    expect(result).toBe('.');
  });
  
  it('should handle options combination', () => {
    const structure = createTestStructure();
    const result = generateTree(structure, {
      charset: 'ascii',
      rootDot: false,
      trailingDirSlash: true
    });
    
    // Check combined features are working
    expect(result).toContain('app/');
    expect(result).toContain('src/');
    expect(result).toContain('|--');
    expect(result).not.toMatch(/^\./);
    
    // Check complete output
    expect(result).toBe([
      'app/',
      '|-- src/',
      '|   `-- index.js',
      '`-- package.json'
    ].join('\n'));
  });
});