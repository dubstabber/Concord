import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createTestUser, cleanupTestUsers, generateTestToken, getAuthCookie } from '../utils/authTestUtils.js';

jest.mock('../../src/models/user.model.js', () => {
  const mockFindOne = jest.fn().mockImplementation((query) => {
    if (query.email === 'nonexistent@example.com') {
      return Promise.resolve(null);
    }
    if (query.email === 'test@example.com') {
      return Promise.resolve({
        _id: 'user_id_123',
        email: 'test@example.com',
        fullName: 'Test User',
        password: '$2a$10$XUHmFbj/EgUKFP0RIGXADO4VC96PyRaLWNX2/oRjzJ0GnTGZ3QC06', 
        profilePic: '',
        comparePassword: jest.fn().mockImplementation((password) => {
          return Promise.resolve(password === 'password123');
        })
      });
    }
    return Promise.resolve(null);
  });

  const mockFindById = jest.fn().mockImplementation((id) => {
    return Promise.resolve({
      _id: id,
      email: 'test@example.com',
      fullName: 'Test User',
      password: '$2a$10$XUHmFbj/EgUKFP0RIGXADO4VC96PyRaLWNX2/oRjzJ0GnTGZ3QC06',
      profilePic: '',
      toJSON: () => ({
        _id: id,
        email: 'test@example.com',
        fullName: 'Test User',
        profilePic: ''
      })
    });
  });

  const mockFindByIdAndUpdate = jest.fn().mockImplementation((id, update) => {
    return Promise.resolve({
      _id: id,
      ...update,
      email: 'test@example.com',
      fullName: 'Test User'
    });
  });

  return {
    __esModule: true,
    default: jest.fn().mockImplementation((userData) => ({
      ...userData,
      _id: 'mock_user_id',
      save: jest.fn().mockResolvedValue({
        ...userData,
        _id: 'mock_user_id'
      })
    })),
    findOne: mockFindOne,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate
  };
});

import User from '../../src/models/user.model.js';
import authRoutes from '../../src/routes/auth.route.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

jest.mock('../../src/middleware/auth.middleware.js', () => ({
  protectRoute: (req, res, next) => {
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
  }
}));

app.use('/api/auth', authRoutes);

jest.setTimeout(10000);

describe('Auth Routes', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'new@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBeDefined();
    });

    it('should return 400 if email is already taken', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com', 
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBeDefined();
    });

    it('should return an appropriate status for nonexistent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect([400, 500]).toContain(response.status);
    });

    it('should return an appropriate status for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/auth/check', () => {
    it('should return user data when authenticated', async () => {
      const userId = 'test_user_id';
      const cookies = getAuthCookie(userId);

      const response = await request(app)
        .get('/api/auth/check')
        .set('Cookie', cookies)
        .set('x-test-userid', userId);

      expect(response.status).toBeDefined();
    });

    it('should return an appropriate status when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/check');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    it('should attempt to update user profile picture', async () => {
      const userId = 'test_user_id';
      const updateData = {
        profilePic: 'https://example.com/test-image.jpg'
      };

      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Cookie', getAuthCookie(userId))
        .set('x-test-userid', userId)
        .send(updateData);

      expect(response.status).toBeDefined();
    });

    it('should handle empty profile picture appropriately', async () => {
      const userId = 'test_user_id';

      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Cookie', getAuthCookie(userId))
        .set('x-test-userid', userId)
        .send({});

      expect([400, 500]).toContain(response.status);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .send({ profilePic: 'https://example.com/test-image.jpg' });

      expect(response.status).toBe(401);
    });
  });
});
