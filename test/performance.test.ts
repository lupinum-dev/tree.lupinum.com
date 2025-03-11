import { describe, it, expect, beforeEach } from 'vitest';
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

describe('Performance Tests', () => {
  describe('Parse Input Performance', () => {
    it('should handle deep structures efficiently', () => {
      const input = generateDeepStructure(10, 5); // 10 levels deep, 5 files per level
      expect(() => parseInput(input)).not.toThrow();
      
      const parsed = parseInput(input);
      expect(parsed.name).toBe('.');
    });
    
    it('should handle wide structures efficiently', () => {
      const input = generateWideStructure(100, 10); // 100 directories with 10 files each
      expect(() => parseInput(input)).not.toThrow();
      
      const parsed = parseInput(input);
      expect(parsed.name).toBe('.');
    });
    
    it('should parse small structure quickly', () => {
      const input = generateDeepStructure(3, 3);
      const startTime = performance.now();
      parseInput(input);
      const endTime = performance.now();
      
      // Just verify it completes in a reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should parse medium structure quickly', () => {
      const input = generateDeepStructure(5, 5);
      const startTime = performance.now();
      parseInput(input);
      const endTime = performance.now();
      
      // Just verify it completes in a reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should parse large structure quickly', () => {
      const input = generateWideStructure(50, 5);
      const startTime = performance.now();
      parseInput(input);
      const endTime = performance.now();
      
      // Just verify it completes in a reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
  
  describe('Generate Tree Performance', () => {
    let smallStructure: FileStructure;
    let mediumStructure: FileStructure;
    let largeStructure: FileStructure;
    
    beforeEach(() => {
      smallStructure = parseInput(generateDeepStructure(3, 3));
      mediumStructure = parseInput(generateDeepStructure(5, 5));
      largeStructure = parseInput(generateWideStructure(50, 5));
    });
    
    it('should generate trees for large structures without errors', () => {
      const veryLargeStructure = parseInput(generateDeepStructure(15, 3));
      expect(() => generateTree(veryLargeStructure)).not.toThrow();
    });
    
    it('should generate small tree (utf-8) quickly', () => {
      const startTime = performance.now();
      generateTree(smallStructure, { charset: 'utf-8' });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should generate small tree (ascii) quickly', () => {
      const startTime = performance.now();
      generateTree(smallStructure, { charset: 'ascii' });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should generate medium tree (utf-8) quickly', () => {
      const startTime = performance.now();
      generateTree(mediumStructure, { charset: 'utf-8' });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should generate large tree (utf-8) quickly', () => {
      const startTime = performance.now();
      generateTree(largeStructure, { charset: 'utf-8' });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
  
  describe('Format Tree Performance', () => {
    let mediumStructure: FileStructure;
    
    beforeEach(() => {
      mediumStructure = parseInput(generateDeepStructure(5, 5));
    });
    
    it('should format as utf-8 quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'utf-8');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as json-nested quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'json-nested');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as json-array quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'json-array');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as json-flat quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'json-flat');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as yaml quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'yaml');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as xml quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'xml');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
    
    it('should format as markdown quickly', () => {
      const startTime = performance.now();
      formatTree(mediumStructure, 'markdown');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});