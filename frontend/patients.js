// Patient management functions
let patients = [];
let filteredPatients = [];
let sortColumn = 'patient_id';
let sortDirection = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    // Delay loading to ensure template is ready
    setTimeout(() => {
        loadPatients();
    }, 100);
    
    document.getElementById('patientForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        const patientId = document.getElementById('patientId').value;
        const patientData = {
            name: document.getElementById('patientName').value.trim(),
            age: parseInt(document.getElementById('patientAge').value),
            gender: document.getElementById('patientGender').value,
            contact: document.getElementById('patientContact').value.trim(),
            address: document.getElementById('patientAddress').value.trim()
        };
        
        try {
            const token = localStorage.getItem('jwtToken');
            const url = patientId ? `/api/patients/${patientId}` : '/api/patients';
            const method = patientId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(patientData)
            });
            
            if (response.ok) {
                const action = patientId ? 'updated' : 'added';
                logAudit(action, patientId || 'new', patientData.name);
                showAlert(patientId ? 'Patient updated successfully' : 'Patient added successfully', 'success');
                closeModal();
                loadPatients();
                clearValidationErrors();
                document.getElementById('patientForm').reset();
            } else {
                showAlert('Error saving patient', 'error');
            }
        } catch (error) {
            console.error('Error saving patient:', error);
            showAlert('Error saving patient', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
});

async function loadPatients() {
    try {
        const token = localStorage.getItem('jwtToken');
        console.log('Loading patients with token:', token ? 'Present' : 'Missing');
        
        const response = await fetch('/api/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            patients = await response.json();
            console.log('Loaded patients:', patients.length);
            
            filteredPatients = [...patients];
            sortPatients();
            renderPatients();
        } else {
            console.error('Failed to load patients:', response.status);
            showAlert('Failed to load patients', 'error');
        }
        
    } catch (error) {
        console.error('Error loading patients:', error);
        showAlert('Error loading patients', 'error');
    }
}

function showAddPatientForm() {
    document.getElementById('modalTitle').textContent = 'Add New Patient';
    document.getElementById('submitBtn').textContent = 'Add Patient';
    document.getElementById('patientId').value = '';
    document.getElementById('patientForm').reset();
    clearValidationErrors();
    document.getElementById('addPatientModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('addPatientModal').style.display = 'none';
}

function closeViewModal() {
    document.getElementById('viewPatientModal').style.display = 'none';
}

function renderPatients() {
    const tbody = document.querySelector('#patientsTable tbody');
    console.log('Table tbody element:', tbody);
    
    if (!tbody) {
        console.error('Table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    console.log('Rendering patients:', filteredPatients.length);
    console.log('Patient data:', filteredPatients);
    console.log('Table visible?', tbody.offsetHeight > 0);
    console.log('Table parent:', tbody.parentElement);
    
    if (filteredPatients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No patients found</td></tr>';
        return;
    }
    
    filteredPatients.forEach((patient, index) => {
        console.log(`Creating row ${index} for patient:`, patient);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.contact}</td>
            <td><span class="status ${patient.status ? patient.status.toLowerCase() : 'active'}">${patient.status || 'Active'}</span></td>
            <td>
                <button onclick="viewPatient(${patient.patient_id})" class="btn-secondary">View</button>
                <button onclick="editPatient(${patient.patient_id})" class="btn-primary">Edit</button>
                <button onclick="deletePatient(${patient.patient_id})" class="btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
        console.log('Row added to tbody');
    });
    
    console.log('Final tbody children count:', tbody.children.length);
    
    // Force table visibility with direct styles
    const table = document.getElementById('patientsTable');
    const tableContainer = table.closest('.table-container');
    const mainContent = table.closest('.main-content');
    
    if (table) {
        table.style.cssText = 'display: table !important; visibility: visible !important; opacity: 1 !important;';
    }
    if (tableContainer) {
        tableContainer.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
    }
    if (mainContent) {
        mainContent.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
    }
    

}

function sortPatients() {
    filteredPatients.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

function filterPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredPatients = [...patients];
    } else {
        filteredPatients = patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.patient_id.toString().includes(searchTerm) ||
            patient.contact.includes(searchTerm) ||
            (patient.status && patient.status.toLowerCase().includes(searchTerm))
        );
    }
    
    sortPatients();
    renderPatients();
}

