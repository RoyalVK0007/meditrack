let bills = [];
let filteredBills = [];
let sortColumn = 'bill_id';
let sortDirection = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    loadBilling();
});

async function loadBilling() {
    try {
        const response = await fetch('/api/billing');
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

function generateBillPDF(billId) {
    logBillAudit('pdf_generated', billId, 'PDF invoice generated');
    const pdfUrl = `/api/bills/pdf/${billId}`;
    window.open(pdfUrl, '_blank');
    showAlert(`PDF generated for Bill ID: ${billId}`, 'success');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        document.getElementById('sortDropdown').style.display = 'none';
    }
});

window.onclick = function(event) {
    const auditModal = document.getElementById('auditLogModal');
    if (event.target === auditModal) {
        auditModal.style.display = 'none';
    }
}

function renderBills() {
    const tbody = document.querySelector('#billingTable tbody');
    tbody.innerHTML = '';
    
    filteredBills.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.bill_id}</td>
            <td>Patient ID: ${bill.patient_id}</td>
            <td>₹${bill.room_charges}</td>
            <td>₹${bill.medicine_charges}</td>
            <td>₹${bill.doctor_fee}</td>
            <td>₹${bill.total_amount}</td>
            <td><span class="status ${bill.status.toLowerCase()}">${bill.status}</span></td>
            <td>
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

function markPaid(billId) {
    logBillAudit('paid', billId, 'Payment status updated to Paid');
    showAlert(`Bill ID: ${billId} marked as paid`, 'success');
    loadBilling();
}