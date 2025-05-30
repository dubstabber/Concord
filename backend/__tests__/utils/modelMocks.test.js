import { mockUserModel, mockMessageModel } from './modelMocks.js';

describe('Model Mocks', () => {
  test('model mock functions are defined', () => {
    expect(mockUserModel).toBeDefined();
    expect(mockMessageModel).toBeDefined();
  });
  
  test('mockUserModel returns expected structure', () => {
    const userModel = mockUserModel();
    expect(userModel.findOne).toBeDefined();
    expect(userModel.findById).toBeDefined();
    expect(userModel.findByIdAndUpdate).toBeDefined();
    expect(userModel.mockConstructor).toBeDefined();
  });
  
  test('mockMessageModel returns expected structure', () => {
    const messageModel = mockMessageModel();
    expect(messageModel.find).toBeDefined();
    expect(messageModel.findById).toBeDefined();
    expect(messageModel.insertMany).toBeDefined();
    expect(messageModel.deleteMany).toBeDefined();
    expect(messageModel.mockConstructor).toBeDefined();
  });
});
