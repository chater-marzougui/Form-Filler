// Microsoft Forms Content Script

let config = null;
let isProcessing = false;

// Initialize
async function init() {
  // Get configuration from background script
  config = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getConfig" }, resolve);
  });

  console.log("Form Filler AI initialized for Microsoft Forms");

  // Add a button to manually trigger form fill
  addFillButton();
}

// Add a floating button for manual triggering
function addFillButton() {
  if (document.getElementById("ai-form-filler-btn")) return;

  const button = document.createElement("button");
  button.id = "ai-form-filler-btn";
  button.textContent = "🤖 Fill Form with AI";
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

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
  });

  button.addEventListener("click", () => fillForm());
  document.body.appendChild(button);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm") {
    fillForm();
  }
});

// Extract questions from Microsoft Form
function extractQuestions() {
  const questions = [];

  // Try multiple selectors to find all question containers
  const possibleSelectors = [
    '[data-automation-id="questionItem"]',
    ".office-form-question",
    '[class*="questionContainer"]',
    '[class*="question-item"]',
    'div[role="group"]', // Microsoft Forms often uses role="group" for questions
  ];

  let questionElements = [];

  // Try each selector until we find questions
  for (const selector of possibleSelectors) {
    questionElements = document.querySelectorAll(selector);
    if (questionElements.length > 0) {
      console.log(
        `Found ${questionElements.length} questions using selector: ${selector}`
      );
      break;
    }
  }

  // Fallback: if still no questions found, look for any div containing input elements
  if (questionElements.length === 0) {
    console.log("Using fallback method to detect questions");
    const allInputs = document.querySelectorAll(
      'input:not([type="hidden"]), textarea, select'
    );
    const questionSet = new Set();

    allInputs.forEach((input) => {
      // Find the closest parent that looks like a question container
      let parent =
        input.closest('div[class*="question"]') ||
        input.closest("div[data-automation-id]") ||
        input.closest('div[role="group"]');

      // If no specific container found, use a parent div that's big enough
      if (!parent) {
        parent = input.parentElement;
        let depth = 0;
        while (parent && depth < 5) {
          if (parent.tagName === "DIV" && parent.offsetHeight > 50) {
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      }

      if (parent && !questionSet.has(parent)) {
        questionSet.add(parent);
        questionElements = Array.from(questionSet);
      }
    });
  }

  console.log(
    `Processing ${questionElements.length} potential question elements`
  );

  questionElements.forEach((element, index) => {
    console.log(`\n--- Analyzing element ${index + 1} ---`);
    console.log('Element:', element);
    console.log('Element HTML (first 200 chars):', element.innerHTML.substring(0, 200));
    const question = {
      index,
      element,
      text: "",
      type: "text",
      options: [],
      required: false,
    };

    // Extract question text - try multiple methods
    let questionText = "";

    // Method 1: Look for specific question title elements
    const titleSelectors = [
      '[data-automation-id="questionTitle"]',
      ".question-title",
      '[class*="questionTitle"]',
      "label",
      "legend",
    ];

    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        questionText = titleElement.textContent.trim();
        break;
      }
    }

    // Method 2: Look for text before any input element
    if (!questionText) {
      const allText = element.textContent.trim();
      const inputElement = element.querySelector("input, textarea, select");
      if (inputElement && allText) {
        // Get text before the input
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        let textParts = [];
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (
            text &&
            text.length > 2 &&
            !text.match(/^(Enter|Select|Choose)/i)
          ) {
            textParts.push(text);
          }
          // Stop if we've reached the input element
          if (node.parentElement.contains(inputElement)) {
            break;
          }
        }
        questionText = textParts.join(" ").trim();
      }
    }

    // Method 3: Fallback - use the first substantial text found
    if (!questionText) {
      const textElements = element.querySelectorAll("div, span, label, p");
      for (const el of textElements) {
        // Get only direct text content, not nested
        const text = Array.from(el.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent.trim())
          .join(" ")
          .trim();

        if (
          text.length > 5 &&
          !text.match(/^(Required|Enter|Select|Choose)/i)
        ) {
          questionText = text;
          break;
        }
      }
    }

    question.text = questionText;

    // Check if required - look for asterisk or required indicator
    const requiredIndicators = [
      '[aria-required="true"]',
      ".required-indicator",
      '[class*="required"]',
    ];

    for (const selector of requiredIndicators) {
      if (element.querySelector(selector)) {
        question.required = true;
        break;
      }
    }

    // Also check if question text ends with asterisk
    if (questionText.includes("*")) {
      question.required = true;
    }

    // Determine question type and extract options/input elements

    // Check for radio buttons first
    const radioButtons = element.querySelectorAll('input[type="radio"]');
    if (radioButtons.length > 0) {
      question.type = "radio";
      question.inputElements = Array.from(radioButtons);
      question.options = Array.from(radioButtons).map((radio) => {
        const label =
          radio.closest("label")?.textContent.trim() ||
          radio.nextSibling?.textContent?.trim() ||
          radio.getAttribute("aria-label") ||
          radio.value;
        return label;
      });
    }
    // Check for checkboxes
    else if (element.querySelectorAll('input[type="checkbox"]').length > 0) {
      const checkboxes = element.querySelectorAll('input[type="checkbox"]');
      question.type = "checkbox";
      question.inputElements = Array.from(checkboxes);
      question.options = Array.from(checkboxes).map((checkbox) => {
        const label =
          checkbox.closest("label")?.textContent.trim() ||
          checkbox.nextSibling?.textContent?.trim() ||
          checkbox.getAttribute("aria-label") ||
          checkbox.value;
        return label;
      });
    }
    // Check for dropdown
    else if (element.querySelector('select, [role="combobox"]')) {
      const dropdown = element.querySelector('select, [role="combobox"]');
      question.type = "dropdown";
      question.inputElement = dropdown;

      if (dropdown.tagName === "SELECT") {
        question.options = Array.from(dropdown.options)
          .filter((opt) => opt.value)
          .map((opt) => opt.textContent.trim());
      } else {
        // Custom dropdown (role="combobox")
        const options = element.querySelectorAll('[role="option"]');
        question.options = Array.from(options).map((opt) =>
          opt.textContent.trim()
        );
      }
    }
    // Check for date input
    else if (element.querySelector('input[type="date"]')) {
      const dateInput = element.querySelector('input[type="date"]');
      question.type = "date";
      question.inputElement = dateInput;
    }
    // Check for various text-based inputs (including inputs without type attribute)
    else {
      // Microsoft Forms often uses inputs without explicit type or with generic type
      const textInput = element.querySelector('input[type="text"]');
      const emailInput = element.querySelector('input[type="email"]');
      const telInput = element.querySelector('input[type="tel"]');
      const numberInput = element.querySelector('input[type="number"]');
      const textarea = element.querySelector("textarea");
      // Also check for inputs without a type attribute or with empty type
      const genericInput = element.querySelector('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="button"]):not([type="submit"])');

      const input =
        textInput || emailInput || telInput || numberInput || textarea || genericInput;

      if (input) {
        question.type = "text";
        question.inputElement = input;

        // Determine more specific type based on input
        if (emailInput) {
          question.subType = "email";
        } else if (telInput) {
          question.subType = "phone";
        } else if (numberInput) {
          question.subType = "number";
        }
        
        console.log(`Found text input for question ${index + 1}:`, input.tagName, input.type, input);
      } else {
        // Debug: log all input elements in this question container
        const allInputs = element.querySelectorAll('input, textarea');
        console.log(`Question ${index + 1} - All inputs found (${allInputs.length}):`, 
          Array.from(allInputs).map(inp => `${inp.tagName}[type="${inp.type}"]`).join(', '));
      }
    }

    // Only add questions that have both text and input elements
    if (
      question.text &&
      (question.inputElement ||
        (question.inputElements && question.inputElements.length > 0))
    ) {
      console.log(
        `Question ${index + 1}: "${question.text}" (${question.type})`
      );
      questions.push(question);
    } else {
      console.log(
        `Skipped element ${index + 1}: text="${question.text}", hasInput=${!!(
          question.inputElement || question.inputElements
        )}`
      );
    }
  });

  return questions;
}

