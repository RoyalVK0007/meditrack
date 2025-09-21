const pool = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../auth');

// Register new user
async function register(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username, password, role, full_name, email } = JSON.parse(body);
      
      // Input validation
      if (!username || !password || !role || !full_name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }
      
      if (password.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password must be at least 6 characters' }));
        return;
      }
      
      if (!['admin', 'doctor', 'nurse', 'receptionist'].includes(role)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid role' }));
        return;
      }
      
      // Check if user exists
      const [existing] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Username already exists' }));
        return;
      }

      // Hash password and create user
      const password_hash = await hashPassword(password);
      await pool.query(
        'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        [username, password_hash, full_name, email, role]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User registered successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Login user
async function login(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username, password } = JSON.parse(body);
      
      // Input validation
      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Username and password required' }));
        return;
      }
      
      // Find user
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
      );
      
      if (users.length === 0) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const user = users[0];
      const validPassword = await comparePassword(password, user.password_hash);
      
      if (!validPassword) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      // Generate JWT token
      const token = generateToken(user);
      
      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        }
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { register, login };