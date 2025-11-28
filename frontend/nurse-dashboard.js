document.addEventListener('DOMContentLoaded', () => {
    loadNurseDashboard();
});

function nurseHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    };
}

async function loadNurseDashboard() {
    try {
        const [patients, vitals, prescriptions, medicines] = await Promise.all([
            fetch('/api/nurse/patients', { headers: nurseHeaders() }),
            fetch('/api/vitals/all', { headers: nurseHeaders() }),
            fetch('/api/prescriptions', { headers: nurseHeaders() }),
            fetch('/api/medicines', { headers: nurseHeaders() })
        ].map(async (promise) => {
            const response = await promise;
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);
            return response.json();
        }));

        const latestVitalsByPatient = new Map();
        vitals.forEach(vital => {
            if (!latestVitalsByPatient.has(vital.patient_id)) {
                latestVitalsByPatient.set(vital.patient_id, new Date(vital.recorded_at));
            }
        });

        const now = Date.now();
        const eightHours = 8 * 60 * 60 * 1000;
        const vitalsDue = patients.filter(patient => {
            const lastRecorded = latestVitalsByPatient.get(patient.patient_id);
            return !lastRecorded || (now - lastRecorded.getTime()) > eightHours;
        }).length;

        const today = new Date().toDateString();
        const medicationsDue = prescriptions.filter(p => {
            const start = p.start_date ? new Date(p.start_date).toDateString() : null;
            const end = p.end_date ? new Date(p.end_date).toDateString() : null;
            return (!start || start <= today) && (!end || end >= today);
        }).length;

        const lowStockMedicines = medicines.filter(med => med.stock < 25).length;

        document.getElementById('assignedPatients').textContent = patients.length;
        document.getElementById('vitalsDue').textContent = vitalsDue;
        document.getElementById('medicationsDue').textContent = medicationsDue + lowStockMedicines;
        updateShiftHours();
    } catch (error) {
        console.error('Error loading nurse dashboard:', error);
        showAlert('Unable to load nurse dashboard data', 'error');
    }
}

function updateShiftHours() {
    const shiftStart = Number(localStorage.getItem('nurseShiftStart')) || Date.now();
    if (!localStorage.getItem('nurseShiftStart')) {
        localStorage.setItem('nurseShiftStart', shiftStart.toString());
    }
    const elapsedHours = ((Date.now() - shiftStart) / (1000 * 60 * 60)).toFixed(1);
    document.getElementById('shiftHours').textContent = `${Math.min(elapsedHours, 8)}/8`;
}

