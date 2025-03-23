/**
 * BetSwitch Signup JavaScript
 * Handles signup form validation and submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // Password Strength Meter
    initPasswordStrength();
    
    // Form Validation & Submission
    initSignupForm();
});

/**
 * Initialize password strength meter
 */
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.querySelector('.strength-progress');
    const strengthText = document.querySelector('.strength-text');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let status = '';
        
        // Check password length
        if (password.length > 0) {
            strength += 20;
        }
        if (password.length >= 8) {
            strength += 20;
        }
        
        // Check for lowercase letters
        if (password.match(/[a-z]/)) {
            strength += 15;
        }
        
        // Check for uppercase letters
        if (password.match(/[A-Z]/)) {
            strength += 15;
        }
        
        // Check for numbers
        if (password.match(/\d/)) {
            strength += 15;
        }
        
        // Check for special characters
        if (password.match(/[^a-zA-Z0-9]/)) {
            strength += 15;
        }
        
        // Update the strength meter
        strengthMeter.style.width = `${strength}%`;
        
        // Update color and text based on strength
        if (strength < 40) {
            strengthMeter.style.backgroundColor = '#ff4d4d'; // Red
            status = 'Weak';
        } else if (strength < 70) {
            strengthMeter.style.backgroundColor = '#ffa64d'; // Orange
            status = 'Moderate';
        } else {
            strengthMeter.style.backgroundColor = '#4CAF50'; // Green
            status = 'Strong';
        }
        
        strengthText.textContent = password.length > 0 ? `Password strength: ${status}` : 'Password strength';
    });
}

/**
 * Initialize signup form event handlers
 */
function initSignupForm() {
    const signupForm = document.getElementById('signup-form');
    
    // Validate password confirmation
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    
    confirmInput.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const termsChecked = document.getElementById('terms').checked;
        
        if (!fullname || !email || !password || !confirmPassword) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (!termsChecked) {
            showNotification('You must accept the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // This would be replaced with an actual API call
        simulateSignup(fullname, email, password);
    });
}

/**
 * Simulate signup API call
 * @param {string} fullname - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 */
function simulateSignup(fullname, email, password) {
    // Show loading state
    const submitBtn = document.querySelector('#signup-form .btn-auth');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Account created successfully! Redirecting to dashboard...', 'success');
        
        // Simulate redirect after successful signup
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
        // In a real application, you would do:
        /*
        fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, password })
        })
        .then(response => {
            if (!response.ok) throw new Error('Signup failed');
            return response.json();
        })
        .then(data => {
            showNotification('Account created successfully! Redirecting to dashboard...', 'success');
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