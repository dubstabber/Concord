
export const mockUserModel = () => {
  const users = [];
  let mockId = 1;

  return {
    
    findOne: jest.fn(query => {
      if (query.email) {
        return Promise.resolve(users.find(user => user.email === query.email) || null);
      }
      return Promise.resolve(null);
    }),
    findById: jest.fn(id => {
      return Promise.resolve(users.find(user => user._id.toString() === id.toString()) || null);
    }),
    findByIdAndUpdate: jest.fn((id, update, options) => {
      const userIndex = users.findIndex(user => user._id.toString() === id.toString());
      if (userIndex === -1) return Promise.resolve(null);
      
      const updatedUser = { 
        ...users[userIndex], 
        ...update,
        updatedAt: new Date(new Date(users[userIndex].createdAt).getTime() + 10000).toISOString() 
      };
      users[userIndex] = updatedUser;
      
      if (options && options.new) {
        return Promise.resolve(updatedUser);
      }
      return Promise.resolve(users[userIndex]);
    }),
    
    
    mockConstructor: jest.fn(userData => {
      const user = { 
        profilePic: '', 
        ...userData,
        _id: `user_${mockId++}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        save: jest.fn(function() {
          
          const errors = {};
          
          if (this.email === undefined) {
            errors.email = { message: 'Path `email` is required' };
          }
          
          if (this.password === undefined) {
            errors.password = { message: 'Path `password` is required' };
          }
          
          if (Object.keys(errors).length > 0) {
            const error = new Error('User validation failed');
            error.name = 'ValidationError';
            error.errors = errors;
            return Promise.reject(error);
          }
          
          if (this.password && this.password.length < 6) {
            const error = new Error('User validation failed: password: Path `password` is too short');
            error.name = 'ValidationError';
            error.errors = { password: { message: 'Path `password` is too short' } };
            return Promise.reject(error);
          }
          
          
          const existingUser = users.find(u => u.email === this.email && u._id !== this._id);
          if (existingUser) {
            const error = new Error('E11000 duplicate key error');
            error.name = 'MongoError';
            error.code = 11000;
            return Promise.reject(error);
          }
          
          users.push(this);
          return Promise.resolve(this);
        })
      };
      
      return user;
    })
  };
};


export const mockMessageModel = () => {
  const messages = [];
  let mockId = 1;

  return {
    
    find: jest.fn(query => {
      
      let filteredMessages = [...messages];
      
      if (query.$or) {
        filteredMessages = messages.filter(msg => 
          query.$or.some(condition => 
            (condition.senderId && condition.receiverId) && 
            (
              (msg.senderId.toString() === condition.senderId.toString() && 
               msg.receiverId.toString() === condition.receiverId.toString()) ||
              (msg.senderId.toString() === condition.receiverId.toString() && 
               msg.receiverId.toString() === condition.senderId.toString())
            )
          )
        );
      }
      
      return {
        sort: jest.fn(sortObj => {
          
          if (sortObj && sortObj.createdAt === 1) {
            return Promise.resolve([...filteredMessages].sort((a, b) => 
              new Date(a.createdAt) - new Date(b.createdAt)
            ));
          }
          return Promise.resolve(filteredMessages);
        }),
        populate: jest.fn(() => Promise.resolve(filteredMessages))
      };
    }),
    findById: jest.fn(id => {
      const message = messages.find(msg => msg._id.toString() === id.toString());
      return {
        populate: jest.fn(field => {
          if (!message) return Promise.resolve(null);
          
          
          if (field === 'senderId' && message.senderId) {
            
            
            return Promise.resolve({
              ...message,
              senderId: {
                _id: message.senderId,
                fullName: 'Populated User',
                email: 'populated@example.com'
              }
            });
          }
          
          return Promise.resolve(message);
        })
      };
    }),
    
    
    mockConstructor: jest.fn(messageData => {
      const message = {
        ...messageData,
        _id: `msg_${mockId++}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        save: jest.fn(function() {
          
          if (this.senderId === undefined) {
            const error = new Error('Message validation failed: senderId: Path `senderId` is required');
            error.name = 'ValidationError';
            error.errors = { senderId: { message: 'Path `senderId` is required' } };
            return Promise.reject(error);
          }
          
          if (this.receiverId === undefined) {
            const error = new Error('Message validation failed: receiverId: Path `receiverId` is required');
            error.name = 'ValidationError';
            error.errors = { receiverId: { message: 'Path `receiverId` is required' } };
            return Promise.reject(error);
          }
          
          messages.push(this);
          return Promise.resolve(this);
        })
      };
      
      return message;
    }),
    
    insertMany: jest.fn(messagesArray => {
      const savedMessages = messagesArray.map(msgData => {
        const msg = {
          ...msgData,
          _id: `msg_${mockId++}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        messages.push(msg);
        return msg;
      });
      
      return Promise.resolve(savedMessages);
    }),
    
    deleteMany: jest.fn(() => {
      const count = messages.length;
      messages.length = 0;
      return Promise.resolve({ deletedCount: count });
    })
  };
};
