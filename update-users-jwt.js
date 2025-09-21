const mysql = require('mysql2/promise');
const { hashPassword } = require('./backend/auth');

async function updateUsersForJWT() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Pass@6326',
      database: 'meditrack_hospital'
    });

    console.log('Connected to database...');

    // Generate new bcrypt hashes for password123
    const newHash = await hashPassword('password123');
    console.log('New bcrypt hash generated');

    // Update all users with new hash
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username IN (?, ?, ?, ?)',
      [newHash, 'admin', 'doctor1', 'nurse1', 'reception1']
    );

    console.log('Updated', result.affectedRows, 'user records with bcrypt hashes');

    await connection.end();
    console.log('Database updated for JWT authentication!');
    
  } catch (error) {
    console.error('Error updating database:', error.message);
  }
}

updateUsersForJWT();