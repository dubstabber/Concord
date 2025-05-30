import { connect, closeDatabase } from './utils/db.js';


beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await closeDatabase();
});


process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';


jest.mock('socket.io', () => {
  const mockOn = jest.fn();
  const mockEmit = jest.fn();
  const mockJoin = jest.fn();
  const mockTo = jest.fn(() => ({ emit: mockEmit }));
  
  return {
    Server: jest.fn(() => ({
      on: mockOn,
      emit: mockEmit,
      to: mockTo,
    })),
  };
});
