// Dashboard specific functions
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    checkAdminRole();
});

async function loadDashboard() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patientsData = await response.json();
        
        document.getElementById('totalPatients').textContent = patientsData.length;
        document.getElementById('admittedToday').textContent = 
            patientsData.filter(p => p.status === 'Admitted').length;
        
        const billsResponse = await fetch('/api/billing', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const billsData = await billsResponse.json();
        document.getElementById('pendingBills').textContent = 
            billsData.filter(b => b.status === 'Pending').length;
        
        document.getElementById('criticalAlerts').textContent = '2';
        
        await createVitalsChart();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

let vitalsChart = null;

async function createVitalsChart() {
    try {
        // Destroy existing chart if it exists
        if (vitalsChart) {
            vitalsChart.destroy();
        }
        
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/vitals/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vitalsData = await response.json();
        
        const ctx = document.getElementById('vitalsChart').getContext('2d');
        
        if (vitalsData.length === 0) {
            // Show demo data if no real data
            createDemoChart(ctx);
            return;
        }
        
        // Process real vitals data
        const last7Days = vitalsData.slice(-7);
        const labels = last7Days.map(v => new Date(v.recorded_at).toLocaleDateString());
        const heartRates = last7Days.map(v => v.heart_rate);
        const temperatures = last7Days.map(v => v.temperature);
        
        vitalsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heart Rate (bpm)',
                    data: heartRates,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Temperature (°F)',
                    data: temperatures,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                animation: false,
                interaction: {
                    intersect: false
                },
                onResize: function(chart, size) {
                    // Prevent chart from growing beyond container
                    if (size.height > 300) {
                        chart.resize(size.width, 300);
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Recent Vitals Trend'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 60, // Set reasonable min for vitals
                        max: 120 // Set reasonable max for vitals
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading vitals data:', error);
        const ctx = document.getElementById('vitalsChart').getContext('2d');
        createDemoChart(ctx);
    }
}

function createDemoChart(ctx) {
    vitalsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: [72, 75, 78, 74, 76, 73, 75],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: false
            }, {
                label: 'Temperature (°F)',
                data: [98.6, 98.8, 99.1, 98.5, 98.7, 98.6, 98.9],
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sample Vitals Trend (Demo Data)'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 120
                }
            }
        }
    });
}

function triggerFireAlarm() {
    if (confirm('🚨 FIRE ALARM ACTIVATION 🚨\n\nThis will trigger the hospital fire alarm system.\nAre you sure you want to proceed?')) {
        showAlert('🚨 FIRE ALARM ACTIVATED! Evacuating hospital immediately!', 'error');
        
        // Flash the screen red
        document.body.style.background = 'red';
        setTimeout(() => {
            document.body.style.background = '';
        }, 500);
        
        // Auto-call fire brigade
        setTimeout(() => {
            if (confirm('Auto-calling Fire Brigade (101)?')) {
                window.location.href = 'tel:101';
            }
        }, 1000);
    }
}

// Show admin controls if user is admin
function checkAdminRole() {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
        document.getElementById('adminControls').style.display = 'block';
    }
}

// Admin-specific functions
async function seedDemoData() {
    try {
        const response = await fetch('/api/admin/seed', { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` } 
        });
        if (response.ok) showAlert('Demo data seeded successfully', 'success');
        else showAlert('Failed to seed data', 'error');
    } catch (error) {
        showAlert('Error seeding data', 'error');
    }
}

async function clearAllData() {
    if (confirm('Are you sure? This will delete ALL data!')) {
        try {
            const response = await fetch('/api/admin/clear', { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` } 
            });
            if (response.ok) showAlert('All data cleared', 'success');
            else showAlert('Error clearing data', 'error');
        } catch (error) {
            showAlert('Error clearing data', 'error');
        }
    }
}

async function generateReport() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/reports/csv', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meditrack-report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showAlert('Report downloaded successfully', 'success');
        } else {
            showAlert('Failed to generate report', 'error');
        }
    } catch (error) {
        showAlert('Error generating report', 'error');
    }
}

// Quick Actions
function quickAddPatient() {
    // Store intent to add patient and redirect
    localStorage.setItem('quickAction', 'addPatient');
    window.location.href = 'patients.html';
}

function quickRecordVitals() {
    // Store intent to record vitals and redirect
    localStorage.setItem('quickAction', 'recordVitals');
    window.location.href = 'vitals.html';
}

function quickCreateBill() {
    // Store intent to create bill and redirect
    localStorage.setItem('quickAction', 'createBill');
    window.location.href = 'billing.html';
}