import jwt from 'jsonwebtoken';


let testUserCounter = 1;
const testUsers = [];


export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$XUHmFbj/EgUKFP0RIGXADO4VC96PyRaLWNX2/oRjzJ0GnTGZ3QC06' 
  };

  const userId = `test_user_${testUserCounter++}`;
  const user = {
    _id: userId,
    ...defaultUser,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  testUsers.push(user);
  return user;
};


export const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test_jwt_secret', {
    expiresIn: '30d'
  });
};


export const cleanupTestUsers = async () => {
  testUsers.length = 0;
  testUserCounter = 1;
};


export const test = () => {
  return { message: 'Test utils working' };
};


export const getAuthCookie = (userId) => {
  const token = generateTestToken(userId);
  return [`jwt=${token}; HttpOnly; Path=/; Max-Age=2592000`];
};
