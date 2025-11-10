// Google Forms Content Script

// Import Gemini API
const geminiScript = document.createElement('script');
geminiScript.src = chrome.runtime.getURL('lib/gemini.js');
document.head.appendChild(geminiScript);

let config = null;
let isProcessing = false;

// Initialize
async function init() {
  // Get configuration from background script
  config = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getConfig' }, resolve);
  });

  console.log('Form Filler AI initialized for Google Forms');
  
  // Add a button to manually trigger form fill
  addFillButton();
}

// Add a floating button for manual triggering
function addFillButton() {
  if (document.getElementById('ai-form-filler-btn')) return;
  
  const button = document.createElement('button');
  button.id = 'ai-form-filler-btn';
  button.textContent = '🤖 Fill Form with AI';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  });
  
  button.addEventListener('click', () => fillForm());
  document.body.appendChild(button);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillForm();
  }
});

// Extract questions from Google Form
function extractQuestions() {
  const questions = [];
  
  // Google Forms structure: questions are in div elements with specific classes
  const questionElements = document.querySelectorAll('[role="listitem"]');
  
  questionElements.forEach((element, index) => {
    const question = {
      index,
      element,
      text: '',
      type: 'text',
      options: [],
      required: false
    };
    
    // Extract question text
    const questionTextElement = element.querySelector('[role="heading"]');
    if (questionTextElement) {
      question.text = questionTextElement.textContent.trim();
    }
    
    // Check if required
    const requiredElement = element.querySelector('[aria-label*="Required"]');
    question.required = !!requiredElement;
    
    // Determine question type and extract options
    
    // Text/Email/Phone input
    const textInput = element.querySelector('input[type="text"], input[type="email"], input[type="tel"], textarea');
    if (textInput) {
      question.type = 'text';
      question.inputElement = textInput;
    }
    
    // Radio buttons (Multiple choice)
    const radioButtons = element.querySelectorAll('input[type="radio"]');
    if (radioButtons.length > 0) {
      question.type = 'radio';
      question.inputElements = Array.from(radioButtons);
      question.options = Array.from(radioButtons).map(radio => {
        const label = radio.closest('[role="radio"]')?.getAttribute('aria-label') || 
                      radio.closest('label')?.textContent.trim() ||
                      radio.value;
        return label;
      });
    }
    
    // Checkboxes
    const checkboxes = element.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      question.type = 'checkbox';
      question.inputElements = Array.from(checkboxes);
      question.options = Array.from(checkboxes).map(checkbox => {
        const label = checkbox.closest('[role="checkbox"]')?.getAttribute('aria-label') || 
                      checkbox.closest('label')?.textContent.trim() ||
                      checkbox.value;
        return label;
      });
    }
    
    // Dropdown
    const dropdown = element.querySelector('select');
    if (dropdown) {
      question.type = 'dropdown';
      question.inputElement = dropdown;
      question.options = Array.from(dropdown.options)
        .filter(opt => opt.value)
        .map(opt => opt.textContent.trim());
    }
    
    // Date input
    const dateInput = element.querySelector('input[type="date"]');
    if (dateInput) {
      question.type = 'date';
      question.inputElement = dateInput;
    }
    
    // Time input
    const timeInput = element.querySelector('input[type="time"]');
    if (timeInput) {
      question.type = 'time';
      question.inputElement = timeInput;
    }
    
    // Only add questions that have text and input elements
    if (question.text && (question.inputElement || question.inputElements)) {
      questions.push(question);
    }
  });
  
  return questions;
}

