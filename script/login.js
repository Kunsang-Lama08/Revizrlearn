// Login.js
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const passwordToggles = document.querySelectorAll('.password-toggle');

// Form elements
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');

// Error message elements
const loginUsernameError = document.getElementById('login-username-error');
const loginPasswordError = document.getElementById('login-password-error');
const registerUsernameError = document.getElementById('register-username-error');
const registerPasswordError = document.getElementById('register-password-error');

// Password strength elements
const passwordStrengthBar = document.querySelector('.password-strength-bar');
const passwordStrengthText = document.querySelector('.password-strength-text span');

// Create toast notification system
function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
}

function showToast(message, type = 'info', duration = 4000) {
    createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✓' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '✗' },
        info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404', icon: '⚠' }
    };
    
    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
        background-color: ${color.bg};
        border: 1px solid ${color.border};
        color: ${color.text};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 400px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        position: relative;
        overflow: hidden;
    `;
    
    toast.innerHTML = `
        <span style="font-weight: bold; font-size: 16px;">${color.icon}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: ${color.text};
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
    `;
    
    // Add progress bar for auto-dismiss
    if (duration > 0) {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background-color: ${color.text};
            opacity: 0.3;
            width: 100%;
            transform-origin: left;
            animation: toast-progress ${duration}ms linear;
        `;
        toast.appendChild(progressBar);
        
        // Add CSS animation
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes toast-progress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
    
    return toast;
}

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Password show/hide toggle
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const passwordInput = toggle.parentElement.querySelector('input');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.classList.remove('bxs-hide');
            toggle.classList.add('bxs-show');
        } else {
            passwordInput.type = 'password';
            toggle.classList.remove('bxs-show');
            toggle.classList.add('bxs-hide');
        }
    });
});

// Username validation (only for registration)
function validateUsername(username, errorElement) {
    if (username.value.length < 8) {
        username.parentElement.classList.add('error');
        username.parentElement.classList.remove('success');
        errorElement.classList.add('visible');
        return false;
    } else {
        username.parentElement.classList.remove('error');
        username.parentElement.classList.add('success');
        errorElement.classList.remove('visible');
        return true;
    }
}

// Password validation
function validatePassword(password, errorElement) {
    const value = password.value;
    // Accept any special character (including _)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\W_]{8,}$/;
    if (!regex.test(value)) {
        password.parentElement.classList.add('error');
        password.parentElement.classList.remove('success');
        errorElement.classList.add('visible');
        return false;
    } else {
        password.parentElement.classList.remove('error');
        password.parentElement.classList.add('success');
        errorElement.classList.remove('visible');
        return true;
    }
}

// Password strength meter
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    passwordStrengthBar.className = 'password-strength-bar';
    
    const passwordInput = registerPassword.parentElement;
    const errorElement = document.getElementById('register-password-error');
    
    if (password.length === 0) {
        passwordStrengthText.textContent = 'Not entered';
        passwordStrengthBar.style.width = '0';
        passwordInput.classList.remove('error');
        passwordInput.classList.remove('success');
        errorElement.classList.remove('visible');
    } else if (strength <= 2) {
        passwordStrengthText.textContent = 'Weak';
        passwordStrengthBar.classList.add('weak');
        passwordInput.classList.add('error');
        passwordInput.classList.remove('success');
        errorElement.classList.add('visible');
    } else if (strength <= 4) {
        passwordStrengthText.textContent = 'Medium';
        passwordStrengthBar.classList.add('medium');
        
        const hasAllRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        
        if (hasAllRequirements) {
            passwordInput.classList.remove('error');
            passwordInput.classList.add('success');
            errorElement.classList.remove('visible');
        } else {
            passwordInput.classList.add('error');
            passwordInput.classList.remove('success');
            errorElement.classList.add('visible');
        }
    } else {
        passwordStrengthText.textContent = 'Strong';
        passwordStrengthBar.classList.add('strong');
        passwordInput.classList.remove('error');
        passwordInput.classList.add('success');
        errorElement.classList.remove('visible');
    }
}

