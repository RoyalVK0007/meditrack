const pool = require('../db');
const { hashPassword } = require('../auth');

// Get all users (Admin only)
async function getAllUsers(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT user_id, username, full_name, email, role, is_active, created_at, last_login FROM users ORDER BY created_at ASC'
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Add new user (Admin only)
async function addUser(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('Received data:', data);
      
      const { username, password, role, full_name, email } = data;
      
      if (!username || !password || !full_name || !role) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'All fields are required' }));
        return;
      }
      
      // Check if username already exists
      const [existing] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Username already exists' }));
        return;
      }
      
      const password_hash = await hashPassword(password);
      const [result] = await pool.query(
        'INSERT INTO users (username, password_hash, full_name, role, email) VALUES (?, ?, ?, ?, ?)',
        [username, password_hash, full_name, role, email || null]
      );
      
      console.log('User created with ID:', result.insertId);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User added successfully' }));
    } catch (error) {
      console.error('Error adding user:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Get system statistics (Admin only)
async function getSystemStats(req, res) {
  try {
    const [patients] = await pool.query('SELECT COUNT(*) as count FROM patients');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    const [bills] = await pool.query('SELECT COUNT(*) as count FROM bills');
    const [vitals] = await pool.query('SELECT COUNT(*) as count FROM vitals');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalPatients: patients[0].count,
      activeUsers: users[0].count,
      totalBills: bills[0].count,
      totalVitals: vitals[0].count
    }));
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Delete user (Admin only)
async function deleteUser(req, res) {
  const userId = req.url.split('/')[4];
  
  if (!userId || isNaN(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid user ID' }));
    return;
  }
  
  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User deleted successfully' }));
  } catch (error) {
    console.error('Error deleting user:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Update user (Admin only)
async function updateUser(req, res) {
  const userId = req.url.split('/')[4];
  
  if (!userId || isNaN(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid user ID' }));
    return;
  }
  
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { username, password, role, full_name } = data;
      
      if (!username || !full_name || !role) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Required fields missing' }));
        return;
      }
      
      let query = 'UPDATE users SET username = ?, full_name = ?, role = ? WHERE user_id = ?';
      let params = [username, full_name, role, userId];
      
      if (password) {
        const password_hash = await hashPassword(password);
        query = 'UPDATE users SET username = ?, full_name = ?, role = ?, password_hash = ? WHERE user_id = ?';
        params = [username, full_name, role, password_hash, userId];
      }
      
      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User updated successfully' }));
    } catch (error) {
      console.error('Error updating user:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { getAllUsers, addUser, updateUser, deleteUser, getSystemStats };