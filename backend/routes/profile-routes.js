const pool = require('../db');
const { hashPassword, comparePassword } = require('../auth');

// Get user profile
async function getUserProfile(req, res) {
  try {
    const userId = req.user.user_id;
    
    const [users] = await pool.query(
      'SELECT user_id, username, full_name, email, role, created_at, last_login FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users[0]));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Update user profile
async function updateUserProfile(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { full_name, email } = JSON.parse(body);
      const userId = req.user.user_id;
      
      if (!full_name || !email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Full name and email are required' }));
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email format' }));
        return;
      }
      
      // Check if email already exists for another user
      const [existing] = await pool.query(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email, userId]
      );
      
      if (existing.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email already in use by another user' }));
        return;
      }
      
      // Update user profile
      await pool.query(
        'UPDATE users SET full_name = ?, email = ? WHERE user_id = ?',
        [full_name, email, userId]
      );
      
      console.log(`✅ Profile updated for user ID ${userId}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Profile updated successfully' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Change user password
async function changeUserPassword(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { currentPassword, newPassword } = JSON.parse(body);
      const userId = req.user.user_id;
      
      if (!currentPassword || !newPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Current password and new password are required' }));
        return;
      }
      
      // Validate new password
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{4,}$/;
      if (!passwordRegex.test(newPassword)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password must contain A-Z, 0-9, minimum 4 characters' }));
        return;
      }
      
      // Get current user data
      const [users] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
      if (users.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      // Verify current password
      const validPassword = await comparePassword(currentPassword, users[0].password_hash);
      if (!validPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Current password is incorrect' }));
        return;
      }
      
      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [newPasswordHash, userId]
      );
      
      console.log(`🔐 Password changed for user ID ${userId}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Password changed successfully' }));
    } catch (error) {
      console.error('Error changing password:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { getUserProfile, updateUserProfile, changeUserPassword };