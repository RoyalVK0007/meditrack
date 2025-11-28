let medicinesCache = [];
let prescriptionsCache = [];
let patientsCache = [];
let editingPrescriptionId = null;

document.addEventListener('DOMContentLoaded', () => {
    initMedicationPage();
});

function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem('jwtToken');
    return {
        'Authorization': `Bearer ${token}`,
        ...extra
    };
}

async function initMedicationPage() {
    const medicineForm = document.getElementById('addMedicineForm');
    const prescriptionForm = document.getElementById('prescriptionForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (medicineForm) {
        medicineForm.addEventListener('submit', addMedicine);
    }

    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', savePrescription);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetPrescriptionForm);
    }

    await Promise.all([
        loadMedicines(),
        loadPatients(),
    ]);
    await loadPrescriptions();
    populatePrescriptionSelects();
}

async function loadMedicines() {
    try {
        const response = await fetch('/api/medicines', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Unable to load medicines');
        medicinesCache = await response.json();
        renderMedicineList();
    } catch (error) {
        console.error(error);
        showAlert('Failed to load medicines', 'error');
    }
}

function renderMedicineList() {
    const container = document.getElementById('medicineList');
    if (!container) return;
    if (medicinesCache.length === 0) {
        container.innerHTML = '<p class="empty-state">No medicines found. Add your first record above.</p>';
        return;
    }

    container.innerHTML = medicinesCache.map(med => `
        <div class="list-item">
            <div>
                <h4>${med.name}</h4>
                <p>${med.description || 'No description provided'}</p>
            </div>
            <div class="list-actions">
                <span class="badge ${med.stock < 20 ? 'badge-danger' : 'badge-info'}">${med.stock} in stock</span>
                <button class="btn-secondary" data-action="stock" data-id="${med.medicine_id}">Adjust Stock</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('button[data-action="stock"]').forEach(button => {
        button.addEventListener('click', () => promptStockUpdate(button.dataset.id));
    });
}

async function addMedicine(event) {
    event.preventDefault();
    const name = document.getElementById('medicineName').value.trim();
    const description = document.getElementById('medicineDescription').value.trim();
    const stock = Number(document.getElementById('medicineStock').value);

    if (!name) {
        showAlert('Medicine name is required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/medicines', {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name, description, stock })
        });

        if (!response.ok) throw new Error('Unable to add medicine');
        document.getElementById('addMedicineForm').reset();
        showAlert(`Medicine "${name}" added`, 'success');
        await loadMedicines();
        populatePrescriptionSelects();
    } catch (error) {
        console.error(error);
        showAlert('Failed to add medicine', 'error');
    }
}

async function promptStockUpdate(medicineId) {
    const medicine = medicinesCache.find(m => m.medicine_id === Number(medicineId));
    const current = medicine ? medicine.stock : 0;
    const newValue = prompt('Enter new stock level', current);
    if (newValue === null) return;

    const parsed = Number(newValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
        showAlert('Please enter a valid stock value', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/medicines/${medicineId}/stock`, {
            method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ stock: parsed })
        });
        if (!response.ok) throw new Error('Unable to update stock');
        showAlert('Stock updated', 'success');
        await loadMedicines();
    } catch (error) {
        console.error(error);
        showAlert('Failed to update stock', 'error');
    }
}

