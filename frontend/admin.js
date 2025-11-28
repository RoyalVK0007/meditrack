// Admin functions
document.addEventListener('DOMContentLoaded', function() {
    loadAdminStats();
    

});

async function loadAdminStats() {
    try {
        const token = localStorage.getItem('jwtToken');
        const statsResponse = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!statsResponse.ok) throw new Error('Failed to load stats');
        const stats = await statsResponse.json();
        document.getElementById('adminTotalPatients').textContent = stats.totalPatients ?? 0;
        document.getElementById('adminActiveUsers').textContent = stats.activeUsers ?? 0;
        document.getElementById('adminDbSize').textContent = `${stats.totalVitals ?? 0} vitals`;
    } catch (error) {
        console.error('Error loading admin stats:', error);
        showAlert('Error loading admin stats', 'error');
    }
}

async function seedDemoData() {
    if (!confirm('This will add demo data to the database. Continue?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/admin/seed', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
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

async function backupDatabase() {
    if (!confirm('Create a full database backup now?')) return;
    try {
        const token = localStorage.getItem('jwtToken');
        document.getElementById('adminStatus').innerHTML = '<p>⏳ Creating backup...</p>';
        const response = await fetch('/api/admin/backup', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            await handleApiError(response, 'Backup failed');
            document.getElementById('adminStatus').innerHTML = '';
            return;
        }
        const result = await response.json();
        showAlert('Backup completed successfully', 'success');
        document.getElementById('adminStatus').innerHTML = `<p><strong>Backup File:</strong> ${result.file}</p>`;
        document.getElementById('adminLastBackup').textContent = new Date().toLocaleDateString();
    } catch (error) {
        console.error('Error creating backup:', error);
        showAlert('Error creating backup', 'error');
    }
}

async function clearAllData() {
    if (!confirm('This will delete ALL data from the database. This cannot be undone. Continue?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/admin/clear', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
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
    document.getElementById('addUserForm').style.display = 'block';
}

function hideAddUserForm() {
    document.getElementById('addUserForm').style.display = 'none';
    document.getElementById('addUserForm').querySelector('form').reset();
}

async function addUser(event) {
    event.preventDefault();
    
    const userData = {
        full_name: document.getElementById('userName').value.trim(),
        username: document.getElementById('userUsername').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        role: document.querySelector('input[name="userRole"]:checked')?.value
    };
    
    console.log('Form data:', userData);
    
    if (!userData.full_name || !userData.username || !userData.email || !userData.role) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showAlert(`User ${userData.full_name} added successfully`, 'success');
            hideAddUserForm();
            loadUsers();
        } else {
            const error = await response.json();
            showAlert(`Error: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showAlert('Error adding user', 'error');
    }
}



async function loadUsers() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        const users = await response.json();
        const container = document.getElementById('usersTableContainer');
        const tbody = document.querySelector('#usersTable tbody');
        
        tbody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.user_id}</td>
                <td>${user.full_name}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td>${user.username}</td>
                <td>
                    <button onclick="editUser(${user.user_id})" class="btn-secondary">Edit</button>
                    <button onclick="deleteUser(${user.user_id})" class="btn-danger">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        container.style.display = 'block';
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users', 'error');
    }
}

async function editUser(userId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load user');
        
        const users = await response.json();
        const user = users.find(u => u.user_id == userId);
        
        if (!user) {
            showAlert('User not found', 'error');
            return;
        }
        
        // Populate form
        document.getElementById('editUserId').value = user.user_id;
        document.getElementById('editUserName').value = user.full_name;
        document.getElementById('editUserUsername').value = user.username;
        document.getElementById('editUserPassword').value = '';
        document.querySelector(`input[name="editUserRole"][value="${user.role}"]`).checked = true;
        
        // Show form
        document.getElementById('editUserForm').style.display = 'block';
    } catch (error) {
        console.error('Error loading user:', error);
        showAlert('Error loading user', 'error');
    }
}

function hideEditUserForm() {
    document.getElementById('editUserForm').style.display = 'none';
    document.getElementById('editUserForm').querySelector('form').reset();
}

async function updateUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const userData = {
        full_name: document.getElementById('editUserName').value.trim(),
        username: document.getElementById('editUserUsername').value.trim(),
        role: document.querySelector('input[name="editUserRole"]:checked')?.value
    };
    
    const password = document.getElementById('editUserPassword').value;
    if (password) userData.password = password;
    
    if (!userData.full_name || !userData.username || !userData.role) {
        showAlert('Please fill all required fields', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showAlert('User updated successfully', 'success');
            hideEditUserForm();
            loadUsers();
        } else {
            const error = await response.json();
            showAlert(`Error: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('Error updating user', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showAlert('User deleted successfully', 'success');
            loadUsers();
        } else {
            const error = await response.json();
            showAlert(`Error: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user', 'error');
    }
}

