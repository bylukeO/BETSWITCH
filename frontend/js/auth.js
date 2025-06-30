/**
 * BetSwitch Authentication Utilities
 * Common functions for authentication and session management
 */

/**
 * Check if user is authenticated by verifying token in localStorage
 * @returns {Promise<boolean>} Promise resolving to authentication status
 */
async function checkAuthentication() {
  // First check if we have a token
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("No authentication token found");
    return false;
  }

  try {
    console.log("Checking authentication with server");
    // Verify token is valid with the server
    const response = await authenticatedFetch(
      "http://localhost:5000/api/auth/me"
    );

    if (response.ok) {
      console.log("Server confirms authentication");
      return true;
    } else {
      console.log("Server says not authenticated, removing invalid token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return false;
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
}

/**
 * Log the user out
 * @param {boolean} redirect - Whether to redirect to login page
 */
async function logout(redirect = true) {
  try {
    // Clear local storage first
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Still call logout endpoint to be thorough
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "GET",
      credentials: "include",
    });

    if (redirect) {
      window.location.href = "/login.html";
    }
    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
}

/**
 * Get the current user's profile from local storage or server
 * @returns {Promise<Object>} Promise resolving to user data
 */
async function getCurrentUser() {
  // Try from local storage first for better performance
  const cachedUser = localStorage.getItem("userData");

  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  try {
    const response = await authenticatedFetch(
      "http://localhost:5000/api/auth/me"
    );

    if (!response.ok) {
      throw new Error("Failed to get user data");
    }

    const data = await response.json();
    // Cache the user data
    localStorage.setItem("userData", JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
}

/**
 * Protect page from unauthenticated access
 * Redirects to login if not authenticated
 * @param {boolean} saveRedirect - Whether to save current URL for redirect after login
 * @returns {Promise<boolean>} - Whether authentication check succeeded
 */
async function protectPage(saveRedirect = true) {
  // To avoid redirect loops, check if we're currently in the authentication process
  if (sessionStorage.getItem("authInProgress") === "true") {
    return false;
  }

  try {
    sessionStorage.setItem("authInProgress", "true");

    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");

      // Store current URL for redirect after login
      if (saveRedirect && !window.location.pathname.includes("login.html")) {
        sessionStorage.setItem("redirectUrl", window.location.pathname);
      }

      window.location.replace("/login.html");
      return false;
    }

    console.log("Authentication confirmed for protected page");
    sessionStorage.removeItem("authInProgress");
    return true;
  } catch (error) {
    console.error("Protection check failed:", error);
    sessionStorage.removeItem("authInProgress");
    return false;
  }
}

/**
 * Make an authenticated API request with token from localStorage
 * @param {string} url - The URL to request
 * @param {Object} options - Fetch options
 * @returns {Promise} - The fetch promise
 */
async function authenticatedFetch(url, options = {}) {
  // Ensure URL is absolute
  if (!url.startsWith("http")) {
    url = `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  }

  // Default options
  const defaultOptions = {
    credentials: "include", // Keep for cookie fallback
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add Authorization header with token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  // Make the request
  console.log(`Making authenticated request to ${url}`);
  return fetch(url, mergedOptions);
}

/**
 * Request password reset
 * @param {string} email - User email to send reset link to
 * @returns {Promise<boolean>} - Success status
 */
async function forgotPassword(email) {
  try {
    const response = await authenticatedFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error ||
          (response.status === 404
            ? "No account found with that email address"
            : "Failed to request password reset")
      );
    }

    return true;
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw error;
  }
}

/**
 * Reset password with reset token
 * @param {string} token - Reset token from URL
 * @param {string} password - New password
 * @returns {Promise<boolean>} - Success status
 */
async function resetPassword(token, password) {
  try {
    const response = await authenticatedFetch(
      `/api/auth/reset-password/${token}`,
      {
        method: "PUT",
        body: JSON.stringify({ password }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to reset password");
    }

    return true;
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = "info") {
  // Create notification element if it doesn't exist
  let notification = document.querySelector(".auth-notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.className = "auth-notification";
    document.body.appendChild(notification);
  }

  // Set notification content and style
  notification.textContent = message;
  notification.className = `auth-notification ${type}`;

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Make these functions available globally
window.checkAuthentication = checkAuthentication;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.protectPage = protectPage;
window.authenticatedFetch = authenticatedFetch;
window.showNotification = showNotification;
