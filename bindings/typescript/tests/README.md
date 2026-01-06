# Web Bindings Tests

Comprehensive test suite for the Kaleidoswap Web/WASM bindings.

## Test Structure

```
tests/
├── setup.ts              # Jest setup and global configuration
├── config.test.ts        # Configuration tests
├── client.test.ts        # Client initialization tests
├── utils.test.ts         # Utility function tests
├── api.test.ts          # API integration tests
├── error-handling.test.ts # Error handling tests
├── web.rs               # Rust unit tests (wasm-bindgen-test)
└── integration.html     # Browser integration tests
```

## Test Types

### 1. TypeScript Unit Tests (Jest)

Modern TypeScript tests using Jest with proper WASM support.

**Run:**
```bash
# All unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# With coverage
npm run test:unit:coverage
```

**Features:**
- ✅ Fast execution
- ✅ Code coverage reporting
- ✅ Watch mode for development
- ✅ Type-safe with TypeScript
- ✅ Mocking support
- ✅ Parallel test execution

### 2. Rust Unit Tests (wasm-bindgen-test)

Rust tests that run in a headless browser.

**Run:**
```bash
# Chrome
npm run test:wasm

# Firefox
npm run test:firefox

# All browsers
npm run test:all
```

### 3. Browser Integration Tests

Interactive browser tests with visual feedback.

**Run:**
```bash
npm run test:integration
# Open: http://localhost:8000/tests/integration.html
```

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Build WASM module
npm run build

# Run all tests
npm test
```

### Individual Test Suites

```bash
# Configuration tests only
npm run test:unit -- config.test.ts

# API tests only
npm run test:unit -- api.test.ts

# With verbose output
npm run test:unit -- --verbose
```

### Continuous Integration

```bash
# Run in CI mode
npm run test:unit -- --ci --coverage --maxWorkers=2

# Skip integration tests (no test server)
SKIP_INTEGRATION_TESTS=true npm run test:unit
```

## Writing Tests

### Test Template

```typescript
/**
 * Feature Tests
 * Description of what this test suite covers
 */

import init, { KaleidoClient, KaleidoConfig } from '../pkg/kaleidoswap_web';

describe('Feature Name', () => {
  beforeAll(async () => {
    await init();
  });

  describe('sub-feature', () => {
    it('should do something specific', () => {
      // Arrange
      const config = KaleidoConfig.withDefaults('https://api.test.com');
      
      // Act
      const client = new KaleidoClient(config);
      
      // Assert
      expect(client).toBeDefined();
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should validate input', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = processInput(input);
     
     // Assert
     expect(result).toBe('TEST');
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should throw error when amount is negative')
   
   // Bad
   it('test amount')
   ```

3. **Test Edge Cases**
   ```typescript
   it('should handle zero amount', () => {
     const result = toSmallestUnits(0, 8);
     expect(result).toBe(0);
   });
   
   it('should handle very large amounts', () => {
     const result = toSmallestUnits(21_000_000, 8);
     expect(result).toBe(2_100_000_000_000_000);
   });
   ```

4. **Clean Up Resources**
   ```typescript
   afterEach(() => {
     if (client) {
       client.free();
     }
   });
   ```

5. **Skip Tests Conditionally**
   ```typescript
   const describeIntegration = process.env.CI ? describe.skip : describe;
   
   describeIntegration('API Tests', () => {
     // Tests that require test server
   });
   ```

## Test Coverage

View coverage report after running:
```bash
npm run test:unit:coverage
open coverage/index.html
```

**Target Coverage:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Environment Variables

```bash
# Skip integration tests
export SKIP_INTEGRATION_TESTS=true

# Use custom test API
export TEST_API_URL=https://api.staging.kaleidoswap.com

# Enable debug logging
export DEBUG=kaleidoswap:*
```

## Debugging Tests

### VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-cache",
    "--watchAll=false"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Command Line

```bash
# Run specific test with debug output
node --inspect-brk node_modules/.bin/jest --runInBand config.test.ts

# Then open chrome://inspect in Chrome
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Web Bindings

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
      
      - name: Install dependencies
        run: npm install
        working-directory: bindings/typescript
      
      - name: Run tests
        run: npm run test:unit:coverage
        working-directory: bindings/typescript
        env:
          SKIP_INTEGRATION_TESTS: true
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./bindings/typescript/coverage/lcov.info
```

## Troubleshooting

### Tests Not Running

```bash
# Rebuild WASM module
npm run clean
npm run build
npm test
```

### Import Errors

```bash
# Check WASM module was built
ls -la pkg/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Timeout Errors

```bash
# Increase timeout in jest.config.js
testTimeout: 30000  # 30 seconds
```

### Memory Issues

```bash
# Run tests with more memory
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [wasm-bindgen-test Guide](https://rustwasm.github.io/wasm-bindgen/wasm-bindgen-test/index.html)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: January 2, 2026  
**Maintained By**: Kaleidoswap Core Team
