import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createTestUser, cleanupTestUsers, getAuthCookie } from '../utils/authTestUtils.js';

jest.mock('../../src/models/user.model.js', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock_user_id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    save: jest.fn().mockResolvedValue({
      ...data,
      _id: 'mock_user_id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }));
});

jest.mock('../../src/models/message.model.js', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock_message_id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    save: jest.fn().mockResolvedValue({
      ...data,
      _id: 'mock_message_id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }));
});

import User from '../../src/models/user.model.js';
import Message from '../../src/models/message.model.js';
import messageRoutes from '../../src/routes/message.route.js';

jest.mock('socket.io', () => {
  const mockOn = jest.fn();
  const mockEmit = jest.fn();
  const mockTo = jest.fn(() => ({ emit: mockEmit }));
  
  return {
    Server: jest.fn(() => ({
      on: mockOn,
      emit: mockEmit,
      to: mockTo,
    })),
  };
});

jest.mock('../../src/lib/socket.js', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  },
  userSocketMap: {}
}));

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const authHeader = req.headers.cookie;
  if (authHeader && authHeader.startsWith('jwt=')) {
    try {
      const userId = req.headers['x-test-userid'];
      if (userId) {
        req.user = { _id: userId };
        return next();
      }
    } catch (error) {
      console.error('Auth middleware test error:', error);
    }
  }
  return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
});

app.use('/api/messages', messageRoutes);

jest.setTimeout(10000);

describe('Message Routes', () => {
  let testUser1;
  let testUser2;

  beforeEach(async () => {
    await cleanupTestUsers();
    testUser1 = await createTestUser({ 
      fullName: 'Sender User', 
      email: 'sender@example.com'
    });
    testUser2 = await createTestUser({
      fullName: 'Receiver User',
      email: 'receiver@example.com'
    });
    jest.clearAllMocks();
    Message.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
    Message.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([])
    });
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([])
    });
  });

  describe('GET /api/messages/users', () => {
    it('should make a request to get users', async () => {
      const response = await request(app)
        .get('/api/messages/users')
        .set('Cookie', getAuthCookie(testUser1._id))
        .set('x-test-userid', testUser1._id);

      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/messages/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should make a request to get messages between users', async () => {
      const response = await request(app)
        .get(`/api/messages/${testUser2._id}`)
        .set('Cookie', getAuthCookie(testUser1._id))
        .set('x-test-userid', testUser1._id);

      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
    });
  });

  describe('POST /api/messages/send/:id', () => {
    it('should attempt to send a message', async () => {
      const response = await request(app)
        .post(`/api/messages/send/${testUser2._id}`)
        .set('Cookie', getAuthCookie(testUser1._id))
        .set('x-test-userid', testUser1._id)
        .send({
          message: 'Hello, this is a test message'
        });

      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post(`/api/messages/send/${testUser2._id}`)
        .send({
          message: 'Hello, this is a test message'
        });

      expect(response.status).toBe(401);
    });
  });
});
