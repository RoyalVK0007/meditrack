const pool = require('../db');

// Legacy functions for backward compatibility
async function seedDemoData(req, res) {
  try {
    console.log('🌱 Starting demo data seeding...');
    
    // Insert doctors
    console.log('👨‍⚕️ Inserting doctors...');
    const doctorResult = await pool.query(`INSERT INTO doctors (name, specialization, contact) VALUES ('Dr. Smith', 'General', '1234567890'), ('Dr. Jones', 'Cardiology', '0987654321')`);
    console.log(`✅ Inserted ${doctorResult[0].affectedRows} doctors`);
    
    // Insert patients
    console.log('🏥 Inserting patients...');
    const [patientResult] = await pool.query(`INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES ('John Doe', 30, 'Male', '5555555555', 'Test Address', NOW(), 'Admitted'), ('Jane Smith', 25, 'Female', '4444444444', 'Test Address 2', NOW(), 'Admitted')`);
    console.log(`✅ Inserted ${patientResult.affectedRows} patients`);
    
    // Insert medicines
    console.log('💊 Inserting medicines...');
    const medicineResult = await pool.query(`INSERT INTO medicines (name, description, stock) VALUES ('Aspirin', 'Pain relief', 50), ('Ibuprofen', 'Anti-inflammatory', 30)`);
    console.log(`✅ Inserted ${medicineResult[0].affectedRows} medicines`);
    
    // Get patient IDs for bills
    const [patients] = await pool.query(`SELECT patient_id FROM patients WHERE name IN ('John Doe', 'Jane Smith') ORDER BY patient_id`);
    console.log(`🔍 Found ${patients.length} patients for billing`);
    
    if (patients.length >= 2) {
      console.log('💰 Inserting bills...');
      const billResult = await pool.query(`INSERT INTO bills (patient_id, room_charges, medicine_charges, doctor_fee, total_amount, status) VALUES (?, 5000, 1500, 2000, 8500, 'Pending'), (?, 3000, 1000, 1500, 5500, 'Paid')`, [patients[0].patient_id, patients[1].patient_id]);
      console.log(`✅ Inserted ${billResult[0].affectedRows} bills`);
    } else {
      console.log('⚠️ Not enough patients found for billing');
    }
    
    // Insert sample vitals
    console.log('💓 Inserting sample vitals...');
    if (patients.length > 0) {
      const vitalResult = await pool.query(`INSERT INTO vitals (patient_id, heart_rate, blood_pressure, temperature, oxygen_level) VALUES (?, 75, '120/80', 98.6, 98), (?, 82, '130/85', 99.1, 96)`, [patients[0].patient_id, patients[0].patient_id]);
      console.log(`✅ Inserted ${vitalResult[0].affectedRows} vital records`);
    }
    
    console.log('🎉 Demo data seeding completed successfully!');
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Demo data seeded successfully" }));
  } catch (err) {
    console.error('❌ Error seeding demo data:', err);
    console.error('📋 Error details:', {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function clearAllData(req, res) {
  try {
    console.log('🧹 Starting database cleanup...');
    
    const tables = ['vitals', 'prescriptions', 'bills', 'patient_doctor', 'patients', 'doctors', 'medicines'];
    
    for (const table of tables) {
      console.log(`🗑️ Clearing ${table} table...`);
      const result = await pool.query(`DELETE FROM ${table}`);
      console.log(`✅ Deleted ${result[0].affectedRows} records from ${table}`);
    }
    
    console.log('🎉 Database cleanup completed successfully!');
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "All data cleared successfully" }));
  } catch (err) {
    console.error('❌ Error clearing all data:', err);
    console.error('📋 Error details:', {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage
    });
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
    console.error('Error fetching vitals:', err);
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
    console.error('Error deleting patient:', err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = { seedDemoData, clearAllData, getAllVitals, deletePatient };