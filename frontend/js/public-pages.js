/**
 * BetSwitch Public Pages Utilities
 * Handles authentication checks for public pages like login/signup
 */

document.addEventListener("DOMContentLoaded", async function () {
  // Check if user is already authenticated
  const isAuthenticated = await checkAuthentication();

  if (isAuthenticated) {
    // User is already authenticated, redirect to dashboard or stored redirect URL
    const redirectUrl =
      sessionStorage.getItem("redirectUrl") || "dashboard.html";
    console.log("User already authenticated, redirecting to:", redirectUrl);

    // Don't redirect if we're already on the target page
    if (!window.location.href.includes(redirectUrl)) {
      window.location.replace(redirectUrl);
    }
  } else {
    console.log("User not authenticated, staying on public page");
  }
});
