const pool = require('../db');

// Add vital records (Nurse only)
async function addVital(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { patient_id, heart_rate, blood_pressure, temperature, oxygen_level } = JSON.parse(body);
      
      await pool.query(
        'INSERT INTO vitals (patient_id, heart_rate, blood_pressure, temperature, oxygen_level) VALUES (?, ?, ?, ?, ?)',
        [patient_id, heart_rate, blood_pressure, temperature, oxygen_level]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Vital record added successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Get all patients for vitals (Nurse only)
async function getPatientsForVitals(req, res) {
  try {
    const [patients] = await pool.query(
      'SELECT patient_id, name, age, gender FROM patients WHERE status = "Admitted" ORDER BY name'
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(patients));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Update patient vitals (Nurse only)
async function updateVital(req, res) {
  const vitalId = req.url.split('/')[4];
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { heart_rate, blood_pressure, temperature, oxygen_level } = JSON.parse(body);
      
      await pool.query(
        'UPDATE vitals SET heart_rate = ?, blood_pressure = ?, temperature = ?, oxygen_level = ? WHERE vital_id = ?',
        [heart_rate, blood_pressure, temperature, oxygen_level, vitalId]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Vital record updated successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

module.exports = { addVital, getPatientsForVitals, updateVital };