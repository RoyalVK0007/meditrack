const pool = require("./db");

// Fetch all patients
async function getPatients(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM patients ORDER BY admission_date DESC");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Add new patient
async function addPatient(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const data = JSON.parse(body);
      await pool.query(
        "INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES (?, ?, ?, ?, ?, NOW(), 'Admitted')",
        [data.name, data.age, data.gender, data.contact, data.address]
      );
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Patient added successfully" }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

// Fetch vitals by patient ID
async function getVitals(req, res, id) {
  try {
    const [rows] = await pool.query("SELECT * FROM vitals WHERE patient_id = ?", [id]);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Add new vital (POST)
async function addVital(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const data = JSON.parse(body);
      await pool.query(
        "INSERT INTO vitals (patient_id, blood_pressure, heart_rate, temperature, oxygen_level) VALUES (?, ?, ?, ?, ?)",
        [data.patient_id, data.blood_pressure, data.heart_rate, data.temperature, data.oxygen_level]
      );
      res.writeHead(201);
      res.end(JSON.stringify({ message: "Vital added" }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

// Fetch billing info
async function getBills(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM bills");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Seed demo data
async function seedDemoData(req, res) {
  try {
    // Insert doctors
    await pool.query(`INSERT INTO doctors (name, specialization, contact) VALUES ('Dr. Smith', 'General', '1234567890'), ('Dr. Jones', 'Cardiology', '0987654321')`);
    
    // Insert patients and get their IDs
    const [patientResult] = await pool.query(`INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES ('John Doe', 30, 'Male', '5555555555', 'Test Address', NOW(), 'Admitted'), ('Jane Smith', 25, 'Female', '4444444444', 'Test Address 2', NOW(), 'Admitted')`);
    
    await pool.query(`INSERT INTO medicines (name, description, stock) VALUES ('Aspirin', 'Pain relief', 50), ('Ibuprofen', 'Anti-inflammatory', 30)`);
    
    // Get actual patient IDs
    const [patients] = await pool.query(`SELECT patient_id FROM patients WHERE name IN ('John Doe', 'Jane Smith') ORDER BY patient_id`);
    
    if (patients.length >= 2) {
      await pool.query(`INSERT INTO bills (patient_id, room_charges, medicine_charges, doctor_fee, total_amount, status) VALUES (?, 5000, 1500, 2000, 8500, 'Pending'), (?, 3000, 1000, 1500, 5500, 'Paid')`, [patients[0].patient_id, patients[1].patient_id]);
    }
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Demo data with bills seeded successfully" }));
  } catch (err) {
    console.error('Seed error:', err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Generate PDF bill
async function generateBillPDF(req, res) {
  const billId = req.url.split('/')[4]; // /api/bills/pdf/{id}
  
  try {
    const [bills] = await pool.query(`
      SELECT b.*, p.name as patient_name, p.contact, p.address 
      FROM bills b 
      JOIN patients p ON b.patient_id = p.patient_id 
      WHERE b.bill_id = ?
    `, [billId]);
    
    if (bills.length === 0) {
      res.writeHead(404);
      res.end('Bill not found');
      return;
    }
    
    const bill = bills[0];
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');
    
    const doc = new PDFDocument();
    const fileName = `bill_${billId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'reports', fileName);
    
    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);
    
    // PDF Header
    doc.fontSize(24).text('MEDITRACK GENERAL HOSPITAL', 50, 40, {align: 'center'});
    doc.fontSize(12).text('123 Healthcare Avenue, Medical District', 50, 70, {align: 'center'});
    doc.text('Mumbai, Maharashtra 400001 | Phone: +91-22-1234-5678', 50, 85, {align: 'center'});
    doc.text('Email: info@meditrack.com | Website: www.meditrack.com', 50, 100, {align: 'center'});
    
    doc.moveTo(50, 120).lineTo(550, 120).stroke();
    
    doc.fontSize(18).text('MEDICAL BILL INVOICE', 50, 140, {align: 'center'});
    doc.moveTo(50, 165).lineTo(550, 165).stroke();
    
    // Bill Details
    doc.fontSize(12)
       .text(`Bill ID: ${bill.bill_id}`, 50, 185)
       .text(`Date: ${new Date(bill.bill_date).toLocaleDateString()}`, 350, 185)
       .text(`Patient Name: ${bill.patient_name}`, 50, 205)
       .text(`Contact: ${bill.contact}`, 50, 225)
       .text(`Address: ${bill.address}`, 50, 245);
    
    // Charges Table
    doc.fontSize(14).text('CHARGES BREAKDOWN', 50, 285);
    doc.moveTo(50, 305).lineTo(550, 305).stroke();
    
    doc.fontSize(12)
       .text('Room Charges:', 50, 325).text(`Rs. ${bill.room_charges}`, 450, 325)
       .text('Medicine Charges:', 50, 345).text(`Rs. ${bill.medicine_charges}`, 450, 345)
       .text('Doctor Fee:', 50, 365).text(`Rs. ${bill.doctor_fee}`, 450, 365);
    
    doc.moveTo(50, 385).lineTo(550, 385).stroke();
    doc.fontSize(16).text('TOTAL AMOUNT:', 50, 405).text(`Rs. ${bill.total_amount}`, 450, 405);
    doc.fontSize(12).text(`Payment Status: ${bill.status}`, 50, 435);
    
    // Footer
    doc.moveTo(50, 480).lineTo(550, 480).stroke();
    doc.fontSize(10)
       .text('Thank you for choosing MediTrack General Hospital', 50, 500, {align: 'center'})
       .text('For any queries, please contact us at +91-22-1234-5678 or info@meditrack.com', 50, 515, {align: 'center'})
       .text('Get well soon!', 50, 535, {align: 'center'});
    
    // Auto-generated footer
    doc.moveTo(50, 560).lineTo(550, 560).stroke();
    doc.fontSize(8).text('This invoice is auto-generated by MediTrack Hospital Management System', 50, 570, {align: 'center'});
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, 580, {align: 'center'});
    
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`
    });
    
    doc.end();
    
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Clear all data
async function clearAllData(req, res) {
  try {
    await pool.query('DELETE FROM vitals');
    await pool.query('DELETE FROM prescriptions');
    await pool.query('DELETE FROM bills');
    await pool.query('DELETE FROM patient_doctor');
    await pool.query('DELETE FROM patients');
    await pool.query('DELETE FROM doctors');
    await pool.query('DELETE FROM medicines');
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "All data cleared successfully" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Update patient
async function updatePatient(req, res) {
  const patientId = parseInt(req.url.split('/')[3]);
  if (!patientId || patientId <= 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid patient ID" }));
    return;
  }
  
  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const data = JSON.parse(body);
      await pool.query(
        "UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, address = ? WHERE patient_id = ?",
        [data.name, data.age, data.gender, data.contact, data.address, patientId]
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Patient updated successfully" }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

// Delete patient
async function deletePatient(req, res) {
  const patientId = parseInt(req.url.split('/')[3]);
  if (!patientId || patientId <= 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid patient ID" }));
    return;
  }
  
  try {
    await pool.query("DELETE FROM patients WHERE patient_id = ?", [patientId]);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Patient deleted successfully" }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Get all vitals for dashboard
async function getAllVitals(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM vitals ORDER BY recorded_at DESC LIMIT 50");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}



module.exports = { getPatients, addPatient, updatePatient, deletePatient, getVitals, addVital, getAllVitals, getBills, seedDemoData, generateBillPDF, clearAllData };