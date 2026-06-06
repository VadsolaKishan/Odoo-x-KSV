import type { Config } from 'jest';

// Setup default test environment variables if not present
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_vendorbridge_12345';
process.env.NODE_ENV = 'test';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000, // Increase test timeout to 30s to accommodate Neon DB queries and bcrypt hashes
};

export default config;
