const https = require("https");
const fs = require("fs");
const url = require("url");
const path = require("path");
const { authenticateToken, checkRole } = require('./auth');
const { register, login } = require('./routes/auth-routes');
const { getAllUsers, addUser, updateUser, deleteUser, getSystemStats } = require('./routes/admin-routes');
const { getAssignedPatients, getPatientVitals, addPrescription } = require('./routes/doctor-routes');
const { addVital, getPatientsForVitals, updateVital } = require('./routes/nurse-routes');
const { addPatient, editPatient, createBill, getAllPatients } = require('./routes/receptionist-routes');
const { seedDemoData, clearAllData, getAllVitals, deletePatient } = require('./routes/legacy-routes');

// SSL certs
let options;
try {
  options = {
    key: fs.readFileSync("./backend/certs/key.pem"),
    cert: fs.readFileSync("./backend/certs/cert.pem"),
  };
} catch (error) {
  console.error('SSL certificates not found. Please generate certificates first.');
  process.exit(1);
}

// Server
const server = https.createServer(options, async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
  
  // Admin routes (Admin only)
  if (req.method === "GET" && parsedUrl.pathname === "/api/admin/users") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => getAllUsers(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/users") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => addUser(req, res)));
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
    return authenticateToken(req, res, () => checkRole(['receptionist'])(req, res, () => createBill(req, res)));
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
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/api/vitals/")) {
    return authenticateToken(req, res, () => checkRole(['doctor', 'nurse', 'admin'])(req, res, () => getPatientVitals(req, res)));
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/vitals") {
    return authenticateToken(req, res, () => checkRole(['nurse', 'admin'])(req, res, () => addVital(req, res)));
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/billing") {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin'])(req, res, () => getAllPatients(req, res)));
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
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/clear") {
    return authenticateToken(req, res, () => checkRole(['admin'])(req, res, () => clearAllData(req, res)));
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/patients/")) {
    return authenticateToken(req, res, () => checkRole(['receptionist', 'admin'])(req, res, () => editPatient(req, res)));
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

// Start server
server.listen(3000, () => {
  console.log("✅ MediTrack backend running at https://localhost:3000");
});
