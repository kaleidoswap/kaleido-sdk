module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/schema.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 20,
      lines: 30,
      statements: 30,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],
  verbose: true,
};
