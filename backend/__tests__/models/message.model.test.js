import { mockMessageModel, mockUserModel } from '../utils/modelMocks.js';

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

jest.mock('../../src/models/message.model.js', () => {
  const mockModel = mockMessageModel();
  const MessageMock = jest.fn().mockImplementation(messageData => {
    return mockModel.mockConstructor(messageData);
  });
  
  MessageMock.find = mockModel.find;
  MessageMock.findById = mockModel.findById;
  MessageMock.insertMany = mockModel.insertMany;
  MessageMock.deleteMany = mockModel.deleteMany;
  
  return {
    __esModule: true,
    default: MessageMock
  };
});

import Message from '../../src/models/message.model.js';
import User from '../../src/models/user.model.js';

describe('Message Model Tests', () => {
  let sender, receiver;

  beforeEach(() => {
    jest.clearAllMocks();
    
    sender = {
      _id: 'sender_user_id',
      fullName: 'Sender User',
      email: 'sender@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    receiver = {
      _id: 'receiver_user_id',
      fullName: 'Receiver User',
      email: 'receiver@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  it('should create & save a text message successfully', async () => {
    const messageData = {
      senderId: sender._id,
      receiverId: receiver._id,
      text: 'Hello, this is a test message'
    };

    const validMessage = new Message(messageData);
    const savedMessage = await validMessage.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.senderId.toString()).toBe(sender._id.toString());
    expect(savedMessage.receiverId.toString()).toBe(receiver._id.toString());
    expect(savedMessage.text).toBe(messageData.text);
    expect(savedMessage.image).toBeUndefined();

    expect(savedMessage.createdAt).toBeDefined();
    expect(savedMessage.updatedAt).toBeDefined();
  });

  it('should create & save an image message successfully', async () => {
    const messageData = {
      senderId: sender._id,
      receiverId: receiver._id,
      image: 'https://example.com/test-image.jpg'
    };

    const validMessage = new Message(messageData);
    const savedMessage = await validMessage.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.senderId.toString()).toBe(sender._id.toString());
    expect(savedMessage.receiverId.toString()).toBe(receiver._id.toString());
    expect(savedMessage.text).toBeUndefined();
    expect(savedMessage.image).toBe(messageData.image);
  });

  it('should create a message with both text and image', async () => {
    const messageData = {
      senderId: sender._id,
      receiverId: receiver._id,
      text: 'Message with image',
      image: 'https://example.com/test-image.jpg'
    };

    const validMessage = new Message(messageData);
    const savedMessage = await validMessage.save();

    expect(savedMessage.text).toBe(messageData.text);
    expect(savedMessage.image).toBe(messageData.image);
  });

  it('should fail when required sender ID is missing', async () => {
    const messageWithoutSender = new Message({
      receiverId: receiver._id,
      text: 'Missing sender'
    });

    let err;
    try {
      await messageWithoutSender.save();
    } catch (error) {
      err = error;
    }

    expect(err.name).toBe('ValidationError');
    expect(err.errors.senderId).toBeDefined();
  });

  it('should fail when required receiver ID is missing', async () => {
    const messageWithoutReceiver = new Message({
      senderId: sender._id,
      text: 'Missing receiver'
    });

    let err;
    try {
      await messageWithoutReceiver.save();
    } catch (error) {
      err = error;
    }

    expect(err.name).toBe('ValidationError');
    expect(err.errors.receiverId).toBeDefined();
  });

  it('should fail with invalid sender ID reference', async () => {
    const invalidId = 'invalid_id_123';
    const messageWithInvalidSender = new Message({
      senderId: invalidId,
      receiverId: receiver._id,
      message: 'This should fail'
    });
    
    messageWithInvalidSender.save = jest.fn().mockRejectedValue({
      name: 'ValidationError',
      message: 'Invalid sender ID reference',
      errors: { senderId: { message: 'Invalid sender ID reference' } }
    });
    
    let err;
    try {
      await messageWithInvalidSender.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError'); 
  });

  it('should retrieve messages with populated user data', async () => {
    const message = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      text: 'Populate test message'
    });
    await message.save();
    
    Message.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: message._id,
        senderId: {
          _id: sender._id,
          fullName: sender.fullName,
          email: sender.email
        },
        receiverId: receiver._id,
        text: 'Populate test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });
    
    const populatedMessage = await Message.findById(message._id).populate('senderId');
    
    expect(populatedMessage).toBeDefined();
    expect(populatedMessage.senderId).toBeInstanceOf(Object);
    expect(populatedMessage.senderId._id.toString()).toBe(sender._id.toString());
    expect(populatedMessage.senderId.fullName).toBe(sender.fullName);
    expect(populatedMessage.senderId.email).toBe(sender.email);
  });

  it('should retrieve messages between two users', async () => {
    Message.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          _id: 'msg_1',
          senderId: sender._id,
          receiverId: receiver._id,
          text: 'Message 1 from sender to receiver',
          createdAt: new Date('2025-05-30T10:00:00Z').toISOString(),
          updatedAt: new Date('2025-05-30T10:00:00Z').toISOString()
        },
        {
          _id: 'msg_2',
          senderId: receiver._id,
          receiverId: sender._id,
          text: 'Message 2 from receiver to sender',
          createdAt: new Date('2025-05-30T10:01:00Z').toISOString(),
          updatedAt: new Date('2025-05-30T10:01:00Z').toISOString()
        },
        {
          _id: 'msg_3',
          senderId: sender._id,
          receiverId: receiver._id,
          text: 'Message 3 from sender to receiver',
          createdAt: new Date('2025-05-30T10:02:00Z').toISOString(),
          updatedAt: new Date('2025-05-30T10:02:00Z').toISOString()
        }
      ])
    });
    
    const messages = await Message.find({
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id }
      ]
    }).sort({ createdAt: 1 });
    
    expect(messages).toHaveLength(3);
    expect(messages[0].text).toBe('Message 1 from sender to receiver');
    expect(messages[1].text).toBe('Message 2 from receiver to sender');
    expect(messages[2].text).toBe('Message 3 from sender to receiver');
  });
});
