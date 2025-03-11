import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FileStructure } from '../app/lib/FileStructure';

/**
 * Creates a simple test FileStructure
 * @returns A FileStructure for testing
 */
export function createFileStructure(): FileStructure {
  // Create the root node
  const root: FileStructure = {
    name: '.',
    children: [],
    indentCount: -1,
    parent: null
  };
  
  // Create the app node
  const app: FileStructure = {
    name: 'app',
    children: [],
    indentCount: 0,
    parent: root
  };
  root.children.push(app);
  
  // Create the src node
  const src: FileStructure = {
    name: 'src',
    children: [],
    indentCount: 2,
    parent: app
  };
  app.children.push(src);
  
  // Create the index.js node
  const indexJs: FileStructure = {
    name: 'index.js',
    children: [],
    indentCount: 4,
    parent: src
  };
  src.children.push(indexJs);
  
  // Create the package.json node
  const packageJson: FileStructure = {
    name: 'package.json',
    children: [],
    indentCount: 2,
    parent: app
  };
  app.children.push(packageJson);
  
  return root;
}

/**
 * Verifies the structure of a basic file tree
 * @param structure The structure to verify
 */
export function verifyBasicStructure(structure: FileStructure): void {
  // Root node checks
  expect(structure.name).toBe('.');
  expect(structure.parent).toBeNull();
  expect(structure.children.length).toBe(1);
  
  // App node checks
  const app = structure.children[0];
  expect(app.name).toBe('app');
  expect(app.parent).toBe(structure);
  expect(app.children.length).toBe(2);
  
  // Src node checks
  const src = app.children[0];
  expect(src.name).toBe('src');
  expect(src.parent).toBe(app);
  expect(src.children.length).toBe(1);
  
  // Index.js node checks
  const indexJs = src.children[0];
  expect(indexJs.name).toBe('index.js');
  expect(indexJs.parent).toBe(src);
  expect(indexJs.children.length).toBe(0);
  
  // Package.json node checks
  const packageJson = app.children[1];
  expect(packageJson.name).toBe('package.json');
  expect(packageJson.parent).toBe(app);
  expect(packageJson.children.length).toBe(0);
}

/**
 * Sets up mocks for console methods
 * @returns Cleanup function to restore original console methods
 */
export function setupConsoleMocks() {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
  
  return () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  };
}

/**
 * Setup file for vitest config that adds needed mocks and polyfills
 */
export function setupTestEnv() {
  // Add any global mocks or polyfills needed for tests
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  
  // Add mock for any browser APIs if needed
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(Date.now()), 0);
  };
  
  // Return cleanup function
  return () => {
    // Clean up any global mocks
  };
}