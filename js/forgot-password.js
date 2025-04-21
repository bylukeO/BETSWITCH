/**
 * BetSwitch Forgot Password JavaScript
 * Handles password reset request form
 */

document.addEventListener("DOMContentLoaded", function () {
  initForgotPasswordForm();
});

/**
 * Initialize forgot password form event handlers
 */
function initForgotPasswordForm() {
  const forgotPasswordForm = document.getElementById("forgot-password-form");

  // Handle form submission
  forgotPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Basic validation
    const email = document.getElementById("email").value;

    if (!email) {
      showNotification("Please enter your email address", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Call the API to send reset link
    requestPasswordReset(email);
  });
}

/**
 * Send password reset request to the API
 * @param {string} email - User's email address
 */
function requestPasswordReset(email) {
  const submitBtn = document.querySelector(
    "#forgot-password-form button[type='submit']"
  );
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;

  fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No account found with that email address");
        } else {
          throw new Error("Failed to send reset link. Please try again");
        }
      }
      return response.json();
    })
    .then((data) => {
      showNotification(
        "Reset link sent! Please check your email inbox.",
        "success"
      );
      forgotPasswordForm.reset();
    })
    .catch((error) => {
      showNotification("Error: " + error.message, "error");
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

/**
 * Display a notification message to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error, info)
 */
function showNotification(message, type = "info") {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector(".notification-container");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.className = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to container
  notificationContainer.appendChild(notification);

  // Remove after delay
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
      // Remove container if empty
      if (notificationContainer.children.length === 0) {
        notificationContainer.remove();
      }
    }, 300);
  }, 5000);
}
