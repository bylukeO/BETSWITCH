/**
 * BetSwitch Conversion JavaScript
 * Handles bet code conversion logic and API integration
 */

document.addEventListener("DOMContentLoaded", function () {
  initConversionForm();
  checkPendingConversion();
});

/**
 * Initialize the conversion form
 */
function initConversionForm() {
  const convertForm = document.querySelector(".converter-card");
  const convertBtn = document.querySelector(".btn-convert");

  if (convertForm && convertBtn) {
    convertBtn.addEventListener("click", async function () {
      // Get form values
      const betCode = convertForm.querySelector("input").value;
      const fromBookmaker = convertForm.querySelector(
        "select:first-of-type"
      ).value;
      const toBookmaker = convertForm.querySelector(
        "select:last-of-type"
      ).value;

      // Validate inputs
      if (!betCode) {
        showNotification("Please enter a bet code", "error");
        return;
      }

      if (!fromBookmaker) {
        showNotification(
          "Please select which bookmaker to convert from",
          "error"
        );
        return;
      }

      if (!toBookmaker) {
        showNotification(
          "Please select which bookmaker to convert to",
          "error"
        );
        return;
      }

      // Get original button text for restoring later
      const originalText = convertBtn.textContent;
      convertBtn.textContent = "Converting...";
      convertBtn.disabled = true;

      try {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem("authToken");

        if (!isAuthenticated) {
          // Store conversion details in session storage for after login
          sessionStorage.setItem(
            "pendingConversion",
            JSON.stringify({
              sourceCode: betCode,
              sourceBookmaker: fromBookmaker,
              targetBookmaker: toBookmaker,
            })
          );

          // Redirect to login page with redirect back to index
          showNotification("Please login first to convert bet codes", "info");
          setTimeout(() => {
            window.location.href = `/login.html?redirect=${encodeURIComponent(
              "/"
            )}`;
          }, 1500);
          return;
        }

        // Call the API to convert the bet code
        const result = await convertBetCode(
          betCode,
          fromBookmaker,
          toBookmaker
        );

        // Display the result
        displayConversionResult(convertForm, result);
        showNotification("Conversion successful!", "success");
      } catch (error) {
        showNotification(
          error.message || "Conversion failed. Please try again.",
          "error"
        );
      } finally {
        // Restore button state
        convertBtn.textContent = originalText;
        convertBtn.disabled = false;
      }
    });
  }
}

/**
 * Call the API to convert the bet code
 * @param {string} sourceCode - The original bet code
 * @param {string} sourceBookmaker - The original bookmaker
 * @param {string} targetBookmaker - The target bookmaker
 * @returns {Promise<Object>} The conversion result
 */
async function convertBetCode(sourceCode, sourceBookmaker, targetBookmaker) {
  try {
    // Use authenticatedFetch to handle authorization consistently
    const response = await authenticatedFetch("/api/conversions", {
      method: "POST",
      body: JSON.stringify({
        sourceCode,
        sourceBookmaker,
        targetBookmaker,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to convert bet code");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Conversion API error:", error);
    throw error;
  }
}

/**
 * Display the conversion result in the UI
 * @param {HTMLElement} formElement - The form container element
 * @param {Object} result - The conversion result from the API
 */
function displayConversionResult(formElement, result) {
  // Create or get the result container
  let resultContainer = formElement.querySelector(".conversion-result");

  if (!resultContainer) {
    resultContainer = document.createElement("div");
    resultContainer.className = "conversion-result";
    formElement.appendChild(resultContainer);
  }

  // Format the date nicely
  const createdAt = new Date(result.createdAt).toLocaleString();

  // Update the content
  resultContainer.innerHTML = `
    <h3>Converted Result:</h3>
    <div class="result-code">${result.convertedCode}</div>
    <div class="conversion-details">
      <p>From: <strong>${result.sourceBookmaker}</strong> | To: <strong>${result.targetBookmaker}</strong></p>
      <p>Original Code: <span>${result.sourceCode}</span></p>
      <p class="conversion-time">Converted on: ${createdAt}</p>
    </div>
  `;

  // Add styling if not already in CSS
  resultContainer.style.marginTop = "20px";
  resultContainer.style.padding = "15px";
  resultContainer.style.borderRadius = "8px";
  resultContainer.style.backgroundColor = "rgba(255, 255, 255, 0.15)";

  // Make the result code stand out
  const resultCode = resultContainer.querySelector(".result-code");
  resultCode.style.fontSize = "24px";
  resultCode.style.fontWeight = "bold";
  resultCode.style.margin = "10px 0";
  resultCode.style.padding = "8px";
  resultCode.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  resultCode.style.borderRadius = "4px";
  resultCode.style.display = "inline-block";
}

/**
 * Check if there's a pending conversion stored in session storage
 * and process it if the user is authenticated
 */
function checkPendingConversion() {
  const pendingConversion = sessionStorage.getItem("pendingConversion");

  if (pendingConversion && localStorage.getItem("authToken")) {
    try {
      const conversionData = JSON.parse(pendingConversion);

      // Clear pending conversion from session storage
      sessionStorage.removeItem("pendingConversion");

      // Set form values
      const convertForm = document.querySelector(".converter-card");
      const input = convertForm.querySelector("input");
      const fromSelect = convertForm.querySelector("select:first-of-type");
      const toSelect = convertForm.querySelector("select:last-of-type");

      input.value = conversionData.sourceCode;
      fromSelect.value = conversionData.sourceBookmaker;
      toSelect.value = conversionData.targetBookmaker;

      // Trigger conversion after a short delay to ensure DOM is fully loaded
      setTimeout(() => {
        document.querySelector(".btn-convert").click();
      }, 500);
    } catch (error) {
      console.error("Error processing pending conversion:", error);
      sessionStorage.removeItem("pendingConversion");
    }
  }
}
