// Service Worker for Form Filler AI Extension

// Import GeminiAPI class
import GeminiAPI from "./lib/gemini.js";

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Form Filler AI installed");
    // Set default values
    chrome.storage.local.set({
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
      apiKey: "",
      autoFillEnabled: true,
      highlightEnabled: true,
    });
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getConfig") {
    // Return configuration to content script
    chrome.storage.local.get(
      ["apiKey", "userProfile", "autoFillEnabled", "highlightEnabled"],
      (data) => {
        sendResponse(data);
      }
    );
    return true; // Keep channel open for async response
  }

  if (request.action === "generateAnswers") {
    // Handle form filling request from content script
    (async () => {
      try {
        // Get API key and user profile from storage
        const { apiKey, userProfile } = await chrome.storage.local.get([
          "apiKey",
          "userProfile",
        ]);

        if (!apiKey) {
          sendResponse({
            error:
              "API key not configured. Please set it in the extension options.",
          });
          return;
        }

        if (!userProfile) {
          sendResponse({
            error:
              "User profile not configured. Please set it in the extension options.",
          });
          return;
        }

        // Create GeminiAPI instance and generate answers
        const gemini = new GeminiAPI(apiKey);
        const answers = await gemini.generateAnswers(
          request.questions,
          userProfile
        );

        // Send answers back to content script
        sendResponse(answers);
      } catch (error) {
        console.error("Error generating answers:", error);
        sendResponse({
          error: error.message || "Failed to generate answers from AI",
        });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (request.action === "logError") {
    console.error("Content Script Error:", request.error);
  }

  if (request.action === "logInfo") {
    console.log("Content Script Info:", request.message);
  }

  if (request.action === "fillComplete") {
    console.log("Form filling completed:", request.stats);
    // Could show a notification here if desired
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on a supported form using proper URL parsing
  try {
    const url = new URL(tab.url);
    const hostname = url.hostname;

    if (
      (hostname === "docs.google.com" && url.pathname.startsWith("/forms")) ||
      hostname === "forms.office.com" ||
      hostname === "forms.microsoft.com"
    ) {
      // Send message to content script to trigger form fill
      chrome.tabs.sendMessage(tab.id, { action: "fillForm" });
    }
  } catch (e) {
    // Invalid URL, ignore
    console.log("Invalid URL:", e);
  }
});
