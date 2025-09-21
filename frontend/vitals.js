let patients = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
});

async function loadPatients() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        patients = await response.json();
        
        const select = document.getElementById('vitalPatientSelect');
        select.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
            if (patient.status === 'Admitted') {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = `${patient.name} (ID: ${patient.patient_id})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

async function addVital() {
    const patientId = document.getElementById('vitalPatientSelect').value;
    const heartRate = document.getElementById('heartRate').value;
    const bloodPressure = document.getElementById('bloodPressure').value;
    const temperature = document.getElementById('temperature').value;
    const oxygenLevel = document.getElementById('oxygenLevel').value;
    
    if (!patientId || !heartRate || !bloodPressure || !temperature || !oxygenLevel) {
        showAlert('Please fill all vital signs fields', 'error');
        return;
    }
    
    const vitalData = {
        patient_id: patientId,
        heart_rate: heartRate,
        blood_pressure: bloodPressure,
        temperature: temperature,
        oxygen_level: oxygenLevel
    };
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/vitals', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vitalData)
        });
        
        if (response.ok) {
            showAlert('Vital signs recorded successfully', 'success');
            document.getElementById('heartRate').value = '';
            document.getElementById('bloodPressure').value = '';
            document.getElementById('temperature').value = '';
            document.getElementById('oxygenLevel').value = '';
            loadVitalsHistory(patientId);
        } else {
            showAlert('Error recording vital signs', 'error');
        }
    } catch (error) {
        console.error('Error adding vital:', error);
        showAlert('Error recording vital signs', 'error');
    }
}

async function loadVitalsHistory(patientId) {
    if (!patientId) return;
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/vitals/${patientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vitalsData = await response.json();
        
        const historyDiv = document.getElementById('vitalsHistory');
        historyDiv.innerHTML = '<h3>Recent Vitals History</h3>';
        
        if (vitalsData.length === 0) {
            historyDiv.innerHTML += '<p>No vitals recorded yet.</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Heart Rate</th>
                    <th>Blood Pressure</th>
                    <th>Temperature</th>
                    <th>Oxygen Level</th>
                </tr>
            </thead>
            <tbody>
                ${vitalsData.map(vital => `
                    <tr>
                        <td>${new Date(vital.recorded_at).toLocaleString()}</td>
                        <td>${vital.heart_rate} bpm</td>
                        <td>${vital.blood_pressure}</td>
                        <td>${vital.temperature}°F</td>
                        <td>${vital.oxygen_level}%</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        historyDiv.appendChild(table);
        
        // Create chart
        createVitalsChart(vitalsData);
        
    } catch (error) {
        console.error('Error loading vitals history:', error);
    }
}

function createVitalsChart(vitalsData) {
    const chartContainer = document.getElementById('vitalsChartContainer');
    chartContainer.style.display = 'block';
    
    const ctx = document.getElementById('patientVitalsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.vitalsChart) {
        window.vitalsChart.destroy();
    }
    
    const labels = vitalsData.map(vital => new Date(vital.recorded_at).toLocaleDateString());
    
    window.vitalsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: vitalsData.map(vital => vital.heart_rate),
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Temperature (°F)',
                data: vitalsData.map(vital => vital.temperature),
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                yAxisID: 'y1'
            }, {
                label: 'Oxygen Level (%)',
                data: vitalsData.map(vital => vital.oxygen_level),
                borderColor: '#4bc0c0',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                yAxisID: 'y2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Heart Rate (bpm)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Temperature (°F)' },
                    grid: { drawOnChartArea: false }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    min: 80,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Patient Vitals Trend'
                }
            }
        }
    });
}

document.getElementById('vitalPatientSelect').addEventListener('change', function() {
    const patientId = this.value;
    if (patientId) {
        loadVitalsHistory(patientId);
    } else {
        document.getElementById('vitalsHistory').innerHTML = '';
        document.getElementById('vitalsChartContainer').style.display = 'none';
        if (window.vitalsChart) {
            window.vitalsChart.destroy();
        }
    }
});