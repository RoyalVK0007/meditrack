require('dotenv').config();
const db = require('../backend/db');

async function columnExists(table, column) {
    const [rows] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
    return rows.length > 0;
}

async function hasIndex(table, indexName) {
    const [rows] = await db.query(`SHOW INDEX FROM ${table} WHERE Key_name = ?`, [indexName]);
    return rows.length > 0;
}

async function migrateUsersTable() {
    console.log('🔧 Starting users table migration...');

    const [columns] = await db.query('DESCRIBE users');
    const hasUserId = columns.some(col => col.Field === 'user_id');
    const hasLegacyId = columns.some(col => col.Field === 'id');

    if (!hasUserId && hasLegacyId) {
        console.log('➡️  Renaming legacy id column to user_id');
        await db.query('ALTER TABLE users CHANGE COLUMN id user_id INT NOT NULL AUTO_INCREMENT');
    }

    if (!await columnExists('users', 'username')) {
        console.log('➡️  Adding username column');
        await db.query('ALTER TABLE users ADD COLUMN username VARCHAR(50) NULL AFTER user_id');

        const [users] = await db.query('SELECT user_id, email, full_name FROM users');
        for (const user of users) {
            const fallback = (user.email || user.full_name || `user${user.user_id}`).split('@')[0];
            await db.query('UPDATE users SET username = ? WHERE user_id = ?', [fallback, user.user_id]);
        }

        console.log('➡️  Setting username as NOT NULL with unique constraint');
        await db.query('ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NOT NULL');
        if (!await hasIndex('users', 'idx_users_username')) {
            await db.query('ALTER TABLE users ADD UNIQUE INDEX idx_users_username (username)');
        }
    }

    if (!await columnExists('users', 'is_active')) {
        console.log('➡️  Adding is_active flag');
        await db.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role');
    }

    console.log('➡️  Ensuring role enum matches application roles');
    await db.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('admin','doctor','nurse','receptionist') NOT NULL DEFAULT 'doctor'
    `);

    console.log('➡️  Setting defaults for first login and timestamps');
    await db.query('ALTER TABLE users MODIFY COLUMN is_first_login TINYINT(1) NOT NULL DEFAULT TRUE');
    await db.query('ALTER TABLE users MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
    await db.query('ALTER TABLE users MODIFY COLUMN last_login TIMESTAMP NULL DEFAULT NULL');

    console.log('➡️  Creating user_otps table if missing');
    await db.query(`
        CREATE TABLE IF NOT EXISTS user_otps (
            otp_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            otp_code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);

    console.log('✅ Users schema migration complete');
    process.exit(0);
}

migrateUsersTable().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});

