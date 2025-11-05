module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/**/*.js',
    'frontend/**/*.js',
    '!backend/certs/**',
    '!**/node_modules/**',
    '!backend/server.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};