// Fill the form with answers
async function fillForm() {
  if (isProcessing) {
    alert("Form filling is already in progress...");
    return;
  }

  isProcessing = true;

  try {
    // Show loading indicator
    showLoadingIndicator();

    // Extract questions
    const questions = extractQuestions();

    if (questions.length === 0) {
      throw new Error(
        "No questions found in the form. Please make sure you're on a Microsoft Form."
      );
    }

    console.log(`Found ${questions.length} questions to fill`);

    // Get answers from the background script
    const questionData = questions.map((q) => ({
      text: q.text,
      type: q.type,
      subType: q.subType,
      options: q.options,
      required: q.required,
    }));

    const answers = await chrome.runtime.sendMessage({
      action: "generateAnswers",
      questions: questionData,
    });

    if (answers.error) {
      throw new Error(answers.error);
    }

    console.log("Received answers from AI:", answers);

    // Fill in the answers with delays between each to allow form to update
    let filledCount = 0;
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      const answer = answers[index];

      if (answer && answer !== "N/A") {
        const filled = await fillQuestionWithDelay(question, answer);
        if (filled) {
          filledCount++;

          // Highlight filled field
          if (config.highlightEnabled) {
            highlightElement(question.element);
          }
        }
      }

      // Small delay between filling questions
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Hide loading indicator
    hideLoadingIndicator();

    // Show success message
    showMessage(
      `Successfully filled ${filledCount} out of ${questions.length} fields!`,
      "success"
    );

    // Notify background script
    chrome.runtime.sendMessage({
      action: "fillComplete",
      stats: { total: questions.length, filled: filledCount },
    });
  } catch (error) {
    console.error("Error filling form:", error);
    hideLoadingIndicator();
    showMessage(`Error: ${error.message}`, "error");
    chrome.runtime.sendMessage({ action: "logError", error: error.message });
  } finally {
    isProcessing = false;
  }
}

