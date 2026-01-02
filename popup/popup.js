// Popup script for Form Filler AI

document.addEventListener('DOMContentLoaded', async () => {
  const fillBtn = document.getElementById('fillBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const autoFillToggle = document.getElementById('autoFillToggle');
  const highlightToggle = document.getElementById('highlightToggle');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const info = document.getElementById('info');

  // Load settings
  const settings = await chrome.storage.local.get(['autoFillEnabled', 'highlightEnabled', 'apiKey', 'userProfile']);
  
  autoFillToggle.checked = settings.autoFillEnabled !== false;
  highlightToggle.checked = settings.highlightEnabled !== false;

  // Check if we're on a supported form using proper URL parsing
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let isSupported = false;
  try {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    isSupported = (hostname === 'docs.google.com' && url.pathname.startsWith('/forms')) ||
                  hostname === 'forms.office.com' ||
                  hostname === 'forms.microsoft.com';
  } catch (e) {
    // Invalid URL
    isSupported = false;
  }

  // Check if API key is configured
  const hasApiKey = settings.apiKey && settings.apiKey.length > 0;
  
  // Update UI based on configuration
  if (!hasApiKey) {
    statusIndicator.classList.add('error');
    statusText.textContent = 'API key not configured';
    info.classList.add('error');
    info.querySelector('.info-text').textContent = 'Please configure your Gemini API key in settings.';
    fillBtn.disabled = true;
  } else if (!isSupported) {
    statusIndicator.classList.add('error');
    statusText.textContent = 'Not on a form page';
    info.classList.add('error');
    info.querySelector('.info-text').textContent = 'Navigate to a Google Form or Microsoft Form to use the auto-fill feature.';
    fillBtn.disabled = true;
  } else {
    statusIndicator.classList.remove('error');
    statusText.textContent = 'Ready to fill';
    info.classList.remove('error');
  }

  // Fill form button
  fillBtn.addEventListener('click', async () => {
    fillBtn.disabled = true;
    statusIndicator.classList.add('loading');
    statusText.textContent = 'Filling form...';
    
    try {
      // Try to send message to content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      } catch (error) {
        // Content script might not be loaded, try to inject it
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        if (hostname === 'docs.google.com') {
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['styles/highlight.css']
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-scripts/google-forms.js']
          });
        } else if (hostname === 'forms.office.com' || hostname === 'forms.microsoft.com') {
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['styles/highlight.css']
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-scripts/microsoft-forms.js']
          });
        }
        
        // Wait a moment for script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try sending the message again after injection
        response = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      }
      
      if (response && !response.success) {
        throw new Error(response.error || 'Failed to fill form');
      }
      
      statusIndicator.classList.remove('loading');
      statusIndicator.classList.remove('error');
      statusText.textContent = 'Form filled successfully';
      info.classList.add('success');
      info.querySelector('.info-text').textContent = 'Form has been filled with AI-generated answers!';
      
    } catch (error) {
      console.error('Error filling form:', error);
      statusIndicator.classList.remove('loading');
      statusIndicator.classList.add('error');
      statusText.textContent = 'Error filling form';
      info.classList.add('error');
      info.querySelector('.info-text').textContent = error.message || 'An error occurred while filling the form.';
    } finally {
      setTimeout(() => {
        fillBtn.disabled = false;
      }, 2000);
    }
  });

  // Options button
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Toggle handlers
  autoFillToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoFillEnabled: autoFillToggle.checked });
  });

  highlightToggle.addEventListener('change', () => {
    chrome.storage.local.set({ highlightEnabled: highlightToggle.checked });
  });
});
