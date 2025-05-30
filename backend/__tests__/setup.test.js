describe('Test Setup', () => {
  test('environment variables are set for testing', () => {
    expect(process.env.JWT_SECRET).toBe('test_jwt_secret');
    expect(process.env.NODE_ENV).toBe('test');
  });
  
  test('socket.io is properly mocked', () => {
    
    const io = require('socket.io');
    expect(io.Server).toBeDefined();
    expect(typeof io.Server).toBe('function');
    
    const mockServer = io.Server();
    expect(mockServer.on).toBeDefined();
    expect(mockServer.emit).toBeDefined();
    expect(mockServer.to).toBeDefined();
  });
});
