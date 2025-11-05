const { hashPassword, comparePassword, generateToken, verifyToken } = require('../backend/auth');

describe('Authentication Module', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    test('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(password, hash);
      const isInvalid = await comparePassword('wrongPassword', hash);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    const mockUser = {
      user_id: 1,
      username: 'testuser',
      role: 'doctor'
    };

    test('should generate valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should verify valid JWT token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.user_id).toBe(mockUser.user_id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });
  });
});