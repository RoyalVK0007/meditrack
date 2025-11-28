require('dotenv').config();
const db = require('../backend/db');

(async () => {
    try {
        await db.query('UPDATE users SET username = ? WHERE user_id = ?', ['admin', 1]);
        console.log('✅ Admin username set to "admin"');
    } catch (error) {
        console.error('❌ Failed to update admin username:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
})();

