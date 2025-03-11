import { describe, it, expect } from 'vitest';
import {
  formatTree,
  formatNestedJson,
  formatArrayJson,
  formatFlatJson,
  formatYaml,
  formatXml,
  formatDot,
  formatMarkdown
} from '../app/lib/tree-formatters';
import { parseInput } from '../app/lib/parse-input';
import type { FileStructure } from '../app/lib/FileStructure';
import type { FormatType } from '../app/lib/tree-formatters';

// Helper function to create a simple test structure
function createTestStructure(): FileStructure {
  return parseInput('app\n  src\n    index.js\n  package.json');
}

describe('formatTree', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatTree(null, 'utf-8')).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatTree(undefined, 'utf-8')).toThrow('Structure is required');
  });
  
  it('should call the correct formatter based on format type', () => {
    const structure = createTestStructure();
    
    // Test a few formats to ensure they're working
    const asciiResult = formatTree(structure, 'ascii');
    expect(asciiResult).toContain('|--');
    
    const utf8Result = formatTree(structure, 'utf-8');
    expect(utf8Result).toContain('├──');
    
    const jsonResult = formatTree(structure, 'json-nested');
    expect(JSON.parse(jsonResult)).toBeDefined();
    
    const markdownResult = formatTree(structure, 'markdown');
    expect(markdownResult).toContain('* app');
  });
  
  it('should use utf-8 for unknown format types', () => {
    const structure = createTestStructure();
    // @ts-expect-error Testing invalid format
    const result = formatTree(structure, 'unknown-format');
    
    // Should default to utf-8 tree 
    expect(result).toContain('├──');
    expect(result).toContain('└──');
  });
  
  it('should pass options through to the generator', () => {
    const structure = createTestStructure();
    const result = formatTree(structure, 'ascii', { rootDot: false });
    
    // Check that options were passed to generator
    expect(result).not.toMatch(/^\./);
    expect(result).toContain('app');
  });
});

describe('formatNestedJson', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatNestedJson(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatNestedJson(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to nested JSON', () => {
    const structure = createTestStructure();
    const result = formatNestedJson(structure);
    const parsed = JSON.parse(result);
    
    // Check structure
    expect(parsed).toHaveProperty('.');
    expect(parsed['.']).toHaveProperty('app');
    expect(parsed['.'].app).toHaveProperty('src');
    expect(parsed['.'].app).toHaveProperty('package.json');
    expect(parsed['.'].app.src).toHaveProperty('index.js');
    
    // Files should be null
    expect(parsed['.'].app.src['index.js']).toBeNull();
    expect(parsed['.'].app['package.json']).toBeNull();
  });
  
  it('should handle files and directories correctly', () => {
    const structure = parseInput('app\n  file.txt\n  empty-dir');
    const result = formatNestedJson(structure);
    const parsed = JSON.parse(result);
    
    // Check empty directory and file representation
    expect(parsed['.'].app['file.txt']).toBeNull(); // File is null
    expect(parsed['.'].app['empty-dir']).toEqual({}); // Empty dir is empty object
  });
});

describe('formatArrayJson', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatArrayJson(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatArrayJson(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to JSON with type info', () => {
    const structure = createTestStructure();
    const result = formatArrayJson(structure);
    const parsed = JSON.parse(result);
    
    // Check root structure
    expect(parsed.name).toBe('root');
    expect(parsed.type).toBe('directory');
    expect(parsed.children).toBeInstanceOf(Array);
    expect(parsed.children).toHaveLength(1);
    
    // Check first level
    const app = parsed.children[0];
    expect(app.name).toBe('app');
    expect(app.type).toBe('directory');
    expect(app.children).toHaveLength(2);
    
    // Check src directory
    const src = app.children.find((c: any) => c.name === 'src');
    expect(src.type).toBe('directory');
    expect(src.children).toHaveLength(1);
    
    // Check index.js file
    const indexJs = src.children[0];
    expect(indexJs.name).toBe('index.js');
    expect(indexJs.type).toBe('file');
    expect(indexJs.children).toBeUndefined();
  });
});

describe('formatFlatJson', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatFlatJson(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatFlatJson(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to flat path-based JSON', () => {
    const structure = createTestStructure();
    const result = formatFlatJson(structure);
    const parsed = JSON.parse(result);
    
    // Check overall structure
    expect(parsed).toHaveProperty('files');
    expect(parsed).toHaveProperty('directories');
    expect(parsed.files).toBeInstanceOf(Array);
    expect(parsed.directories).toBeInstanceOf(Array);
    
    // Check directories
    expect(parsed.directories).toHaveLength(2);
    expect(parsed.directories).toContainEqual({ path: 'app' });
    expect(parsed.directories).toContainEqual({ path: 'app/src' });
    
    // Check files
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files).toContainEqual({ path: 'app/src/index.js', type: 'file' });
    expect(parsed.files).toContainEqual({ path: 'app/package.json', type: 'file' });
  });
});

describe('formatYaml', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatYaml(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatYaml(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to YAML', () => {
    const structure = createTestStructure();
    const result = formatYaml(structure);
    
    // Check YAML structure without parsing (since we don't have a YAML parser)
    expect(result).toContain('root:');
    expect(result).toContain('  app:');
    expect(result).toContain('    src:');
    expect(result).toContain('      index.js: null');
    expect(result).toContain('    package.json: null');
  });
});

describe('formatXml', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatXml(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatXml(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to XML', () => {
    const structure = createTestStructure();
    const result = formatXml(structure);
    
    // Check XML structure 
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<directory name="root">');
    expect(result).toContain('<directory name="app">');
    expect(result).toContain('<directory name="src">');
    expect(result).toContain('<file name="index.js" />');
    expect(result).toContain('<file name="package.json" />');
    expect(result).toContain('</directory>');
  });
  
  it('should escape special XML characters', () => {
    const structure = parseInput('app\n  file&.txt\n  <special>.js');
    const result = formatXml(structure);
    
    // Check that special characters are escaped
    expect(result).toContain('<file name="file&amp;.txt" />');
    expect(result).toContain('<file name="&lt;special&gt;.js" />');
  });
});

describe('formatDot', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatDot(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatDot(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to dot notation', () => {
    const structure = createTestStructure();
    const result = formatDot(structure);
    const lines = result.split('\n');
    
    // Check that all paths are included
    expect(lines).toContain('app');
    expect(lines).toContain('app/package.json');
    expect(lines).toContain('app/src');
    expect(lines).toContain('app/src/index.js');
    
    // Check that paths are sorted
    expect(lines).toEqual([...lines].sort());
  });
});

describe('formatMarkdown', () => {
  it('should throw an error if structure is missing', () => {
    // @ts-expect-error Testing invalid input
    expect(() => formatMarkdown(null)).toThrow('Structure is required');
    // @ts-expect-error Testing invalid input
    expect(() => formatMarkdown(undefined)).toThrow('Structure is required');
  });
  
  it('should format a simple structure to markdown', () => {
    const structure = createTestStructure();
    const result = formatMarkdown(structure);
    const lines = result.split('\n').filter(line => line.trim());
    
    // Check markdown structure
    expect(lines[0]).toBe('* app/');
    expect(lines[1]).toBe('  * src/');
    expect(lines[2]).toBe('    * index.js');
    expect(lines[3]).toBe('  * package.json');
    
    // Directories should have trailing slashes
    expect(result).toContain('app/');
    expect(result).toContain('src/');
    
    // Files should not have trailing slashes
    expect(result).not.toContain('index.js/');
    expect(result).not.toContain('package.json/');
  });
});