// API helper functions with JWT authentication

function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = '/login.html';
        return Promise.reject('No token');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    return fetch(url, {
        ...options,
        headers
    }).then(response => {
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/login.html';
            throw new Error('Unauthorized');
        }
        return response;
    });
}

// Export for use in other files
window.makeAuthenticatedRequest = makeAuthenticatedRequest;