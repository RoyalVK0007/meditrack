const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",        // change if needed
  password: "Pass@6326", // your MySQL password
  database: "meditrack_hospital",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection and log status
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in database`);
    
    if (tables.length > 0) {
      console.log('📋 Tables:', tables.map(t => Object.values(t)[0]).join(', '));
      
      // Check for demo data
      const [patients] = await connection.query('SELECT COUNT(*) as count FROM patients');
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      const [vitals] = await connection.query('SELECT COUNT(*) as count FROM vitals');
      
      console.log(`👥 Patients: ${patients[0].count}`);
      console.log(`🔐 Users: ${users[0].count}`);
      console.log(`💓 Vitals: ${vitals[0].count}`);
      
      if (patients[0].count === 0) {
        console.log('⚠️  No demo data found - use Admin panel to seed data');
      } else {
        console.log('✅ Demo data is present');
      }
    } else {
      console.log('⚠️  No tables found - please run schema.sql');
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure MySQL is running and credentials are correct');
  }
}

// Test connection on startup
testConnection();

module.exports = pool;
