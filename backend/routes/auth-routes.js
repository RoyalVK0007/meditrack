const pool = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../auth');
const { sendOtpEmail } = require('../emailService');
const otpGenerator = require('otp-generator');

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
      console.error('Error registering user:', error);
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

      // Check if user needs first-time setup
      if (user.is_first_login) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          requiresSetup: true,
          username: user.username,
          message: 'First login detected. Complete account setup required.' 
        }));
        return;
      }

      // Generate and send OTP (numbers only)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Store OTP in database
      await pool.query(
        'INSERT INTO user_otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
        [user.user_id, otp, expiresAt]
      );
      
      // Send OTP via email
      const emailSent = await sendOtpEmail(user.email, otp, user.full_name);
      
      if (!emailSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to send OTP email' }));
        return;
      }
      
      console.log(`📧 OTP sent to ${user.email} for user ${user.username}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        requiresOtp: true,
        isFirstLogin: user.is_first_login,
        user_id: user.user_id,
        message: 'OTP sent to your email'
      }));
    } catch (error) {
      console.error('Error during login:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Verify OTP
async function verifyOtp(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { user_id, otp } = JSON.parse(body);
      
      if (!user_id || !otp) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID and OTP required' }));
        return;
      }
      
      // Find valid OTP
      const [otpRecords] = await pool.query(
        'SELECT * FROM user_otps WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1',
        [user_id, otp]
      );
      
      if (otpRecords.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or expired OTP' }));
        return;
      }
      
      // Mark OTP as used
      await pool.query('UPDATE user_otps SET is_used = TRUE WHERE otp_id = ?', [otpRecords[0].otp_id]);
      
      // Get user details
      const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
      const user = users[0];
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
      
      console.log(`✅ OTP verified for user ${user.username}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        isFirstLogin: user.is_first_login,
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        }
      }));
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Change password (first login)
async function changePassword(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { user_id, newPassword } = JSON.parse(body);
      
      if (!user_id || !newPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID and new password required' }));
        return;
      }
      
      if (newPassword.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password must be at least 6 characters' }));
        return;
      }
      
      const password_hash = await hashPassword(newPassword);
      
      // Update password and mark as not first login
      await pool.query(
        'UPDATE users SET password_hash = ?, is_first_login = FALSE WHERE user_id = ?',
        [password_hash, user_id]
      );
      
      console.log(`🔐 Password changed for user ID ${user_id}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Password changed successfully' }));
    } catch (error) {
      console.error('Error changing password:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Resend OTP
async function resendOtp(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { user_id } = JSON.parse(body);
      
      if (!user_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID required' }));
        return;
      }
      
      // Get user details
      const [users] = await pool.query('SELECT * FROM users WHERE user_id = ? AND is_active = TRUE', [user_id]);
      if (users.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid user' }));
        return;
      }
      
      const user = users[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Store new OTP
      await pool.query('INSERT INTO user_otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)', [user_id, otp, expiresAt]);
      
      // Send OTP email
      const emailSent = await sendOtpEmail(user.email, otp, user.full_name);
      if (!emailSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to send OTP email' }));
        return;
      }
      
      console.log(`📧 New OTP sent to ${user.email} for user ${user.username}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'New OTP sent successfully' }));
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Forgot password
async function forgotPassword(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { username } = JSON.parse(body);
      
      if (!username) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Username required' }));
        return;
      }
      
      // Find user
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
      );
      
      if (users.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Username not found' }));
        return;
      }
      
      const user = users[0];
      
      // Generate temporary password (6 characters)
      const tempPassword = Math.random().toString(36).slice(-8);
      const password_hash = await hashPassword(tempPassword);
      
      // Update user with temporary password and mark for password change
      await pool.query(
        'UPDATE users SET password_hash = ?, is_first_login = TRUE WHERE user_id = ?',
        [password_hash, user.user_id]
      );
      
      // Send email with temporary password
      const emailSent = await sendPasswordResetEmail(user.email, tempPassword, user.full_name);
      
      if (!emailSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to send reset email' }));
        return;
      }
      
      console.log(`🔐 Password reset sent to ${user.email} for user ${user.username}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Password reset instructions sent to your email' }));
    } catch (error) {
      console.error('Forgot password error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Send password reset email
async function sendPasswordResetEmail(email, tempPassword, fullName) {
  try {
    const { sendEmail } = require('../emailService');
    
    const subject = 'MediTrack - Password Reset';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset - MediTrack</h2>
        <p>Hello ${fullName},</p>
        <p>You requested a password reset for your MediTrack account.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your temporary password:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 2px;">${tempPassword}</p>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This is a temporary password</li>
          <li>You will be required to change it on first login</li>
          <li>For security, please change it immediately after logging in</li>
        </ul>
        <p>If you didn't request this reset, please contact support immediately.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent from MediTrack Hospital Management System.<br>
          Please do not reply to this email.
        </p>
      </div>
    `;
    
    return await sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

module.exports = { register, login, verifyOtp, changePassword, resendOtp, forgotPassword };