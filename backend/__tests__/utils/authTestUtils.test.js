import { createTestUser, generateTestToken, cleanupTestUsers, getAuthCookie } from './authTestUtils.js';

describe('Auth Test Utilities', () => {
  test('auth test utility functions are defined', () => {
    expect(createTestUser).toBeDefined();
    expect(generateTestToken).toBeDefined();
    expect(cleanupTestUsers).toBeDefined();
    expect(getAuthCookie).toBeDefined();
  });
  
  test('generateTestToken returns a string', () => {
    const token = generateTestToken('test123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
  
  test('getAuthCookie returns an array with JWT cookie', () => {
    const cookies = getAuthCookie('test123');
    expect(Array.isArray(cookies)).toBe(true);
    expect(cookies[0]).toContain('jwt=');
  });
});
