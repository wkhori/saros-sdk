/**
 * Test setup file for vitest
 * This file runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Global setup before all tests
  console.log('Starting test suite...');
});

afterAll(() => {
  // Global cleanup after all tests
  console.log('Test suite completed.');
});
