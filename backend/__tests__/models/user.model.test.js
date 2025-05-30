import { mockUserModel } from '../utils/modelMocks.js';

jest.mock('../../src/models/user.model.js', () => {
  const mockModel = mockUserModel();
  const UserMock = jest.fn().mockImplementation(userData => {
    return mockModel.mockConstructor(userData);
  });
  
  UserMock.findByIdAndUpdate = mockModel.findByIdAndUpdate;
  UserMock.findById = mockModel.findById;
  UserMock.findOne = mockModel.findOne;
  
  return {
    __esModule: true,
    default: UserMock
  };
});

import User from '../../src/models/user.model.js';

describe('User Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create & save a user successfully', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com', 
      password: 'password123'
    };
    
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.fullName).toBe(userData.fullName);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.profilePic).toBe('');
    
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const userWithoutRequiredField = new User({ fullName: 'Invalid User' });
    
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err.name).toBe('ValidationError');
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail with short password', async () => {
    const userWithShortPassword = new User({
      fullName: 'Short Password User',
      email: 'short@example.com',
      password: '12345'
    });
    
    let err;
    try {
      await userWithShortPassword.save();
    } catch (error) {
      err = error;
    }
    
    expect(err.name).toBe('ValidationError');
    expect(err.errors.password).toBeDefined();
  });

  it('should enforce unique email constraint', async () => {
    const firstUser = new User({
      fullName: 'First User',
      email: 'duplicate@example.com',
      password: 'password123'
    });
    await firstUser.save();
    
    const duplicateUser = new User({
      fullName: 'Second User',
      email: 'duplicate@example.com',
      password: 'anotherpassword'
    });
    
    let err;
    try {
      await duplicateUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });

  it('should update user properties', async () => {
    const user = new User({
      fullName: 'Original Name',
      email: 'update@example.com',
      password: 'password123'
    });
    const savedUser = await user.save();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateData = {
      fullName: 'Updated Name',
      profilePic: 'https://example.com/pic.jpg',
    };
    
    const updatedUser = await User.findByIdAndUpdate(savedUser._id, updateData, { new: true });
    
    expect(updatedUser.fullName).toBe('Updated Name');
    expect(updatedUser.profilePic).toBe('https://example.com/pic.jpg');
    expect(updatedUser.updatedAt).not.toEqual(updatedUser.createdAt);
  });
});
