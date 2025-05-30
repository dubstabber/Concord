/**
 * Mock for the auth middleware to be used across all tests
 */

export const protectRouteMock = (req, res, next) => {
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
};
