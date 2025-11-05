// Test setup and global mocks
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock DOM methods
global.document = {
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn(),
  getElementById: jest.fn()
};

global.window = {
  location: { pathname: '/' },
  localStorage: localStorageMock
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});