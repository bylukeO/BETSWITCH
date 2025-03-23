/**
 * BetSwitch Login JavaScript
 * Handles login form validation and submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form Validation & Submission
    initLoginForm();
});

/**
 * Initialize login form event handlers
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // This would be replaced with an actual API call
        simulateLogin(email, password);
    });
}

/**
 * Simulate login API call
 * @param {string} email - User's email address
 * @param {string} password - User's password
 */
function simulateLogin(email, password) {
    // Show loading state
    const submitBtn = document.querySelector('#login-form .btn-auth');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Simulate redirect after successful login
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
        // In a real application, you would do:
        /*
        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) throw new Error('Login failed');
            return response.json();
        })
        .then(data => {
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            localStorage.setItem('auth_token', data.token);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        })
        .catch(error => {
            showNotification('Error: ' + error.message, 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
        */
    }, 1500);
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.auth-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'auth-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification type
    notification.className = `auth-notification ${type}`;
    notification.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}