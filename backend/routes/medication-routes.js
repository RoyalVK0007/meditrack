const pool = require('../db');

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

function parseIdFromUrl(req, segmentIndex) {
    const segments = req.url.split('/');
    const id = Number(segments[segmentIndex]);
    return Number.isNaN(id) ? null : id;
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

async function getMedicines(req, res) {
    try {
        const [medicines] = await pool.query('SELECT * FROM medicines ORDER BY name ASC');
        sendJson(res, 200, medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function createMedicine(req, res) {
    try {
        const { name, description = '', stock = 0 } = await readRequestBody(req);
        if (!name) {
            return sendJson(res, 400, { error: 'Medicine name is required' });
        }

        const normalizedStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
        const [result] = await pool.query(
            'INSERT INTO medicines (name, description, stock) VALUES (?, ?, ?)',
            [name, description, normalizedStock]
        );

        sendJson(res, 201, {
            medicine_id: result.insertId,
            name,
            description,
            stock: normalizedStock
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function updateMedicineStock(req, res) {
    const medicineId = parseIdFromUrl(req, 3);
    if (!medicineId) {
        return sendJson(res, 400, { error: 'Invalid medicine ID' });
    }

    try {
        const { stock } = await readRequestBody(req);
        if (!Number.isFinite(Number(stock))) {
            return sendJson(res, 400, { error: 'Stock must be a valid number' });
        }

        const [result] = await pool.query(
            'UPDATE medicines SET stock = ? WHERE medicine_id = ?',
            [Number(stock), medicineId]
        );

        if (result.affectedRows === 0) {
            return sendJson(res, 404, { error: 'Medicine not found' });
        }

        sendJson(res, 200, { message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating medicine stock:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function getPrescriptions(req, res) {
    try {
        const [prescriptions] = await pool.query(
            `SELECT pr.*, p.name AS patient_name, m.name AS medicine_name
             FROM prescriptions pr
             JOIN patients p ON pr.patient_id = p.patient_id
             JOIN medicines m ON pr.medicine_id = m.medicine_id
             ORDER BY pr.start_date DESC, pr.prescription_id DESC`
        );
        sendJson(res, 200, prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function createPrescription(req, res) {
    try {
        const {
            patient_id,
            medicine_id,
            dosage,
            frequency,
            start_date,
            end_date
        } = await readRequestBody(req);

        if (!patient_id || !medicine_id || !dosage || !frequency) {
            return sendJson(res, 400, { error: 'Missing required prescription fields' });
        }

        await pool.query(
            `INSERT INTO prescriptions (patient_id, medicine_id, dosage, frequency, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [patient_id, medicine_id, dosage, frequency, start_date || null, end_date || null]
        );

        sendJson(res, 201, { message: 'Prescription added successfully' });
    } catch (error) {
        console.error('Error adding prescription:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function updatePrescription(req, res) {
    const prescriptionId = parseIdFromUrl(req, 3);
    if (!prescriptionId) {
        return sendJson(res, 400, { error: 'Invalid prescription ID' });
    }

    try {
        const {
            dosage,
            frequency,
            start_date,
            end_date
        } = await readRequestBody(req);

        if (!dosage || !frequency) {
            return sendJson(res, 400, { error: 'Dosage and frequency are required' });
        }

        const [result] = await pool.query(
            `UPDATE prescriptions
             SET dosage = ?, frequency = ?, start_date = ?, end_date = ?
             WHERE prescription_id = ?`,
            [dosage, frequency, start_date || null, end_date || null, prescriptionId]
        );

        if (result.affectedRows === 0) {
            return sendJson(res, 404, { error: 'Prescription not found' });
        }

        sendJson(res, 200, { message: 'Prescription updated successfully' });
    } catch (error) {
        console.error('Error updating prescription:', error);
        sendJson(res, 500, { error: error.message });
    }
}

async function deletePrescription(req, res) {
    const prescriptionId = parseIdFromUrl(req, 3);
    if (!prescriptionId) {
        return sendJson(res, 400, { error: 'Invalid prescription ID' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM prescriptions WHERE prescription_id = ?',
            [prescriptionId]
        );

        if (result.affectedRows === 0) {
            return sendJson(res, 404, { error: 'Prescription not found' });
        }

        sendJson(res, 200, { message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        sendJson(res, 500, { error: error.message });
    }
}

module.exports = {
    getMedicines,
    createMedicine,
    updateMedicineStock,
    getPrescriptions,
    createPrescription,
    updatePrescription,
    deletePrescription
};

