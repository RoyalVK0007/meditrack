const pool = require('../db');
const { hashPassword } = require('../auth');
const { sendOtpEmail } = require('../emailService');
const crypto = require('crypto');

// Setup email and send OTP
async function setupEmail(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username, email } = JSON.parse(body);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email format' }));
        return;
      }
      
      // Check if user exists and is first login
      const [users] = await pool.query('SELECT user_id, is_first_login FROM users WHERE username = ?', [username]);
      if (users.length === 0 || !users[0].is_first_login) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid setup request' }));
        return;
      }
      
      // Check if email already exists
      const [existing] = await pool.query('SELECT email FROM users WHERE email = ? AND username != ?', [email, username]);
      if (existing.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email already in use' }));
        return;
      }
      
      const userId = users[0].user_id;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Store OTP
      await pool.query('INSERT INTO user_otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)', [userId, otp, expiresAt]);
      
      // Send OTP email
      const emailSent = await sendOtpEmail(email, otp, username);
      if (!emailSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to send OTP email' }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'OTP sent successfully' }));
    } catch (error) {
      console.error('Setup email error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Verify setup OTP
async function verifySetupOtp(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username, otp } = JSON.parse(body);
      
      const [users] = await pool.query('SELECT user_id FROM users WHERE username = ? AND is_first_login = TRUE', [username]);
      if (users.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid setup request' }));
        return;
      }
      
      const userId = users[0].user_id;
      const [otps] = await pool.query(
        'SELECT otp_id FROM user_otps WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1',
        [userId, otp]
      );
      
      if (otps.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or expired OTP' }));
        return;
      }
      
      // Mark OTP as used
      await pool.query('UPDATE user_otps SET is_used = TRUE WHERE otp_id = ?', [otps[0].otp_id]);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'OTP verified successfully' }));
    } catch (error) {
      console.error('Verify setup OTP error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Complete setup
async function completeSetup(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username, email, password } = JSON.parse(body);
      
      // Validate password
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{4,}$/;
      if (!passwordRegex.test(password)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password must contain A-Z, 0-9, minimum 4 characters' }));
        return;
      }
      
      const [users] = await pool.query('SELECT user_id FROM users WHERE username = ? AND is_first_login = TRUE', [username]);
      if (users.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid setup request' }));
        return;
      }
      
      const userId = users[0].user_id;
      const passwordHash = await hashPassword(password);
      
      // Update user with email, password, and mark as not first login
      await pool.query(
        'UPDATE users SET email = ?, password_hash = ?, full_name = ?, is_first_login = FALSE WHERE user_id = ?',
        [email, passwordHash, username, userId]
      );
      
      console.log(`✅ User ${username} completed first-time setup`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Setup completed successfully' }));
    } catch (error) {
      console.error('Complete setup error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { setupEmail, verifySetupOtp, completeSetup };