const pool = require('../db');

// Input validation helper
function validateVitalData(data) {
  const errors = [];
  
  if (!data.patient_id || !Number.isInteger(Number(data.patient_id)) || Number(data.patient_id) <= 0) {
    errors.push('Valid patient_id is required');
  }
  if (!data.heart_rate || !Number.isInteger(Number(data.heart_rate)) || Number(data.heart_rate) < 30 || Number(data.heart_rate) > 300) {
    errors.push('Heart rate must be between 30-300 bpm');
  }
  if (!data.blood_pressure || !/^\d{2,3}\/\d{2,3}$/.test(data.blood_pressure)) {
    errors.push('Blood pressure must be in format XXX/XXX');
  }
  if (!data.temperature || isNaN(Number(data.temperature)) || Number(data.temperature) < 90 || Number(data.temperature) > 110) {
    errors.push('Temperature must be between 90-110°F');
  }
  if (!data.oxygen_level || !Number.isInteger(Number(data.oxygen_level)) || Number(data.oxygen_level) < 70 || Number(data.oxygen_level) > 100) {
    errors.push('Oxygen level must be between 70-100%');
  }
  
  return errors;
}

// Add vital records (Nurse only)
async function addVital(req, res) {
  let body = '';
  
  req.on('data', chunk => { 
    body += chunk.toString();
    if (body.length > 1024) { // Prevent large payloads
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload too large' }));
      return;
    }
  });
  
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const validationErrors = validateVitalData(data);
      
      if (validationErrors.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Validation failed', details: validationErrors }));
        return;
      }
      
      const { patient_id, heart_rate, blood_pressure, temperature, oxygen_level } = data;
      
      await pool.query(
        'INSERT INTO vitals (patient_id, heart_rate, blood_pressure, temperature, oxygen_level) VALUES (?, ?, ?, ?, ?)',
        [Number(patient_id), Number(heart_rate), blood_pressure.trim(), Number(temperature), Number(oxygen_level)]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Vital record added successfully' }));
    } catch (error) {
      if (error instanceof SyntaxError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      } else {
        console.error('Error adding vital:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad request' }));
  });
}

// Get all patients for vitals (Nurse only)
async function getPatientsForVitals(req, res) {
  try {
    const [patients] = await pool.query(
      'SELECT patient_id, name, age, gender FROM patients WHERE status = ? ORDER BY name',
      ['Admitted']
    );
    
    if (!patients || patients.length === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(patients));
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch patients' }));
  }
}

// Update patient vitals (Nurse only)
async function updateVital(req, res) {
  const vitalId = req.url.split('/')[4];
  
  if (!vitalId || !Number.isInteger(Number(vitalId)) || Number(vitalId) <= 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Valid vital ID is required' }));
    return;
  }
  
  let body = '';
  
  req.on('data', chunk => { 
    body += chunk.toString();
    if (body.length > 1024) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payload too large' }));
      return;
    }
  });
  
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const validationErrors = validateVitalData({ ...data, patient_id: 1 }); // Skip patient_id validation for updates
      const updateErrors = validationErrors.filter(err => !err.includes('patient_id'));
      
      if (updateErrors.length > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Validation failed', details: updateErrors }));
        return;
      }
      
      const { heart_rate, blood_pressure, temperature, oxygen_level } = data;
      
      const [result] = await pool.query(
        'UPDATE vitals SET heart_rate = ?, blood_pressure = ?, temperature = ?, oxygen_level = ? WHERE vital_id = ?',
        [Number(heart_rate), blood_pressure.trim(), Number(temperature), Number(oxygen_level), Number(vitalId)]
      );
      
      if (result.affectedRows === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Vital record not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Vital record updated successfully' }));
    } catch (error) {
      if (error instanceof SyntaxError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      } else {
        console.error('Error updating vital:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad request' }));
  });
}

module.exports = { addVital, getPatientsForVitals, updateVital };