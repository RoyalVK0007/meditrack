let bills = [];
let filteredBills = [];
let sortColumn = 'bill_id';
let sortDirection = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    loadBilling();
    setupCreateBillForm();
});

function setupCreateBillForm() {
    // Auto-calculate total when charges change
    const chargeInputs = ['roomCharges', 'medicineCharges', 'doctorFee'];
    chargeInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotal);
    });
    
    // Handle form submission
    document.getElementById('createBillForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createBill();
    });
}

function calculateTotal() {
    const room = parseFloat(document.getElementById('roomCharges').value) || 0;
    const medicine = parseFloat(document.getElementById('medicineCharges').value) || 0;
    const doctor = parseFloat(document.getElementById('doctorFee').value) || 0;
    const total = room + medicine + doctor;
    document.getElementById('totalAmount').value = total.toFixed(2);
}

async function showCreateBillModal() {
    // Load patients for dropdown
    await loadPatientsForBilling();
    document.getElementById('createBillModal').style.display = 'block';
}

function closeCreateBillModal() {
    document.getElementById('createBillModal').style.display = 'none';
    document.getElementById('createBillForm').reset();
}

async function loadPatientsForBilling() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patients = await response.json();
        
        const select = document.getElementById('patientSelect');
        select.innerHTML = '<option value="">Choose a patient...</option>';
        
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = `${patient.name} (ID: ${patient.patient_id})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patients:', error);
        showAlert('Error loading patients', 'error');
    }
}

async function createBill() {
    try {
        const billData = {
            patient_id: parseInt(document.getElementById('patientSelect').value),
            room_charges: parseFloat(document.getElementById('roomCharges').value),
            medicine_charges: parseFloat(document.getElementById('medicineCharges').value),
            doctor_fee: parseFloat(document.getElementById('doctorFee').value),
            total_amount: parseFloat(document.getElementById('totalAmount').value)
        };
        
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(billData)
        });
        
        if (response.ok) {
            showAlert('Bill created successfully', 'success');
            closeCreateBillModal();
            loadBilling();
        } else {
            showAlert('Error creating bill', 'error');
        }
    } catch (error) {
        console.error('Error creating bill:', error);
        showAlert('Error creating bill', 'error');
    }
}

async function loadBilling() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/billing', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        bills = await response.json();
        
        const tbody = document.querySelector('#billingTable tbody');
        tbody.innerHTML = '';
        
        filteredBills = [...bills];
        sortBills();
        renderBills();
        
    } catch (error) {
        console.error('Error loading billing:', error);
        showAlert('Error loading billing data', 'error');
    }
}

async function generateBillPDF(billId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/bills/pdf/${billId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bill-${billId}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            logBillAudit('pdf_generated', billId, 'PDF invoice downloaded');
            showAlert(`PDF downloaded for Bill ID: ${billId}`, 'success');
        } else {
            showAlert('Error generating PDF for bill', 'error');
        }
    } catch (error) {
        console.error('Error generating bill PDF:', error);
        showAlert('Error generating PDF for bill', 'error');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        document.getElementById('sortDropdown').style.display = 'none';
    }
});

let currentBillId = null;
let isEditMode = false;

window.onclick = function(event) {
    const auditModal = document.getElementById('auditLogModal');
    const createBillModal = document.getElementById('createBillModal');
    const viewEditModal = document.getElementById('viewEditBillModal');
    
    if (event.target === auditModal) {
        auditModal.style.display = 'none';
    }
    if (event.target === createBillModal) {
        createBillModal.style.display = 'none';
    }
    if (event.target === viewEditModal) {
        viewEditModal.style.display = 'none';
    }
}

function renderBills() {
    const tbody = document.querySelector('#billingTable tbody');
    tbody.innerHTML = '';
    
    filteredBills.forEach(bill => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => viewBill(bill.bill_id);
        row.innerHTML = `
            <td>${bill.bill_id}</td>
            <td>Patient ID: ${bill.patient_id}</td>
            <td>₹${bill.room_charges}</td>
            <td>₹${bill.medicine_charges}</td>
            <td>₹${bill.doctor_fee}</td>
            <td>₹${bill.total_amount}</td>
            <td><span class="status ${bill.status.toLowerCase()}">${bill.status}</span></td>
            <td onclick="event.stopPropagation()">
                <button onclick="viewBill(${bill.bill_id})" class="btn-info">View</button>
                <button onclick="editBill(${bill.bill_id})" class="btn-warning">Edit</button>
                <button onclick="generateBillPDF(${bill.bill_id})" class="btn-secondary">PDF</button>
                ${bill.status === 'Pending' ? `<button onclick="markPaid(${bill.bill_id})" class="btn-primary">Mark Paid</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
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
    sortBills();
    renderBills();
    updateDropdownText();
    document.getElementById('sortDropdown').style.display = 'none';
}

function sortBills() {
    filteredBills.sort((a, b) => {
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

function updateDropdownText() {
    const columnNames = {
        'bill_id': 'Bill ID',
        'patient_id': 'Patient',
        'status': 'Status'
    };
    const arrow = sortDirection === 'asc' ? '↑' : '↓';
    document.querySelector('.dropdown-btn').innerHTML = `Sort By ${columnNames[sortColumn]} ${arrow} <span class="dropdown-arrow">▼</span>`;
}

function filterBills() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredBills = [...bills];
    } else {
        filteredBills = bills.filter(bill => 
            bill.bill_id.toString().includes(searchTerm) ||
            bill.patient_id.toString().includes(searchTerm) ||
            bill.status.toLowerCase().includes(searchTerm)
        );
    }
    
    sortBills();
    renderBills();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filterBills();
}

function logBillAudit(action, billId, details) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        billId: billId,
        details: details,
        user: 'Current User'
    };
    
    let auditLog = JSON.parse(localStorage.getItem('billAuditLog') || '[]');
    auditLog.unshift(auditEntry);
    
    if (auditLog.length > 100) {
        auditLog = auditLog.slice(0, 100);
    }
    
    localStorage.setItem('billAuditLog', JSON.stringify(auditLog));
}

function showAuditLog() {
    const auditLog = JSON.parse(localStorage.getItem('billAuditLog') || '[]');
    
    if (auditLog.length === 0) {
        showAlert('No billing audit entries found', 'info');
        return;
    }
    
    const auditHtml = auditLog.slice(0, 10).map(entry => `
        <div class="audit-entry">
            <div class="audit-time">${new Date(entry.timestamp).toLocaleString()}</div>
            <div class="audit-action">Bill ID <strong>${entry.billId}</strong> was <span class="action-${entry.action}">${entry.action}</span></div>
            <div class="audit-user">by ${entry.user} - ${entry.details}</div>
        </div>
    `).join('');
    
    document.getElementById('auditLogContent').innerHTML = auditHtml;
    document.getElementById('auditLogModal').style.display = 'block';
}

function closeAuditModal() {
    document.getElementById('auditLogModal').style.display = 'none';
}

async function viewBill(billId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/bills/${billId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const bill = await response.json();
            currentBillId = billId;
            isEditMode = false;
            
            document.getElementById('billModalTitle').textContent = 'View Bill';
            document.getElementById('viewBillId').value = bill.bill_id;
            document.getElementById('viewPatientName').value = bill.patient_name;
            document.getElementById('viewRoomCharges').value = bill.room_charges;
            document.getElementById('viewMedicineCharges').value = bill.medicine_charges;
            document.getElementById('viewDoctorFee').value = bill.doctor_fee;
            document.getElementById('viewTotalAmount').value = bill.total_amount;
            
            // Make fields readonly in view mode
            setFieldsReadonly(true);
            document.getElementById('billActions').style.display = 'none';
            
            document.getElementById('viewEditBillModal').style.display = 'block';
        } else {
            showAlert('Error loading bill', 'error');
        }
    } catch (error) {
        console.error('Error viewing bill:', error);
        showAlert('Error loading bill', 'error');
    }
}

async function editBill(billId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/bills/${billId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const bill = await response.json();
            currentBillId = billId;
            isEditMode = true;
            
            document.getElementById('billModalTitle').textContent = 'Edit Bill';
            document.getElementById('viewBillId').value = bill.bill_id;
            document.getElementById('viewPatientName').value = bill.patient_name;
            document.getElementById('viewRoomCharges').value = bill.room_charges;
            document.getElementById('viewMedicineCharges').value = bill.medicine_charges;
            document.getElementById('viewDoctorFee').value = bill.doctor_fee;
            document.getElementById('viewTotalAmount').value = bill.total_amount;
            
            // Make fields editable in edit mode
            setFieldsReadonly(false);
            document.getElementById('billActions').style.display = 'block';
            
            // Add auto-calculation for edit mode
            setupEditCalculation();
            
            document.getElementById('viewEditBillModal').style.display = 'block';
        } else {
            showAlert('Error loading bill', 'error');
        }
    } catch (error) {
        console.error('Error loading bill for edit:', error);
        showAlert('Error loading bill', 'error');
    }
}

function setFieldsReadonly(readonly) {
    const fields = ['viewRoomCharges', 'viewMedicineCharges', 'viewDoctorFee'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        field.readOnly = readonly;
        field.style.background = readonly ? '#f5f5f5' : 'white';
    });
}

function setupEditCalculation() {
    const chargeInputs = ['viewRoomCharges', 'viewMedicineCharges', 'viewDoctorFee'];
    chargeInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEditTotal);
    });
}

function calculateEditTotal() {
    const room = parseFloat(document.getElementById('viewRoomCharges').value) || 0;
    const medicine = parseFloat(document.getElementById('viewMedicineCharges').value) || 0;
    const doctor = parseFloat(document.getElementById('viewDoctorFee').value) || 0;
    const total = room + medicine + doctor;
    document.getElementById('viewTotalAmount').value = total.toFixed(2);
}

async function updateBill() {
    try {
        const billData = {
            room_charges: parseFloat(document.getElementById('viewRoomCharges').value),
            medicine_charges: parseFloat(document.getElementById('viewMedicineCharges').value),
            doctor_fee: parseFloat(document.getElementById('viewDoctorFee').value),
            total_amount: parseFloat(document.getElementById('viewTotalAmount').value)
        };
        
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/bills/${currentBillId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(billData)
        });
        
        if (response.ok) {
            logBillAudit('updated', currentBillId, 'Bill charges updated');
            showAlert('Bill updated successfully', 'success');
            closeViewEditBillModal();
            loadBilling();
        } else {
            showAlert('Error updating bill', 'error');
        }
    } catch (error) {
        console.error('Error updating bill:', error);
        showAlert('Error updating bill', 'error');
    }
}

function cancelEdit() {
    closeViewEditBillModal();
}

function closeViewEditBillModal() {
    document.getElementById('viewEditBillModal').style.display = 'none';
    currentBillId = null;
    isEditMode = false;
}

async function markPaid(billId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/bills/${billId}/paid`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            logBillAudit('paid', billId, 'Payment status updated to Paid');
            showAlert(`Bill ID: ${billId} marked as paid`, 'success');
            loadBilling();
        } else {
            showAlert('Error updating bill status', 'error');
        }
    } catch (error) {
        console.error('Error marking bill as paid:', error);
        showAlert('Error updating bill status', 'error');
    }
}