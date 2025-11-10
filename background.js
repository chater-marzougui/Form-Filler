// Service Worker for Form Filler AI Extension

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Form Filler AI installed');
    // Set default values
    chrome.storage.local.set({
      userProfile: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        dateOfBirth: '',
        company: '',
        jobTitle: '',
        website: '',
        customFields: {}
      },
      apiKey: '',
      autoFillEnabled: true,
      highlightEnabled: true
    });
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    // Return configuration to content script
    chrome.storage.local.get(['apiKey', 'userProfile', 'autoFillEnabled', 'highlightEnabled'], (data) => {
      sendResponse(data);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'logError') {
    console.error('Content Script Error:', request.error);
  }
  
  if (request.action === 'logInfo') {
    console.log('Content Script Info:', request.message);
  }
  
  if (request.action === 'fillComplete') {
    console.log('Form filling completed:', request.stats);
    // Could show a notification here if desired
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on a supported form
  const url = tab.url;
  if (url && (url.includes('docs.google.com/forms') || 
              url.includes('forms.office.com') || 
              url.includes('forms.microsoft.com'))) {
    // Send message to content script to trigger form fill
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
  }
});
