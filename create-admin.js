require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./backend/db');

async function createAdminUser() {
    try {
        // Check if admin user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
        
        if (existingUsers.length > 0) {
            console.log('✅ Admin user already exists');
            console.log('Username: admin');
            console.log('Password: password123');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await db.query(`
            INSERT INTO users (username, password, full_name, email, role, is_first_login) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin', hashedPassword, 'System Administrator', 'nesgvk@gmail.com', 'admin', false]);
        
        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: password123');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        process.exit(0);
    }
}

createAdminUser();