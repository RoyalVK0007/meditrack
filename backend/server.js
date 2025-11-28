require('dotenv').config();
const https = require("https");
const fs = require("fs");
const url = require("url");
const path = require("path");
const { authenticateToken, checkRole } = require('./auth');
const { register, login, verifyOtp, changePassword, resendOtp, forgotPassword } = require('./routes/auth-routes');
const { setupEmail, verifySetupOtp, completeSetup } = require('./routes/setup-routes');
const { getUserProfile, updateUserProfile, changeUserPassword } = require('./routes/profile-routes');
const { getAllUsers, addUser, updateUser, deleteUser, getSystemStats } = require('./routes/admin-routes');
const { getAssignedPatients, getPatientVitals, addPrescription } = require('./routes/doctor-routes');
const { addVital, getPatientsForVitals, updateVital } = require('./routes/nurse-routes');
const { addPatient, editPatient, createBill, getAllPatients } = require('./routes/receptionist-routes');
const { seedDemoData, clearAllData, getAllVitals, deletePatient } = require('./routes/legacy-routes');
const { getBills, generateBillPDF, markBillPaid, getBillById, updateBill } = require('./routes/billing-routes');
const { generateCSVReport, generatePDFReport } = require('./routes/report-routes');
const {
  getMedicines,
  createMedicine,
  updateMedicineStock,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require('./routes/medication-routes');
const { backupDatabase } = require('./routes/admin-routes');
const db = require('./db');

// SSL certs
let options;
try {
  options = {
    key: fs.readFileSync("./backend/certs/key.pem"),
    cert: fs.readFileSync("./backend/certs/cert.pem"),
  };
} catch (error) {
  console.error('🔒 SSL certificates not found. Please generate certificates first.');
  console.error('💡 Run: openssl req -x509 -newkey rsa:4096 -keyout backend/certs/key.pem -out backend/certs/cert.pem -days 365 -nodes');
  process.exit(1);
}

// Server
const server = https.createServer(options, async (req, res) => {
  // CORS headers
  const allowedOrigins = ['https://localhost:3000', 'https://127.0.0.1:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Authentication routes
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/register") {
    return register(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/login") {
    return login(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/verify-otp") {
    return verifyOtp(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/change-password") {
    return changePassword(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/setup-email") {
    return setupEmail(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/verify-setup-otp") {
    return verifySetupOtp(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/complete-setup") {
    return completeSetup(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/resend-otp") {
    return resendOtp(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/auth/forgot-password") {
    return forgotPassword(req, res);
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/profile") {
    return authenticateToken(req, res, () => getUserProfile(req, res));
  }
  if (req.method === "PUT" && parsedUrl.pathname === "/api/profile") {
    return authenticateToken(req, res, () => updateUserProfile(req, res));
  }
  if (req.method === "PUT" && parsedUrl.pathname === "/api/profile/password") {
    return authenticateToken(req, res, () => changeUserPassword(req, res));
  }

  // Admin routes (Admin only)
  if (req.method === "GET" && parsedUrl.pathname === "/api/admin/users") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => getAllUsers(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/users") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => addUser(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/backup") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => backupDatabase(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/admin/stats") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => getSystemStats(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/admin/users/")) {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => updateUser(req, res)));
  }
  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/api/admin/users/")) {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => deleteUser(req, res)));
  }

  // Doctor routes
  if (req.method === "GET" && parsedUrl.pathname === "/api/doctor/patients") {
    return authenticateToken(req, res, () => checkRole(['doctor'])(req, res, () => getAssignedPatients(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/api/doctor/vitals/")) {
    return authenticateToken(req, res, () => checkRole(['doctor'])(req, res, () => getPatientVitals(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/doctor/prescriptions") {
    return authenticateToken(req, res, () => checkRole(['doctor'])(req, res, () => addPrescription(req, res)));
  }

  // Medication & prescription routes
  if (req.method === "GET" && parsedUrl.pathname === "/api/medicines") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor', 'nurse', 'receptionist'])(req, res, () => getMedicines(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/medicines") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => createMedicine(req, res)));
  }
  if (req.method === "PUT" && /^\/api\/medicines\/\d+\/stock$/.test(parsedUrl.pathname)) {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor', 'nurse'])(req, res, () => updateMedicineStock(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/prescriptions") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor', 'nurse'])(req, res, () => getPrescriptions(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/prescriptions") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => createPrescription(req, res)));
  }
  if (req.method === "PUT" && /^\/api\/prescriptions\/\d+$/.test(parsedUrl.pathname)) {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => updatePrescription(req, res)));
  }
  if (req.method === "DELETE" && /^\/api\/prescriptions\/\d+$/.test(parsedUrl.pathname)) {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => deletePrescription(req, res)));
  }

  // Nurse routes
  if (req.method === "POST" && parsedUrl.pathname === "/api/nurse/vitals") {
    return authenticateToken(req, res, () => checkRole(['nurse'])(req, res, () => addVital(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/nurse/patients") {
    return authenticateToken(req, res, () => checkRole(['nurse'])(req, res, () => getPatientsForVitals(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/nurse/vitals/")) {
    return authenticateToken(req, res, () => checkRole(['nurse'])(req, res, () => updateVital(req, res)));
  }

  // Receptionist routes
  if (req.method === "POST" && parsedUrl.pathname === "/api/receptionist/patients") {
    return authenticateToken(req, res, () => checkRole(['receptionist'])(req, res, () => addPatient(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/receptionist/patients/")) {
    return authenticateToken(req, res, () => checkRole(['receptionist'])(req, res, () => editPatient(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/receptionist/patients") {
    return authenticateToken(req, res, () => checkRole(['receptionist'])(req, res, () => getAllPatients(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/receptionist/bills") {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin'])(req, res, () => createBill(req, res)));
  }

  // Serve static files
  if (req.method === "GET" && !parsedUrl.pathname.startsWith("/api/")) {
    let filePath = parsedUrl.pathname === "/" ? "/frontend/login.html" : "/frontend" + parsedUrl.pathname;
    filePath = path.join(__dirname, "..", filePath);

    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = ext === ".html" ? "text/html" : ext === ".css" ? "text/css" : ext === ".js" ? "application/javascript" : "text/plain";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
      return;
    } catch (err) {
      // Continue to API routes
    }
  }

  // Legacy API Routes (Protected)
  if (req.method === "GET" && parsedUrl.pathname === "/api/patients") {
    return authenticateToken(req, res, () => getAllPatients(req, res));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/patients") {
    return authenticateToken(req, res, () => checkRole(['admin', 'receptionist', 'doctor', 'nurse'])(req, res, () => addPatient(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/api/vitals/")) {
    return authenticateToken(req, res, () => checkRole(['doctor', 'nurse', 'admin'])(req, res, () => getPatientVitals(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/vitals") {
    return authenticateToken(req, res, () => checkRole(['nurse', 'admin'])(req, res, () => addVital(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/billing") {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin', 'doctor', 'nurse'])(req, res, () => getBills(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/bills") {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin', 'doctor'])(req, res, () => createBill(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/seed") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => seedDemoData(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/README.md") {
    try {
      const readmeContent = fs.readFileSync(path.join(__dirname, "..", "README.md"), 'utf8');
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(readmeContent);
      return;
    } catch (err) {
      res.writeHead(404);
      res.end("README not found");
      return;
    }
  }
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/api/bills/pdf/")) {
    return generateBillPDF(req, res);
  }
  if (req.method === "GET" && /^\/api\/bills\/\d+$/.test(parsedUrl.pathname)) {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin', 'doctor', 'nurse'])(req, res, () => getBillById(req, res)));
  }
  if (req.method === "PUT" && /^\/api\/bills\/\d+$/.test(parsedUrl.pathname)) {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin', 'doctor'])(req, res, () => updateBill(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.match(/\/api\/bills\/\d+\/paid$/)) {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin', 'doctor'])(req, res, () => markBillPaid(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/reports/csv") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => generateCSVReport(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/reports/pdf") {
    return authenticateToken(req, res, () => checkRole(['admin', 'doctor'])(req, res, () => generatePDFReport(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/clear") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => clearAllData(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/patients/")) {
    return authenticateToken(req, res, () => checkRole(['admin', 'receptionist', 'doctor', 'nurse'])(req, res, () => editPatient(req, res)));
  }
  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/api/patients/")) {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => deletePatient(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/vitals/all") {
    return authenticateToken(req, res, () => checkRole(['doctor', 'nurse', 'admin'])(req, res, () => getAllVitals(req, res)));
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// Ensure required tables exist
async function ensureTables() {
  try {

    // Test database connection first
    await db.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check if users table exists and has correct structure
    const [tables] = await db.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('⚠️  Users table not found. Please run the schema.sql file first.');
      console.log('💡 Run: mysql -u root -p meditrack_hospital < sql/schema.sql');
      return;
    }
    
    // Verify user_otps table exists
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
    console.log('✅ Database tables verified');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('💡 Please start MySQL service:');
      console.log('   - Windows: Run "net start mysql80" as Administrator');
      console.log('   - Or start MySQL from Services panel');
    }
  }
}

// Start server
server.listen(3000, async () => {
  console.log("✅ MediTrack backend running at https://localhost:3000");
  console.log("🔗 Database connection status will be shown above");
  await ensureTables();
  console.log("📋 Use Admin panel to seed demo data if needed");
});
