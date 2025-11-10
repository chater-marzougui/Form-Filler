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

  // Check if we're on a supported form
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isSupported = tab.url && (
    tab.url.includes('docs.google.com/forms') || 
    tab.url.includes('forms.office.com') || 
    tab.url.includes('forms.microsoft.com')
  );

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
      // Send message to content script to fill the form
      await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      
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
