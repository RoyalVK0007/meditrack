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
            console.error('Unauthorized access - redirecting to login');
            localStorage.clear();
            window.location.href = '/login.html';
            throw new Error('Unauthorized');
        }
        return response;
    }).catch(error => {
        console.error('API request failed:', error);
        throw error;
    });
}

// Export for use in other files
window.makeAuthenticatedRequest = makeAuthenticatedRequest;