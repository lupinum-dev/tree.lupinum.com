import { describe, it, expect, vi } from 'vitest';
import { parseInput, splitInput } from '../app/lib/parse-input';
import type { FileStructure } from '../app/lib/FileStructure';

describe('splitInput', () => {
  it('should split a simple string into FileStructure objects', () => {
    const input = 'app\n  src\n    index.js';
    const result = splitInput(input);
    
    expect(result).toHaveLength(3);
    expect(result[0]?.name).toBe('app');
    expect(result[0]?.indentCount).toBe(0);
    expect(result[1]?.name).toBe('src');
    expect(result[1]?.indentCount).toBe(2);
    expect(result[2]?.name).toBe('index.js');
    expect(result[2]?.indentCount).toBe(4);
  });
  
  it('should handle markdown bullet points', () => {
    const input = '- app\n  - src\n    - index.js';
    const result = splitInput(input);
    
    expect(result).toHaveLength(3);
    expect(result[0]?.name).toBe('app');
    expect(result[0]?.indentCount).toBe(0);
    expect(result[1]?.name).toBe('src');
    expect(result[1]?.indentCount).toBe(2);
    expect(result[2]?.name).toBe('index.js');
    expect(result[2]?.indentCount).toBe(4);
  });
  
  it('should filter out empty lines', () => {
    const input = 'app\n\n  src\n    \n    index.js';
    const result = splitInput(input);
    
    expect(result).toHaveLength(3);
  });
  
  it('should return empty array for empty input', () => {
    const result = splitInput('');
    expect(result).toEqual([]);
  });
  
});

describe('parseInput', () => {
  it('should parse a basic tree structure', () => {
    const input = 'app\n  src\n    index.js\n  package.json';
    const result = parseInput(input);
    
    // Check root node
    expect(result.name).toBe('.');
    expect(result.indentCount).toBe(-1);
    expect(result.parent).toBeNull();
    expect(result.children).toHaveLength(1);
    
    // Check first level - app
    const app = result.children[0];
    if (!app) {
      throw new Error('App node is missing');
    }
    expect(app.name).toBe('app');
    expect(app.parent).toBe(result);
    expect(app.children).toHaveLength(2);
    
    // Check src directory
    const src = app.children[0];
    if (!src) {
      throw new Error('Src node is missing');
    }
    expect(src.name).toBe('src');
    expect(src.parent).toBe(app);
    expect(src.children).toHaveLength(1);
    
    // Check index.js file
    const indexJs = src.children[0];
    if (!indexJs) {
      throw new Error('Index.js node is missing');
    }
    expect(indexJs.name).toBe('index.js');
    expect(indexJs.parent).toBe(src);
    expect(indexJs.children).toHaveLength(0);
    
    // Check package.json file
    const packageJson = app.children[1];
    if (!packageJson) {
      throw new Error('Package.json node is missing');
    }
    expect(packageJson.name).toBe('package.json');
    expect(packageJson.parent).toBe(app);
    expect(packageJson.children).toHaveLength(0);
  });
  
  it('should handle files at the same level', () => {
    const input = 'app\n  file1.js\n  file2.js\n  file3.js';
    const result = parseInput(input);
    
    const app = result.children[0];
    if (!app) {
      throw new Error('App node is missing');
    }
    expect(app.children).toHaveLength(3);
    expect(app.children[0]?.name).toBe('file1.js');
    expect(app.children[1]?.name).toBe('file2.js');
    expect(app.children[2]?.name).toBe('file3.js');
  });
  
  it('should handle multiple root level items', () => {
    const input = 'app1\napp2\napp3';
    const result = parseInput(input);
    
    expect(result.children).toHaveLength(3);
    expect(result.children[0]?.name).toBe('app1');
    expect(result.children[1]?.name).toBe('app2');
    expect(result.children[2]?.name).toBe('app3');
  });
  

  
  it('should throw error for non-string inputs', () => {
    // @ts-expect-error Testing invalid input
    expect(() => parseInput(null)).toThrow(/Input must be a non-empty string/);
    // @ts-expect-error Testing invalid input
    expect(() => parseInput(123)).toThrow(/Input must be a non-empty string/);
    expect(() => parseInput('')).toThrow(/Input must be a non-empty string/);
  });
  
  it('should handle real-world example', () => {
    const input = [
      'my-project',
      '  node_modules',
      '    lodash',
      '      package.json',
      '  src',
      '    components',
      '      Button.js',
      '      Card.js',
      '    App.js',
      '    index.js',
      '  package.json',
      '  README.md'
    ].join('\n');
    
    const result = parseInput(input);
    
    // Basic structure checks
    expect(result.children).toHaveLength(1);
    const project = result.children[0];
    if (!project) {
      throw new Error('Project node is missing');
    }
    expect(project.name).toBe('my-project');
    expect(project.children).toHaveLength(4);
    
    // Check specific files exist at the right levels
    const getNode = (path: string[]): FileStructure => {
      let current = result;
      for (const name of path) {
        const found = current.children.find(child => child.name === name);
        if (!found) {
          throw new Error(`Node with name "${name}" not found in path: ${path.join('/')}`);
        }
        current = found;
      }
      return current;
    };
    
    // Check some paths
    const buttonNode = getNode(['my-project', 'src', 'components', 'Button.js']);
    const packageJsonNode = getNode(['my-project', 'node_modules', 'lodash', 'package.json']);
    const readmeNode = getNode(['my-project', 'README.md']);
    
    expect(buttonNode.children).toHaveLength(0);
    expect(packageJsonNode.children).toHaveLength(0);
    expect(readmeNode.children).toHaveLength(0);
  });
});