async function loadPatients() {
    try {
        const response = await fetch('/api/patients', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Unable to load patients');
        patientsCache = await response.json();
    } catch (error) {
        console.error(error);
        showAlert('Failed to load patients for prescriptions', 'error');
    }
}

function populatePrescriptionSelects() {
    const patientSelect = document.getElementById('prescriptionPatient');
    const medicineSelect = document.getElementById('prescriptionMedicine');
    if (patientSelect) {
        patientSelect.innerHTML = patientsCache
            .map(patient => `<option value="${patient.patient_id}">${patient.name}</option>`)
            .join('');
    }
    if (medicineSelect) {
        medicineSelect.innerHTML = medicinesCache
            .map(med => `<option value="${med.medicine_id}">${med.name}</option>`)
            .join('');
    }
}

async function loadPrescriptions() {
    try {
        const response = await fetch('/api/prescriptions', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Unable to load prescriptions');
        prescriptionsCache = await response.json();
        renderPrescriptionList();
    } catch (error) {
        console.error(error);
        showAlert('Failed to load prescriptions', 'error');
    }
}

function renderPrescriptionList() {
    const container = document.getElementById('prescriptionList');
    if (!container) return;

    if (prescriptionsCache.length === 0) {
        container.innerHTML = '<p class="empty-state">No prescriptions recorded yet.</p>';
        return;
    }

    container.innerHTML = prescriptionsCache.map(pres => `
        <div class="list-item">
            <div>
                <h4>${pres.patient_name}</h4>
                <p><strong>${pres.medicine_name}</strong> — ${pres.dosage} • ${pres.frequency}</p>
                <small>${formatPrescriptionDates(pres.start_date, pres.end_date)}</small>
            </div>
            <div class="list-actions">
                <button class="btn-secondary" data-action="edit" data-id="${pres.prescription_id}">Edit</button>
                <button class="btn-danger" data-action="delete" data-id="${pres.prescription_id}">Delete</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('button[data-action="edit"]').forEach(button => {
        button.addEventListener('click', () => startPrescriptionEdit(button.dataset.id));
    });
    container.querySelectorAll('button[data-action="delete"]').forEach(button => {
        button.addEventListener('click', () => deletePrescription(button.dataset.id));
    });
}

function formatPrescriptionDates(start, end) {
    if (!start && !end) return 'No date range set';
    const startText = start ? new Date(start).toLocaleDateString() : 'N/A';
    const endText = end ? new Date(end).toLocaleDateString() : 'N/A';
    return `From ${startText} to ${endText}`;
}

function startPrescriptionEdit(id) {
    const pres = prescriptionsCache.find(p => p.prescription_id === Number(id));
    if (!pres) return;
    editingPrescriptionId = pres.prescription_id;
    document.getElementById('prescriptionId').value = pres.prescription_id;
    document.getElementById('prescriptionPatient').value = pres.patient_id;
    document.getElementById('prescriptionMedicine').value = pres.medicine_id;
    document.getElementById('prescriptionDosage').value = pres.dosage;
    document.getElementById('prescriptionFrequency').value = pres.frequency;
    document.getElementById('prescriptionStart').value = pres.start_date ? pres.start_date.split('T')[0] : '';
    document.getElementById('prescriptionEnd').value = pres.end_date ? pres.end_date.split('T')[0] : '';
    document.getElementById('savePrescriptionBtn').textContent = 'Update Prescription';
    showAlert('Editing prescription - adjust values and save', 'info');
}

function resetPrescriptionForm() {
    editingPrescriptionId = null;
    document.getElementById('prescriptionForm').reset();
    document.getElementById('prescriptionId').value = '';
    document.getElementById('savePrescriptionBtn').textContent = 'Save Prescription';
}

async function savePrescription(event) {
    event.preventDefault();
    const payload = {
        patient_id: Number(document.getElementById('prescriptionPatient').value),
        medicine_id: Number(document.getElementById('prescriptionMedicine').value),
        dosage: document.getElementById('prescriptionDosage').value.trim(),
        frequency: document.getElementById('prescriptionFrequency').value.trim(),
        start_date: document.getElementById('prescriptionStart').value || null,
        end_date: document.getElementById('prescriptionEnd').value || null
    };

    if (!payload.patient_id || !payload.medicine_id || !payload.dosage || !payload.frequency) {
        showAlert('All prescription fields are required', 'error');
        return;
    }

    try {
        const url = editingPrescriptionId ? `/api/prescriptions/${editingPrescriptionId}` : '/api/prescriptions';
        const method = editingPrescriptionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Unable to save prescription');

        showAlert(`Prescription ${editingPrescriptionId ? 'updated' : 'created'} successfully`, 'success');
        resetPrescriptionForm();
        await loadPrescriptions();
    } catch (error) {
        console.error(error);
        showAlert('Failed to save prescription', 'error');
    }
}

async function deletePrescription(id) {
    if (!confirm('Delete this prescription?')) return;
    try {
        const response = await fetch(`/api/prescriptions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Unable to delete prescription');
        showAlert('Prescription deleted', 'success');
        await loadPrescriptions();
    } catch (error) {
        console.error(error);
        showAlert('Failed to delete prescription', 'error');
    }
}