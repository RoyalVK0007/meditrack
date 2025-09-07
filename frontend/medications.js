document.addEventListener('DOMContentLoaded', function() {
    loadMedicines();
    loadPrescriptions();
});

function loadMedicines() {
    const medicines = [
        { name: 'Paracetamol', description: 'Fever reducer', stock: 200 },
        { name: 'Atorvastatin', description: 'Cholesterol medicine', stock: 100 },
        { name: 'Amlodipine', description: 'Blood pressure medicine', stock: 150 }
    ];
    
    const medicineList = document.getElementById('medicineList');
    medicineList.innerHTML = medicines.map(med => `
        <div class="medicine-item">
            <h4>${med.name}</h4>
            <p>${med.description}</p>
            <span class="stock">Stock: ${med.stock}</span>
        </div>
    `).join('');
}

function loadPrescriptions() {
    const prescriptions = [
        { patient: 'Rahul Mehta', medicine: 'Paracetamol', dosage: '500mg', frequency: '2 times/day' },
        { patient: 'Anita Desai', medicine: 'Amlodipine', dosage: '10mg', frequency: '1 time/day' }
    ];
    
    const prescriptionList = document.getElementById('prescriptionList');
    prescriptionList.innerHTML = prescriptions.map(pres => `
        <div class="prescription-item">
            <h4>${pres.patient}</h4>
            <p><strong>${pres.medicine}</strong> - ${pres.dosage}</p>
            <span class="frequency">${pres.frequency}</span>
        </div>
    `).join('');
}