# Concord Testing Documentation

This document outlines the testing strategy for the Concord chat application, covering both frontend and backend tests.

## Overview

The Concord application has a comprehensive test suite that includes:

- **Frontend Tests**: Using Vitest and React Testing Library
- **Backend Tests**: Using Jest and Supertest

## Frontend Testing

### Setup

The frontend tests use the following technologies:
- **Vitest**: For test running and assertions
- **React Testing Library**: For rendering and interacting with React components
- **MSW (Mock Service Worker)**: For intercepting and mocking API requests

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies if needed
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories

1. **Store Tests**:
   - `useAuthStore.test.ts`: Tests authentication state management
   - `useChatStore.test.ts`: Tests chat and message state management

2. **Component Tests**:
   - `HomePage.test.tsx`: Tests the main page layout and conditional rendering
   - `ChatContainer.test.tsx`: Tests message display and interaction
   - `Sidebar.test.tsx`: Tests user list display and selection
   - `ChatHeader.test.tsx`: Tests user information display

3. **Utility Tests**:
   - `utils.test.ts`: Tests for utility functions like date formatting

## Backend Testing

### Setup

The backend tests use the following technologies:
- **Jest**: For test running and assertions
- **Supertest**: For making HTTP requests to Express endpoints
- **MongoDB Memory Server**: For spinning up an in-memory MongoDB instance

### Running Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies if needed
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories

1. **Route Tests**:
   - `auth.routes.test.js`: Tests authentication endpoints (signup, login, logout, etc.)
   - `message.routes.test.js`: Tests message endpoints (get messages, send message, etc.)

2. **Utility Tests**:
   - `utils.test.js`: Tests utility functions like token generation

## Best Practices

1. **Test Organization**:
   - Tests mirror the project structure
   - Each major component/module has its own test file

2. **Mocking**:
   - External APIs and services are mocked
   - Database operations use an in-memory database
   - Authentication is mocked for protected routes

3. **Coverage Goals**:
   - Aim for high test coverage of critical paths
   - Focus on business logic and user-facing functionality

## Troubleshooting

### Common Issues

1. **TypeScript Errors**:
   - Ensure proper type imports using `import type` for TypeScript interfaces
   - Fix any `any` type usage with proper typing
   
2. **Test Environment Issues**:
   - Make sure environment variables are set correctly in test files
   - For backend tests, ensure MongoDB Memory Server can start (requires proper Node.js version)

### Debugging Tests

- Use `console.log` statements in tests (they will appear in test output)
- Run single tests with `npm test -- -t "test name"`
- Examine test coverage reports in `coverage/` directories

## Adding New Tests

When adding new features, follow these guidelines for tests:

1. **Frontend**:
   - Test store changes and hooks
   - Test component rendering and interactions
   - Mock API requests for component tests
   
2. **Backend**:
   - Test API endpoints with different inputs
   - Test authentication and authorization
   - Test error handling cases

## Continuous Integration

Consider setting up GitHub Actions or another CI service to run tests on every push or pull request to maintain code quality and prevent regressions.
