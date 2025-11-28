require('dotenv').config();
const db = require('./backend/db');

async function checkUsersTable() {
    try {
        // Check table structure
        const [columns] = await db.query('DESCRIBE users');
        console.log('📋 Users table structure:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        
        // Check existing users
        const [users] = await db.query('SELECT * FROM users LIMIT 5');
        console.log(`\n👥 Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`  - ID: ${user.user_id}, Name: ${user.full_name}, Role: ${user.role}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkUsersTable();