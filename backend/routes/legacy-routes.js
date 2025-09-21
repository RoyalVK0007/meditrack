const pool = require('../db');

// Legacy functions for backward compatibility
async function seedDemoData(req, res) {
  try {
    await pool.query(`INSERT INTO doctors (name, specialization, contact) VALUES ('Dr. Smith', 'General', '1234567890'), ('Dr. Jones', 'Cardiology', '0987654321')`);
    
    const [patientResult] = await pool.query(`INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES ('John Doe', 30, 'Male', '5555555555', 'Test Address', NOW(), 'Admitted'), ('Jane Smith', 25, 'Female', '4444444444', 'Test Address 2', NOW(), 'Admitted')`);
    
    await pool.query(`INSERT INTO medicines (name, description, stock) VALUES ('Aspirin', 'Pain relief', 50), ('Ibuprofen', 'Anti-inflammatory', 30)`);
    
    const [patients] = await pool.query(`SELECT patient_id FROM patients WHERE name IN ('John Doe', 'Jane Smith') ORDER BY patient_id`);
    
    if (patients.length >= 2) {
      await pool.query(`INSERT INTO bills (patient_id, room_charges, medicine_charges, doctor_fee, total_amount, status) VALUES (?, 5000, 1500, 2000, 8500, 'Pending'), (?, 3000, 1000, 1500, 5500, 'Paid')`, [patients[0].patient_id, patients[1].patient_id]);
    }
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Demo data seeded successfully" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

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

async function getAllVitals(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM vitals ORDER BY recorded_at DESC LIMIT 50");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function deletePatient(req, res) {
  const patientId = req.url.split('/')[3];
  try {
    await pool.query("DELETE FROM patients WHERE patient_id = ?", [patientId]);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Patient deleted successfully" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = { seedDemoData, clearAllData, getAllVitals, deletePatient };