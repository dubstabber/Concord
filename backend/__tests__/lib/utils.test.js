import jwt from 'jsonwebtoken';
import { generateToken } from '../../src/lib/utils.js';

const originalEnv = process.env;

describe('Utility Functions', () => {
  describe('generateToken', () => {
    it('should generate a JWT token and set a cookie', () => {
      const res = {
        cookie: jest.fn()
      };
      
      process.env = {
        ...originalEnv,
        JWT_SECRET: 'test_jwt_secret',
        NODE_ENV: 'test'
      };
      
      const userId = '123456789';
      
      const token = generateToken(userId, res);
      
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('userId', userId);
      
      expect(res.cookie).toHaveBeenCalledWith('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });
    });
    
    it('should set secure cookie in production environment', () => {
      const res = {
        cookie: jest.fn()
      };
      
      process.env = {
        ...originalEnv,
        JWT_SECRET: 'test_jwt_secret',
        NODE_ENV: 'production'
      };
      
      const token = generateToken('userId', res);
      
      const cookieCall = res.cookie.mock.calls[0];
      expect(cookieCall[2].secure).toBe(true);
      
      process.env = originalEnv;
    });
  });
});
