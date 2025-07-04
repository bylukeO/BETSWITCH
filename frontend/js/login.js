/**
 * BetSwitch Login JavaScript
 * Handles login form validation and submission
 */

document.addEventListener("DOMContentLoaded", function () {
  // Form Validation & Submission
  initLoginForm();

  // Check for redirect parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("redirect")) {
    sessionStorage.setItem("redirectUrl", urlParams.get("redirect"));
  }
});

/**
 * Initialize login form event handlers
 */
function initLoginForm() {
  const loginForm = document.getElementById("login-form");

  // Handle login form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Basic validation
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showNotification("Please enter both email and password", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Call the real API for login
    loginUser(email, password);
  });
}

/**
 * Send login request to the API
 * @param {string} email - User's email address
 * @param {string} password - User's password
 */
function loginUser(email, password) {
  // Show loading state
  const submitBtn = document.querySelector("#login-form .btn-auth");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Logging in...";
  submitBtn.disabled = true;
  const remember = document.getElementById("remember").checked;

  // Use authenticatedFetch instead of secureApiRequest since CSRF is not implemented yet
  authenticatedFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          // Enhanced error handling with specific messages
          const errorMessage =
            data.error ||
            (response.status === 401
              ? "Invalid email or password"
              : response.status === 429
              ? "Too many login attempts. Please try again later"
              : "Login failed. Please try again");
          throw new Error(errorMessage);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Store auth token and user data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Redirect to dashboard or stored URL
      const redirectUrl =
        sessionStorage.getItem("redirectUrl") || "dashboard.html";
      sessionStorage.removeItem("redirectUrl");

      window.location.href = redirectUrl;
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
