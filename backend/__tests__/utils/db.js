import mongoose from 'mongoose';


const mockConnect = jest.fn();
const mockDisconnect = jest.fn();


mongoose.connect = mockConnect;
mongoose.connection = {
  dropDatabase: jest.fn(),
  close: mockDisconnect,
  collections: {}
};


export const connect = async () => {
  
  return Promise.resolve();
};


export const closeDatabase = async () => {
  
  return Promise.resolve();
};


export const clearDatabase = async () => {
  
  return Promise.resolve();
};
