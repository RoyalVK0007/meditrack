// Admin functions
document.addEventListener('DOMContentLoaded', function() {
    loadAdminStats();
    
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('userName').value,
            username: document.getElementById('userUsername').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value
        };
        
        showAlert(`User ${userData.name} added successfully`, 'success');
        closeUserModal();
        document.getElementById('addUserForm').reset();
        loadUsers();
    });
});

async function loadAdminStats() {
    try {
        const patientsResponse = await fetch('/api/patients');
        const patients = await patientsResponse.json();
        document.getElementById('adminTotalPatients').textContent = patients.length;
        
        document.getElementById('adminActiveUsers').textContent = '5';
        document.getElementById('adminDbSize').textContent = '2.3 MB';
        document.getElementById('adminLastBackup').textContent = new Date().toLocaleDateString();
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

async function seedDemoData() {
    if (!confirm('This will add demo data to the database. Continue?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/seed', {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Demo data seeded successfully', 'success');
            document.getElementById('adminStatus').innerHTML = `<p><strong>Success:</strong> ${result.message}</p>`;
            loadAdminStats();
        } else {
            const errorText = await response.text();
            console.error('Seed error:', errorText);
            showAlert(`Error seeding demo data: ${response.status}`, 'error');
        }
    } catch (error) {
        console.error('Error seeding data:', error);
        showAlert('Error seeding demo data', 'error');
    }
}

function backupDatabase() {
    showAlert('Database backup initiated', 'success');
    document.getElementById('adminLastBackup').textContent = new Date().toLocaleDateString();
}

async function clearAllData() {
    if (!confirm('This will delete ALL data from the database. This cannot be undone. Continue?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/clear', {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('All data cleared successfully', 'success');
            loadAdminStats();
        } else {
            showAlert('Error clearing data', 'error');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showAlert('Error clearing data', 'error');
    }
}

function showAddUserForm() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

function loadUsers() {
    const container = document.getElementById('usersTableContainer');
    const tbody = document.querySelector('#usersTable tbody');
    
    const users = [
        { uid: 1, name: 'Admin User', role: 'admin', username: 'admin' },
        { uid: 2, name: 'Dr. Sharma', role: 'doctor', username: 'drsharma' },
        { uid: 3, name: 'Nurse Neha', role: 'nurse', username: 'nurseneha' }
    ];
    
    tbody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.uid}</td>
            <td>${user.name}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>${user.username}</td>
            <td>
                <button onclick="editUser(${user.uid})" class="btn-secondary">Edit</button>
                <button onclick="deleteUser(${user.uid})" class="btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    container.style.display = 'block';
}

function editUser(userId) {
    showAlert(`Editing user ID: ${userId}`, 'success');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showAlert(`User ID: ${userId} deleted`, 'success');
        loadUsers();
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('addUserModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}