document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('remember').checked;

  // Reset errors
  document.getElementById('email-error').classList.add('hidden');
  document.getElementById('password-error').classList.add('hidden');

  // Basic validation
  if (!email) {
    showError('email-error', 'Email is required');
    return;
  }

  if (!password) {
    showError('password-error', 'Password is required');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store token
      localStorage.setItem('token', data.token);
      
      // Redirect to home
      window.location.href = '/';
    } else {
      showError('password-error', data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('password-error', 'Network error - please try again');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const termsAgreed = document.getElementById('terms').checked;

  // Reset errors
  document.getElementById('name-error').classList.add('hidden');
  document.getElementById('email-error').classList.add('hidden');
  document.getElementById('password-error').classList.add('hidden');
  document.getElementById('confirm-password-error').classList.add('hidden');

  // Validation
  if (!name) {
    showError('name-error', 'Name is required');
    return;
  }

  if (!email) {
    showError('email-error', 'Email is required');
    return;
  }

  if (!password) {
    showError('password-error', 'Password is required');
    return;
  }

  if (password.length < 6) {
    showError('password-error', 'Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError('confirm-password-error', 'Passwords do not match');
    return;
  }

  if (!termsAgreed) {
    alert('You must agree to the terms of service');
    return;
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Auto-login after registration
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } else {
      showError('email-error', data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('email-error', 'Network error - please try again');
  }
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

// Expose to window for other pages
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;