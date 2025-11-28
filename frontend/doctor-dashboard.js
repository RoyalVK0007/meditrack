let doctorPatientIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    loadDoctorDashboard();
});

function authHeaders(extra = {}) {
    return {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        ...extra
    };
}

async function fetchJson(url) {
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}

async function loadDoctorDashboard() {
    await loadDoctorStats();
    await createDoctorVitalsChart();
}

async function loadDoctorStats() {
    try {
        const [patients, vitals, prescriptions] = await Promise.all([
            fetchJson('/api/doctor/patients'),
            fetchJson('/api/vitals/all'),
            fetchJson('/api/prescriptions')
        ]);

        doctorPatientIds = new Set(patients.map(p => p.patient_id));
        document.getElementById('myPatients').textContent = patients.length;

        const criticalCases = vitals.filter(v => doctorPatientIds.has(v.patient_id) && (
            v.heart_rate > 110 ||
            v.temperature > 101 ||
            v.oxygen_level < 92
        )).length;
        document.getElementById('criticalCases').textContent = criticalCases;

        const today = new Date().toDateString();
        const todaysAppointments = patients.filter(p => new Date(p.admission_date).toDateString() === today).length;
        document.getElementById('todayAppointments').textContent = todaysAppointments;

        const pendingReports = prescriptions.filter(p =>
            doctorPatientIds.has(p.patient_id) &&
            (!p.end_date || new Date(p.end_date) >= new Date())
        ).length;
        document.getElementById('pendingReports').textContent = pendingReports;
    } catch (error) {
        console.error('Error loading doctor stats:', error);
        showAlert('Unable to load doctor dashboard data', 'error');
    }
}

async function createDoctorVitalsChart() {
    try {
        const ctx = document.getElementById('vitalsChart')?.getContext('2d');
        if (!ctx) return;

        const vitals = await fetchJson('/api/vitals/all');
        const filtered = doctorPatientIds.size ? vitals.filter(v => doctorPatientIds.has(v.patient_id)) : vitals;
        const recent = filtered.slice(-7);

        if (recent.length === 0) {
            showAlert('No vitals recorded yet. Add vitals to see trends.', 'info');
            return;
        }

        const labels = recent.map(v => new Date(v.recorded_at).toLocaleDateString());
        const heartRates = recent.map(v => v.heart_rate);
        const oxygen = recent.map(v => v.oxygen_level);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Heart Rate',
                        data: heartRates,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.15)',
                        tension: 0.4
                    },
                    {
                        label: 'Oxygen Level',
                        data: oxygen,
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.15)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering vitals chart:', error);
    }
}