// Fill the form with answers
async function fillForm() {
  if (isProcessing) {
    alert('Form filling is already in progress...');
    return;
  }
  
  isProcessing = true;
  
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Extract questions
    const questions = extractQuestions();
    
    if (questions.length === 0) {
      throw new Error('No questions found in the form');
    }
    
    console.log(`Found ${questions.length} questions`);
    
    // Get answers from Gemini
    const gemini = new GeminiAPI(config.apiKey);
    const questionData = questions.map(q => ({
      text: q.text,
      type: q.type,
      options: q.options,
      required: q.required
    }));
    
    const answers = await gemini.generateAnswers(questionData, config.userProfile);
    
    console.log('Received answers from AI:', answers);
    
    // Fill in the answers
    let filledCount = 0;
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer && answer !== 'N/A') {
        const filled = fillQuestion(question, answer);
        if (filled) {
          filledCount++;
          
          // Highlight filled field
          if (config.highlightEnabled) {
            highlightElement(question.element);
          }
        }
      }
    });
    
    // Hide loading indicator
    hideLoadingIndicator();
    
    // Show success message
    showMessage(`Successfully filled ${filledCount} out of ${questions.length} fields!`, 'success');
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'fillComplete',
      stats: { total: questions.length, filled: filledCount }
    });
    
  } catch (error) {
    console.error('Error filling form:', error);
    hideLoadingIndicator();
    showMessage(`Error: ${error.message}`, 'error');
    chrome.runtime.sendMessage({ action: 'logError', error: error.message });
  } finally {
    isProcessing = false;
  }
}

// Fill a single question with an answer
function fillQuestion(question, answer) {
  try {
    switch (question.type) {
      case 'text':
        question.inputElement.value = answer;
        question.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        question.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
        
      case 'radio':
        // Find matching option
        const radioIndex = question.options.findIndex(opt => 
          opt.toLowerCase().includes(answer.toLowerCase()) || 
          answer.toLowerCase().includes(opt.toLowerCase())
        );
        if (radioIndex >= 0 && question.inputElements[radioIndex]) {
          question.inputElements[radioIndex].click();
          return true;
        }
        break;
        
      case 'checkbox':
        // Split answer by comma if multiple selections
        const selections = answer.split(',').map(s => s.trim().toLowerCase());
        let anyChecked = false;
        question.options.forEach((opt, idx) => {
          const shouldCheck = selections.some(sel => 
            opt.toLowerCase().includes(sel) || sel.includes(opt.toLowerCase())
          );
          if (shouldCheck && question.inputElements[idx]) {
            if (!question.inputElements[idx].checked) {
              question.inputElements[idx].click();
            }
            anyChecked = true;
          }
        });
        return anyChecked;
        
      case 'dropdown':
        const dropdownIndex = question.options.findIndex(opt => 
          opt.toLowerCase().includes(answer.toLowerCase()) || 
          answer.toLowerCase().includes(opt.toLowerCase())
        );
        if (dropdownIndex >= 0) {
          question.inputElement.selectedIndex = dropdownIndex + 1; // +1 for placeholder
          question.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        break;
        
      case 'date':
        // Try to parse date from answer
        const dateMatch = answer.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          question.inputElement.value = dateMatch[0];
          question.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          question.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        break;
        
      case 'time':
        question.inputElement.value = answer;
        question.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        question.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
  } catch (error) {
    console.error(`Error filling question "${question.text}":`, error);
  }
  
  return false;
}

// Highlight filled element
function highlightElement(element) {
  element.classList.add('ai-filled');
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    element.classList.remove('ai-filled');
  }, 3000);
}

// Show loading indicator
function showLoadingIndicator() {
  let indicator = document.getElementById('ai-form-filler-loading');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'ai-form-filler-loading';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10001;
        text-align: center;
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <div style="font-size: 16px; font-weight: bold; color: #333;">
          AI is analyzing the form...
        </div>
      </div>
    `;
    document.body.appendChild(indicator);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  indicator.style.display = 'block';
}

// Hide loading indicator
function hideLoadingIndicator() {
  const indicator = document.getElementById('ai-form-filler-loading');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

// Show message to user
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10002;
    padding: 15px 25px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    font-size: 14px;
    font-weight: 500;
    max-width: 400px;
  `;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transition = 'opacity 0.3s';
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
