const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'meditrack_jwt_secret_key_2024';
const JWT_EXPIRES_IN = '1h';

// Hash password
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw error;
  }
}

// Compare password
async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison failed:', error);
    throw error;
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      user_id: user.user_id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Middleware to check authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Access token required' }));
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or expired token' }));
    return;
  }

  req.user = decoded;
  next();
}

// Middleware to check role permissions
function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Authentication required' }));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access denied' }));
      return;
    }

    next();
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateToken,
  checkRole
};