// Event listeners for real-time validation
if (registerUsername) {
    registerUsername.addEventListener('input', () => {
        validateUsername(registerUsername, registerUsernameError);
    });
}

if (registerPassword) {
    registerPassword.addEventListener('input', () => {
        validatePassword(registerPassword, registerPasswordError);
        checkPasswordStrength(registerPassword.value);
    });
}

// Helper function to show loading state
function showLoadingState(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Processing...';
}

function hideLoadingState(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
}

// Get the correct server URL
function getServerUrl() {
    // Try to detect if we're in development or production
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // For production, use the same origin
    return '';
}

// Form submission with improved error handling
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('Form submitted'); // Debug log
        
        let isValid = true;
        const submitButton = form.querySelector('.btn');
        
        // Validate form fields
        if (form.id === 'loginForm') {
            // LOGIN FORM
            console.log('Processing login form'); // Debug log
            
            isValid = loginUsername.value.trim() !== '' && isValid;
            isValid = loginPassword.value.trim() !== '' && isValid;
            
            if (!isValid) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            showLoadingState(submitButton);
            showToast('Logging in...', 'info', 2000);
            
            try {
                const serverUrl = getServerUrl();
                const url = `${serverUrl}/api/login`;
                
                console.log('Sending login request to:', url); // Debug log
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: loginUsername.value.trim(),
                        password: loginPassword.value
                    })
                });
                
                console.log('Login response status:', response.status); // Debug log
                
                const data = await response.json();
                console.log('Login response data:', data); // Debug log
                
                if (response.ok) {
                    showToast('Login successful! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showToast(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Connection error. Is the server running on port 3000?', 'error', 6000);
            } finally {
                hideLoadingState(submitButton);
            }
        } else if (form.id === 'registerForm') {
            // REGISTRATION FORM
            console.log('Processing registration form'); // Debug log
            
            isValid = validateUsername(registerUsername, registerUsernameError) && isValid;
            const validPassword = validatePassword(registerPassword, registerPasswordError);
            console.log("validatePassword() returned:", validPassword);
            isValid = validPassword && isValid;
            
            if (!isValid) {
                showToast('Please fix the form errors before submitting', 'error');
                return;
            }
            
            showLoadingState(submitButton);
            showToast('Creating your account...', 'info', 2000);
            
            try {
                const serverUrl = getServerUrl();
                const url = `${serverUrl}/api/register`;
                
                console.log('Sending registration request to:', url); // Debug log
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: registerUsername.value.trim(),
                        password: registerPassword.value
                    })
                });
                
                console.log('Registration response status:', response.status); // Debug log
                
                const data = await response.json();
                console.log('Registration response data:', data); // Debug log
                
                if (response.ok) {
                    showToast('🎉 Registration successful! You can now login with your credentials.', 'success', 5000);
                    
                    // Clear the form
                    registerUsername.value = '';
                    registerPassword.value = '';
                    
                    // Reset form styling
                    registerUsername.parentElement.classList.remove('error', 'success');
                    registerPassword.parentElement.classList.remove('error', 'success');
                    registerUsernameError.classList.remove('visible');
                    registerPasswordError.classList.remove('visible');
                    
                    // Reset password strength
                    passwordStrengthText.textContent = 'Not entered';
                    passwordStrengthBar.className = 'password-strength-bar';
                    passwordStrengthBar.style.width = '0';
                    
                    // Switch to login form after a short delay
                    setTimeout(() => {
                        container.classList.remove('active');
                        showToast('Please login with your new account', 'info', 3000);
                    }, 2000);
                } else {
                    showToast(data.error || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast('Connection error. Is the server running on port 3000?', 'error', 6000);
            } finally {
                hideLoadingState(submitButton);
            }
        }
    });
});

// Add some helpful debug info on page load
console.log('Login script loaded');
console.log('Current location:', window.location.href);
console.log('Detected server URL:', getServerUrl());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Revizrlearn/service-worker.js');
  });
}
