/**
 * BetSwitch Signup JavaScript
 * Handles signup form validation and submission
 */

document.addEventListener("DOMContentLoaded", function () {
  // Password Strength Meter
  initPasswordStrength();

  // Form Validation & Submission
  initSignupForm();
});

/**
 * Initialize password strength meter
 */
function initPasswordStrength() {
  const passwordInput = document.getElementById("password");
  const strengthMeter = document.querySelector(".strength-progress");
  const strengthText = document.querySelector(".strength-text");

  if (!passwordInput || !strengthMeter || !strengthText) return;

  passwordInput.addEventListener("input", function () {
    const password = this.value;
    let strength = 0;
    let feedback = "Password strength";

    // Calculate strength score
    if (password.length >= 8) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^A-Za-z0-9]/)) strength += 20;

    // Update UI
    strengthMeter.style.width = strength + "%";

    // Set color and feedback text based on strength
    if (strength <= 20) {
      strengthMeter.style.backgroundColor = "#ff4d4d";
      feedback = "Very weak";
    } else if (strength <= 40) {
      strengthMeter.style.backgroundColor = "#ffa64d";
      feedback = "Weak";
    } else if (strength <= 60) {
      strengthMeter.style.backgroundColor = "#ffff4d";
      feedback = "Moderate";
    } else if (strength <= 80) {
      strengthMeter.style.backgroundColor = "#4dff4d";
      feedback = "Strong";
    } else {
      strengthMeter.style.backgroundColor = "#22c55e";
      feedback = "Very strong";
    }

    strengthText.textContent = feedback;
  });
}

/**
 * Initialize signup form event handlers
 */
function initSignupForm() {
  const signupForm = document.getElementById("signup-form");

  // Validate password confirmation
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  confirmInput.addEventListener("input", function () {
    if (this.value !== passwordInput.value) {
      this.setCustomValidity("Passwords do not match");
    } else {
      this.setCustomValidity("");
    }
  });

  // Handle signup form submission
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Basic validation
    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const phone = document.getElementById("phone").value;
    const termsChecked = document.getElementById("terms").checked;

    if (!fullname || !email || !password || !confirmPassword) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    if (!termsChecked) {
      showNotification(
        "You must accept the Terms of Service and Privacy Policy",
        "error"
      );
      return;
    }

    // Call the real API instead of simulation
    signupUser(fullname, email, phone, password);
  });
}

/**
 * Send signup request to the API
 * @param {string} fullName - User's full name
 * @param {string} email - User's email address
 * @param {string} phone - User's phone number
 * @param {string} password - User's password
 */
function signupUser(fullName, email, phone, password) {
  // Show loading state
  const submitBtn = document.querySelector("#signup-form .btn-auth");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Creating Account...";
  submitBtn.disabled = true;

  // Use authenticatedFetch
  authenticatedFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, phone, password }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const errorMessage =
            data.error ||
            (response.status === 400
              ? "Invalid registration information"
              : "Signup failed. Please try again");
          throw new Error(errorMessage);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      // Store user data
      localStorage.setItem("userData", JSON.stringify(data.user));

      showNotification(
        "Account created successfully! Redirecting to dashboard...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    })
    .catch((error) => {
      showNotification("Error: " + error.message, "error");
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

// Remove the showNotification function from here since it's now in auth.js