// Fill a single question with an answer (with Promise support for delays)
async function fillQuestionWithDelay(question, answer) {
  return new Promise((resolve) => {
    try {
      const result = fillQuestion(question, answer);
      resolve(result);
    } catch (error) {
      console.error(`Error filling question "${question.text}":`, error);
      resolve(false);
    }
  });
}

// Fill a single question with an answer
function fillQuestion(question, answer) {
  try {
    switch (question.type) {
      case "text":
        question.inputElement.value = answer;
        question.inputElement.dispatchEvent(
          new Event("input", { bubbles: true })
        );
        question.inputElement.dispatchEvent(
          new Event("change", { bubbles: true })
        );
        question.inputElement.dispatchEvent(
          new Event("blur", { bubbles: true })
        );
        return true;

      case "radio":
        // Find matching option
        const radioIndex = question.options.findIndex(
          (opt) =>
            opt.toLowerCase().includes(answer.toLowerCase()) ||
            answer.toLowerCase().includes(opt.toLowerCase())
        );
        if (radioIndex >= 0 && question.inputElements[radioIndex]) {
          question.inputElements[radioIndex].click();
          return true;
        }
        break;

      case "checkbox":
        // Split answer by comma if multiple selections
        const selections = answer.split(",").map((s) => s.trim().toLowerCase());
        let anyChecked = false;
        question.options.forEach((opt, idx) => {
          const shouldCheck = selections.some(
            (sel) =>
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

      case "dropdown":
        if (question.inputElement.tagName === "SELECT") {
          const dropdownIndex = question.options.findIndex(
            (opt) =>
              opt.toLowerCase().includes(answer.toLowerCase()) ||
              answer.toLowerCase().includes(opt.toLowerCase())
          );
          if (dropdownIndex >= 0) {
            question.inputElement.selectedIndex = dropdownIndex + 1; // +1 for placeholder
            question.inputElement.dispatchEvent(
              new Event("change", { bubbles: true })
            );
            return true;
          }
        } else {
          // Custom dropdown - need to click on it
          question.inputElement.click();
          setTimeout(() => {
            const options = document.querySelectorAll('[role="option"]');
            const matchingOption = Array.from(options).find(
              (opt) =>
                opt.textContent.toLowerCase().includes(answer.toLowerCase()) ||
                answer.toLowerCase().includes(opt.textContent.toLowerCase())
            );
            if (matchingOption) {
              matchingOption.click();
            }
          }, 100);
          return true;
        }
        break;

      case "date":
        // Try to parse date from answer
        const dateMatch = answer.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          question.inputElement.value = dateMatch[0];
          question.inputElement.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          question.inputElement.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          return true;
        }
        break;
    }
  } catch (error) {
    console.error(`Error filling question "${question.text}":`, error);
  }

  return false;
}

// Highlight filled element
function highlightElement(element) {
  const originalBackground = element.style.background;
  element.style.background = "rgba(102, 126, 234, 0.1)";
  element.style.transition = "background 0.3s ease";

  // Remove highlight after 3 seconds
  setTimeout(() => {
    element.style.background = originalBackground;
  }, 3000);
}

// Show loading indicator
function showLoadingIndicator() {
  let indicator = document.getElementById("ai-form-filler-loading");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "ai-form-filler-loading";
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
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  indicator.style.display = "block";
}

// Hide loading indicator
function hideLoadingIndicator() {
  const indicator = document.getElementById("ai-form-filler-loading");
  if (indicator) {
    indicator.style.display = "none";
  }
}

// Show message to user
function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10002;
    padding: 15px 25px;
    background: ${
      type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3"
    };
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
    messageDiv.style.opacity = "0";
    messageDiv.style.transition = "opacity 0.3s";
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
