const https = require("https");
const fs = require("fs");
const url = require("url");
const path = require("path");
const { getPatients, addPatient, updatePatient, deletePatient, getVitals, addVital, getAllVitals, getBills, seedDemoData, generateBillPDF, clearAllData } = require("./routes");

// SSL certs
const options = {
  key: fs.readFileSync("./backend/certs/key.pem"),
  cert: fs.readFileSync("./backend/certs/cert.pem"),
};

// Server
const server = https.createServer(options, async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Serve static files
  if (req.method === "GET" && !parsedUrl.pathname.startsWith("/api/")) {
    let filePath = parsedUrl.pathname === "/" ? "/frontend/dashboard.html" : "/frontend" + parsedUrl.pathname;
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

  // API Routes
  if (req.method === "GET" && parsedUrl.pathname === "/api/patients") {
    return getPatients(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/patients") {
    return addPatient(req, res);
  }
  if (req.method === "GET" && parsedUrl.pathname.startsWith("/api/vitals/")) {
    const id = parsedUrl.pathname.split("/")[3];
    return getVitals(req, res, id);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/vitals") {
    return addVital(req, res);
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/billing") {
    return getBills(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/seed") {
    return seedDemoData(req, res);
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    return generateBillPDF(req, res);
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/admin/clear") {
    return clearAllData(req, res);
  }
  if (req.method === "PUT" && parsedUrl.pathname.startsWith("/api/patients/")) {
    return updatePatient(req, res);
  }
  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/api/patients/")) {
    return deletePatient(req, res);
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/vitals/all") {
    return getAllVitals(req, res);
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// Start server
server.listen(3000, () => {
  console.log("✅ MediTrack backend running at https://localhost:3000");
});
