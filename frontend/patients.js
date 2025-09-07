// Patient management functions
let patients = [];
let filteredPatients = [];
let sortColumn = 'patient_id';
let sortDirection = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    
    document.getElementById('patientForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const patientId = document.getElementById('patientId').value;
        const patientData = {
            name: document.getElementById('patientName').value.trim(),
            age: parseInt(document.getElementById('patientAge').value),
            gender: document.getElementById('patientGender').value,
            contact: document.getElementById('patientContact').value.trim(),
            address: document.getElementById('patientAddress').value.trim()
        };
        
        try {
            const url = patientId ? `/api/patients/${patientId}` : '/api/patients';
            const method = patientId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
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
        }
    });
});

async function loadPatients() {
    try {
        const response = await fetch('/api/patients');
        patients = await response.json();
        
        const tbody = document.querySelector('#patientsTable tbody');
        tbody.innerHTML = '';
        
        filteredPatients = [...patients];
        sortPatients();
        renderPatients();
        
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

function toggleSortDropdown() {
    const dropdown = document.getElementById('sortDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    sortPatients();
    renderPatients();
    updateDropdownText();
    document.getElementById('sortDropdown').style.display = 'none';
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

function renderPatients() {
    const tbody = document.querySelector('#patientsTable tbody');
    tbody.innerHTML = '';
    
    filteredPatients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.contact}</td>
            <td><span class="status ${patient.status.toLowerCase()}">${patient.status}</span></td>
            <td>
                <button onclick="viewPatient(${patient.patient_id})" class="btn-secondary">View</button>
                <button onclick="editPatient(${patient.patient_id})" class="btn-primary">Edit</button>
                <button onclick="deletePatient(${patient.patient_id})" class="btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateDropdownText() {
    const columnNames = {
        'patient_id': 'ID',
        'name': 'Name', 
        'status': 'Status'
    };
    const arrow = sortDirection === 'asc' ? '↑' : '↓';
    document.querySelector('.dropdown-btn').innerHTML = `Sort By ${columnNames[sortColumn]} ${arrow} <span class="dropdown-arrow">▼</span>`;
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
            patient.status.toLowerCase().includes(searchTerm)
        );
    }
    
    sortPatients();
    renderPatients();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filterPatients();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        document.getElementById('sortDropdown').style.display = 'none';
    }
});

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
                    <span class="value">${new Date(patient.admission_date).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value status ${patient.status.toLowerCase()}">${patient.status}</span>
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
        document.getElementById('addPatientModal').style.display = 'block';
    }
}

function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        fetch(`/api/patients/${patientId}`, {
            method: 'DELETE'
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
    
    // Name validation
    if (name.length < 2) {
        showFieldError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        showFieldError('nameError', 'Name can only contain letters and spaces');
        isValid = false;
    }
    
    // Age validation
    if (age < 1 || age > 120) {
        showFieldError('ageError', 'Age must be between 1 and 120');
        isValid = false;
    }
    
    // Gender validation
    if (!gender) {
        showFieldError('genderError', 'Please select a gender');
        isValid = false;
    }
    
    // Contact validation
    if (!/^[0-9]{10}$/.test(contact)) {
        showFieldError('contactError', 'Contact must be exactly 10 digits');
        isValid = false;
    }
    
    // Address validation
    if (address.length < 5) {
        showFieldError('addressError', 'Address must be at least 5 characters');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(errorId, message) {
    document.getElementById(errorId).textContent = message;
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
        user: 'Current User' // In real app, get from session
    };
    
    // Store in localStorage for demo
    let auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    auditLog.unshift(auditEntry); // Add to beginning
    
    // Keep only last 100 entries
    if (auditLog.length > 100) {
        auditLog = auditLog.slice(0, 100);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
    
    // Send to server in real implementation
    // fetch('/api/audit', { method: 'POST', body: JSON.stringify(auditEntry) });
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

window.onclick = function(event) {
    const modal = document.getElementById('addPatientModal');
    const auditModal = document.getElementById('auditLogModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === auditModal) {
        auditModal.style.display = 'none';
    }
}