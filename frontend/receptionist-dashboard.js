document.addEventListener('DOMContentLoaded', () => {
    loadReceptionistDashboard();
});

function receptionistHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    };
}

async function loadReceptionistDashboard() {
    try {
        const [patients, bills] = await Promise.all([
            fetch('/api/receptionist/patients', { headers: receptionistHeaders() }),
            fetch('/api/billing', { headers: receptionistHeaders() })
        ].map(async (promise) => {
            const response = await promise;
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);
            return response.json();
        }));

        const today = new Date().toDateString();
        const todaysAdmissions = patients.filter(p => new Date(p.admission_date).toDateString() === today).length;
        const pendingBills = bills.filter(bill => bill.status === 'Pending').length;
        const waitingPatients = patients.filter(p => p.status === 'Admitted').length;

        document.getElementById('todayAdmissions').textContent = todaysAdmissions;
        document.getElementById('pendingBills').textContent = pendingBills;
        document.getElementById('appointments').textContent = patients.length;
        document.getElementById('waitingPatients').textContent = waitingPatients;
    } catch (error) {
        console.error('Error loading receptionist dashboard:', error);
        showAlert('Unable to load receptionist dashboard data', 'error');
    }
}

