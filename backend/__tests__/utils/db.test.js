import { connect, closeDatabase, clearDatabase } from './db.js';

describe('Database Utilities', () => {
  test('database functions are defined', () => {
    expect(connect).toBeDefined();
    expect(closeDatabase).toBeDefined();
    expect(clearDatabase).toBeDefined();
  });
  
  test('connect resolves without error', async () => {
    await expect(connect()).resolves.not.toThrow();
  });
  
  test('closeDatabase resolves without error', async () => {
    await expect(closeDatabase()).resolves.not.toThrow();
  });
  
  test('clearDatabase resolves without error', async () => {
    await expect(clearDatabase()).resolves.not.toThrow();
  });
});
