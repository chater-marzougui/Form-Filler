// Options page script

document.addEventListener("DOMContentLoaded", async () => {
  // Get all form elements
  const apiKeyInput = document.getElementById("apiKey");
  const testApiBtn = document.getElementById("testApiBtn");
  const apiStatus = document.getElementById("apiStatus");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const dateOfBirthInput = document.getElementById("dateOfBirth");
  const addressInput = document.getElementById("address");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const zipCodeInput = document.getElementById("zipCode");
  const countryInput = document.getElementById("country");
  const companyInput = document.getElementById("company");
  const jobTitleInput = document.getElementById("jobTitle");
  const websiteInput = document.getElementById("website");
  const customFieldsInput = document.getElementById("customFields");

  const autoFillToggle = document.getElementById("autoFillEnabled");
  const highlightToggle = document.getElementById("highlightEnabled");

  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const saveStatus = document.getElementById("saveStatus");

  // Load saved settings
  const settings = await chrome.storage.local.get([
    "apiKey",
    "userProfile",
    "autoFillEnabled",
    "highlightEnabled",
  ]);

  // Populate form with saved data
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }

  if (settings.userProfile) {
    const profile = settings.userProfile;
    nameInput.value = profile.name || "";
    emailInput.value = profile.email || "";
    phoneInput.value = profile.phone || "";
    dateOfBirthInput.value = profile.dateOfBirth || "";
    addressInput.value = profile.address || "";
    cityInput.value = profile.city || "";
    stateInput.value = profile.state || "";
    zipCodeInput.value = profile.zipCode || "";
    countryInput.value = profile.country || "";
    companyInput.value = profile.company || "";
    jobTitleInput.value = profile.jobTitle || "";
    websiteInput.value = profile.website || "";

    if (profile.customFields && Object.keys(profile.customFields).length > 0) {
      customFieldsInput.value = JSON.stringify(profile.customFields, null, 2);
    }
  }

  autoFillToggle.checked = settings.autoFillEnabled !== false;
  highlightToggle.checked = settings.highlightEnabled !== false;

  // Test API key
  testApiBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus(apiStatus, "Please enter an API key", "error");
      return;
    }

    testApiBtn.disabled = true;
    testApiBtn.textContent = "Testing...";

    try {
      // Load GeminiAPI class by injecting the library as an external script
      // (Avoids eval and complies with extension CSP)
      const libUrl = chrome.runtime.getURL("lib/gemini.js");

      await new Promise((resolve, reject) => {
        // If the class is already available, resolve immediately
        if (typeof GeminiAPI !== "undefined") {
          return resolve();
        }

        // Avoid adding the same script twice
        const existing = document.querySelector(`script[src="${libUrl}"]`);
        if (existing) {
          existing.addEventListener("load", resolve);
          existing.addEventListener("error", () =>
            reject(new Error("Failed to load gemini.js"))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = libUrl;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load gemini.js"));
        document.head.appendChild(script);
      });

      // GeminiAPI should now be available in the page scope
      if (typeof GeminiAPI === "undefined") {
        throw new TypeError("GeminiAPI not found after loading library");
      }

      const gemini = new GeminiAPI(apiKey);
      const isValid = await gemini.validateApiKey();

      if (isValid) {
        showStatus(apiStatus, "✓ API key is valid!", "success");
      } else {
        showStatus(
          apiStatus,
          "✗ API key is invalid or cannot connect to API",
          "error"
        );
      }
    } catch (error) {
      console.error("Error testing API key:", error);
      showStatus(apiStatus, `✗ Error: ${error.message}`, "error");
    } finally {
      testApiBtn.disabled = false;
      testApiBtn.textContent = "Test API Key";
    }
  });

  // Save settings
  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "💾 Saving...";

    try {
      // Parse custom fields JSON
      let customFields = {};
      const customFieldsValue = customFieldsInput.value.trim();
      if (customFieldsValue) {
        // Let JSON.parse throw a SyntaxError which will be handled by the outer try/catch
        customFields = JSON.parse(customFieldsValue);
      }

      // Build user profile object
      const userProfile = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        dateOfBirth: dateOfBirthInput.value,
        address: addressInput.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        zipCode: zipCodeInput.value.trim(),
        country: countryInput.value.trim(),
        company: companyInput.value.trim(),
        jobTitle: jobTitleInput.value.trim(),
        website: websiteInput.value.trim(),
        customFields: customFields,
      };

      // Save to chrome.storage
      await chrome.storage.local.set({
        apiKey: apiKeyInput.value.trim(),
        userProfile: userProfile,
        autoFillEnabled: autoFillToggle.checked,
        highlightEnabled: highlightToggle.checked,
      });

      showStatus(saveStatus, "✓ Settings saved successfully!", "success");

      // Reset button text after a delay
      setTimeout(() => {
        saveBtn.textContent = "💾 Save Settings";
      }, 1000);
    } catch (error) {
      console.error("Error saving settings:", error);
      showStatus(saveStatus, `✗ Error: ${error.message}`, "error");
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Reset to defaults
  resetBtn.addEventListener("click", async () => {
    if (
      !confirm(
        "Are you sure you want to reset all settings to defaults? This cannot be undone."
      )
    ) {
      return;
    }

    resetBtn.disabled = true;

    try {
      // Clear all inputs
      apiKeyInput.value = "";
      nameInput.value = "";
      emailInput.value = "";
      phoneInput.value = "";
      dateOfBirthInput.value = "";
      addressInput.value = "";
      cityInput.value = "";
      stateInput.value = "";
      zipCodeInput.value = "";
      countryInput.value = "";
      companyInput.value = "";
      jobTitleInput.value = "";
      websiteInput.value = "";
      customFieldsInput.value = "";

      autoFillToggle.checked = true;
      highlightToggle.checked = true;

      // Reset storage
      await chrome.storage.local.set({
        apiKey: "",
        userProfile: {
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          dateOfBirth: "",
          company: "",
          jobTitle: "",
          website: "",
          customFields: {},
        },
        autoFillEnabled: true,
        highlightEnabled: true,
      });

      showStatus(saveStatus, "✓ Settings reset to defaults", "success");
    } catch (error) {
      console.error("Error resetting settings:", error);
      showStatus(saveStatus, `✗ Error: ${error.message}`, "error");
    } finally {
      resetBtn.disabled = false;
    }
  });
});

// Helper function to show status messages
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message show ${type}`;

  setTimeout(() => {
    element.classList.remove("show");
  }, 5000);
}