function viewPatient(patientId) {
    const patient = patients.find(p => p.patient_id === patientId);
    if (patient) {
        logAudit('viewed', patientId, patient.name);
        document.getElementById('viewPatientModal').style.display = 'block';
        document.getElementById('viewPatientDetails').innerHTML = `
            <div class="patient-view">
                <div class="detail-row">
                    <span class="label">Patient ID:</span>
                    <span class="value">${patient.patient_id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Name:</span>
                    <span class="value">${patient.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Age:</span>
                    <span class="value">${patient.age} years</span>
                </div>
                <div class="detail-row">
                    <span class="label">Gender:</span>
                    <span class="value">${patient.gender}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Contact:</span>
                    <span class="value">${patient.contact}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Address:</span>
                    <span class="value">${patient.address}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Admission Date:</span>
                    <span class="value">${patient.admission_date ? new Date(patient.admission_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value status ${patient.status ? patient.status.toLowerCase() : 'active'}">${patient.status || 'Active'}</span>
                </div>
            </div>
        `;
    } else {
        showAlert('Patient not found', 'error');
    }
}

function editPatient(patientId) {
    const patient = patients.find(p => p.patient_id === patientId);
    if (patient) {
        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('submitBtn').textContent = 'Update Patient';
        document.getElementById('patientId').value = patient.patient_id;
        document.getElementById('patientName').value = patient.name;
        document.getElementById('patientAge').value = patient.age;
        document.getElementById('patientGender').value = patient.gender;
        document.getElementById('patientContact').value = patient.contact;
        document.getElementById('patientAddress').value = patient.address;
        clearValidationErrors();
        document.getElementById('addPatientModal').style.display = 'block';
    } else {
        showAlert('Patient not found', 'error');
    }
}

function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        const token = localStorage.getItem('jwtToken');
        fetch(`/api/patients/${patientId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) {
                const patient = patients.find(p => p.patient_id === patientId);
                logAudit('deleted', patientId, patient ? patient.name : 'Unknown');
                showAlert('Patient deleted successfully', 'success');
                loadPatients();
            } else {
                showAlert('Error deleting patient', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting patient:', error);
            showAlert('Error deleting patient', 'error');
        });
    }
}

function validateForm() {
    clearValidationErrors();
    let isValid = true;
    
    const name = document.getElementById('patientName').value.trim();
    const age = document.getElementById('patientAge').value;
    const gender = document.getElementById('patientGender').value;
    const contact = document.getElementById('patientContact').value.trim();
    const address = document.getElementById('patientAddress').value.trim();
    
    if (name.length < 2) {
        showFieldError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (age < 1 || age > 120) {
        showFieldError('ageError', 'Age must be between 1 and 120');
        isValid = false;
    }
    
    if (!gender) {
        showFieldError('genderError', 'Please select a gender');
        isValid = false;
    }
    
    if (!/^[0-9]{10}$/.test(contact)) {
        showFieldError('contactError', 'Contact must be exactly 10 digits');
        isValid = false;
    }
    
    if (address.length < 5) {
        showFieldError('addressError', 'Address must be at least 5 characters');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(errorId, message) {
    const element = document.getElementById(errorId);
    if (element) {
        element.textContent = message;
    }
}

function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.error-msg');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function logAudit(action, patientId, patientName) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        patientId: patientId,
        patientName: patientName,
        user: localStorage.getItem('userName') || 'Current User'
    };
    
    let auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    auditLog.unshift(auditEntry);
    
    if (auditLog.length > 100) {
        auditLog = auditLog.slice(0, 100);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

function showAuditLog() {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    
    if (auditLog.length === 0) {
        showAlert('No audit entries found', 'info');
        return;
    }
    
    const auditHtml = auditLog.slice(0, 10).map(entry => `
        <div class="audit-entry">
            <div class="audit-time">${new Date(entry.timestamp).toLocaleString()}</div>
            <div class="audit-action">Patient <strong>${entry.patientName}</strong> (ID: ${entry.patientId}) was <span class="action-${entry.action}">${entry.action}</span></div>
            <div class="audit-user">by ${entry.user}</div>
        </div>
    `).join('');
    
    document.getElementById('auditLogContent').innerHTML = auditHtml;
    document.getElementById('auditLogModal').style.display = 'block';
}

function closeAuditModal() {
    document.getElementById('auditLogModal').style.display = 'none';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        alertDiv.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        alertDiv.style.backgroundColor = '#dc3545';
    } else if (type === 'info') {
        alertDiv.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addPatientModal');
    const viewModal = document.getElementById('viewPatientModal');
    const auditModal = document.getElementById('auditLogModal');
    
    if (event.target === addModal) {
        addModal.style.display = 'none';
    }
    if (event.target === viewModal) {
        viewModal.style.display = 'none';
    }
    if (event.target === auditModal) {
        auditModal.style.display = 'none';
    }
};