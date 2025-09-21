const pool = require('../db');

// Get assigned patients (Doctor only)
async function getAssignedPatients(req, res) {
  try {
    const [patients] = await pool.query(`
      SELECT p.*, pd.doctor_id 
      FROM patients p 
      JOIN patient_doctor pd ON p.patient_id = pd.patient_id 
      JOIN doctors d ON pd.doctor_id = d.doctor_id 
      WHERE d.name LIKE ? 
      ORDER BY p.admission_date DESC
    `, [`%${req.user.username}%`]);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(patients));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Get patient vitals history (Doctor only)
async function getPatientVitals(req, res) {
  const patientId = req.url.split('/')[4];
  try {
    const [vitals] = await pool.query(
      'SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC',
      [patientId]
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(vitals));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Add prescription (Doctor only)
async function addPrescription(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { patient_id, medicine_id, dosage, frequency, start_date, end_date } = JSON.parse(body);
      
      await pool.query(
        'INSERT INTO prescriptions (patient_id, medicine_id, dosage, frequency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, medicine_id, dosage, frequency, start_date, end_date]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Prescription added successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { getAssignedPatients, getPatientVitals, addPrescription };