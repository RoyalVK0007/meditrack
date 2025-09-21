const pool = require('../db');

// Add/edit patient details (Receptionist only)
async function addPatient(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { name, age, gender, contact, address, room_number } = JSON.parse(body);
      
      const [result] = await pool.query(
        'INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES (?, ?, ?, ?, ?, NOW(), "Admitted")',
        [name, age, gender, contact, address]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Patient added successfully', patient_id: result.insertId }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Edit patient details (Receptionist only)
async function editPatient(req, res) {
  const patientId = req.url.split('/')[4];
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { name, age, gender, contact, address } = JSON.parse(body);
      
      await pool.query(
        'UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, address = ? WHERE patient_id = ?',
        [name, age, gender, contact, address, patientId]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Patient updated successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Manage billing (Receptionist only)
async function createBill(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { patient_id, room_charges, medicine_charges, doctor_fee, total_amount } = JSON.parse(body);
      
      await pool.query(
        'INSERT INTO bills (patient_id, room_charges, medicine_charges, doctor_fee, total_amount, status) VALUES (?, ?, ?, ?, ?, "Pending")',
        [patient_id, room_charges, medicine_charges, doctor_fee, total_amount]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Bill created successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Get all patients (Receptionist only)
async function getAllPatients(req, res) {
  try {
    const [patients] = await pool.query('SELECT * FROM patients ORDER BY admission_date DESC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(patients));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

module.exports = { addPatient, editPatient, createBill, getAllPatients };