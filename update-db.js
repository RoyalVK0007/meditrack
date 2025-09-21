const mysql = require('mysql2/promise');
const { hashPassword } = require('./backend/auth');

async function updateDatabase() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Pass@6326', // Change this to your MySQL password
      database: 'meditrack_hospital'
    });

    console.log('Connected to database...');

    // Generate new hash for password123
    const newHash = hashPassword('password123');
    console.log('New hash generated:', newHash);

    // Update all users with new hash
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username IN (?, ?, ?, ?)',
      [newHash, 'admin', 'doctor1', 'nurse1', 'reception1']
    );

    console.log('Updated', result.affectedRows, 'user records');

    // Verify the update
    const [users] = await connection.execute('SELECT username, password_hash FROM users');
    console.log('Current users:');
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.password_hash.substring(0, 20)}...`);
    });

    await connection.end();
    console.log('Database updated successfully!');
    
  } catch (error) {
    console.error('Error updating database:', error.message);
    console.log('\nPlease update backend/db.js with your MySQL credentials and try again.');
  }
}

updateDatabase();