// Google Forms Content Script

let config = null;
let isProcessing = false;

// Initialize
async function init() {
  // Get configuration from background script
  config = await chrome.runtime.sendMessage({ action: "getConfig" });

  if (config.error) {
    console.error("Form Filler AI Error:", config.error);
    // You might want to disable the button if config fails
    return;
  }

  console.log("Form Filler AI initialized for Google Forms");

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

function extractQuestions() {
  const questions = [];

  // Check if we're in edit mode or response mode
  const isEditMode = document.querySelector('.hj99tb[contenteditable="true"]');

  if (isEditMode) {
    // Use existing edit mode logic
    return extractQuestionsEditMode();
  }

  // RESPONSE/FILL MODE - New logic
  // Look for question containers with role="listitem"
  const questionElements = document.querySelectorAll(
    '.Qr7Oae[role="listitem"]'
  );

  for (const [index, element] of questionElements.entries()) {
    const question = {
      index,
      element,
      text: "",
      type: "text",
      options: [],
      required: false,
      inputElement: null,
      inputElements: [],
    };

    // Extract question text from .M7eMe span
    const questionTextElement = element.querySelector(".M7eMe");
    if (questionTextElement) {
      // Get text and clean up <br> tags
      question.text = questionTextElement.textContent
        .replaceAll("\n", " ")
        .replaceAll(/\s+/g, " ")
        .trim();
    }

    // Check if required - look for asterisk indicator
    const requiredElement = element.querySelector(".vnumgf");
    question.required = !!requiredElement;

    // Find input elements to determine type
    const textInput = element.querySelector('input[type="text"]');
    const textArea = element.querySelector("textarea");
    const radioInputs = element.querySelectorAll('input[type="radio"]');
    const checkboxInputs = element.querySelectorAll('input[type="checkbox"]');
    const selectDropdown = element.querySelector("select");
    const dateInput = element.querySelector('input[type="date"]');
    const timeInput = element.querySelector('input[type="time"]');

    // Determine question type based on inputs found
    if (textArea) {
      question.type = "textarea";
      question.inputElement = textArea;
    } else if (textInput) {
      // Check if it's a date or time input by aria-label or other attributes
      const ariaLabel = textInput.getAttribute("aria-label") || "";
      if (ariaLabel.toLowerCase().includes("date")) {
        question.type = "date";
      } else if (ariaLabel.toLowerCase().includes("time")) {
        question.type = "time";
      } else {
        question.type = "text";
      }
      question.inputElement = textInput;
    } else if (radioInputs.length > 0) {
      question.type = "radio";
      question.inputElements = Array.from(radioInputs);
      // Extract options from labels
      const labels = element.querySelectorAll("label");
      question.options = Array.from(labels)
        .map((label) => label.textContent.trim())
        .filter(Boolean);
    } else if (checkboxInputs.length > 0) {
      question.type = "checkbox";
      question.inputElements = Array.from(checkboxInputs);
      const labels = element.querySelectorAll("label");
      question.options = Array.from(labels)
        .map((label) => label.textContent.trim())
        .filter(Boolean);
    } else if (selectDropdown) {
      question.type = "dropdown";
      question.inputElement = selectDropdown;
      const options = selectDropdown.querySelectorAll("option");
      question.options = Array.from(options)
        .map((opt) => opt.textContent.trim())
        .filter((text) => text && text !== ""); // Remove empty options
    } else if (dateInput) {
      question.type = "date";
      question.inputElement = dateInput;
    } else if (timeInput) {
      question.type = "time";
      question.inputElement = timeInput;
    }

    // Only add questions that have text
    if (question.text && question.text.length > 0) {
      questions.push(question);
      console.log(
        `Detected question ${index + 1}: "${question.text}" (${question.type})`
      );
    }
  }

  return questions;
}

// Extract questions from Google Form
function extractQuestionsEditMode() {
  const questions = [];

  // Google Forms edit view: questions are in div elements with specific structure
  // Look for question containers with the specific class pattern
  const questionElements = document.querySelectorAll("[data-item-id]");

  for (const [index, element] of questionElements.entries()) {
    const question = {
      index,
      element,
      text: "",
      type: "text",
      options: [],
      required: false,
    };

    // Extract question text - look in the editable contenteditable div
    const questionTextElement = element.querySelector(
      '.hj99tb[contenteditable="true"]'
    );
    if (questionTextElement) {
      question.text = questionTextElement.textContent.trim();
    }

    // Check if required - look for asterisk span
    const requiredElement = element.querySelector(".CB23me");
    question.required = !!requiredElement;

    // Check for grid question type (data-value="7" or "-1")
    const gridRadio = element.querySelector('[data-value="7"].KKjvXb');
    const gridCheckbox = element.querySelector('[data-value="-1"].KKjvXb');

    if (gridRadio || gridCheckbox) {
      // This is a grid question - multiple choice grid or checkbox grid
      question.type = gridRadio ? "grid-radio" : "grid-checkbox";

      // Extract rows
      const rowInputs = element.querySelectorAll(
        '.Eym3Me[jsname="i036gb"] input[type="text"]'
      );
      question.rows = Array.from(rowInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);

      // Extract columns
      const colInputs = element.querySelectorAll(
        '.Eym3Me[jsname="R34Bl"] input[type="text"]'
      );
      question.columns = Array.from(colInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);

      question.options = question.columns; // For compatibility
    }
    // Check for radio buttons (Multiple choice) - data-value="2"
    else if (element.querySelector('[data-value="2"].KKjvXb')) {
      question.type = "radio";
      // Extract options from input fields
      const optionInputs = element.querySelectorAll(
        '.s1H0X input[type="text"]'
      );
      question.options = Array.from(optionInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);
    }
    // Check for checkboxes - data-value="4"
    else if (element.querySelector('[data-value="4"].KKjvXb')) {
      question.type = "checkbox";
      const optionInputs = element.querySelectorAll(
        '.s1H0X input[type="text"]'
      );
      question.options = Array.from(optionInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);
    }
    // Check for dropdown - data-value="3"
    else if (element.querySelector('[data-value="3"].KKjvXb')) {
      question.type = "dropdown";
      const optionInputs = element.querySelectorAll(
        '.s1H0X input[type="text"]'
      );
      question.options = Array.from(optionInputs)
        .map((input) => input.value.trim())
        .filter(Boolean);
    }
    // Check for date - data-value="9"
    else if (element.querySelector('[data-value="9"].KKjvXb')) {
      question.type = "date";
    }
    // Check for time - data-value="10"
    else if (element.querySelector('[data-value="10"].KKjvXb')) {
      question.type = "time";
    }
    // Check for linear scale - data-value="5"
    else if (element.querySelector('[data-value="5"].KKjvXb')) {
      question.type = "linear-scale";
      // Could extract min/max values here if needed
    }
    // Default to text for short answer (data-value="0") or paragraph (data-value="1")
    else {
      question.type = "text";
    }

    // Only add questions that have text
    if (question.text) {
      questions.push(question);
      console.log(
        `Detected question ${index + 1}: "${question.text}" (${question.type})`
      );
    }
  }

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
    // Extract questions
    const questions = extractQuestions();

    if (questions.length === 0) {
      throw new Error("No questions found in the form");
    }

    console.log(`Found ${questions.length} questions`);

    // Show loading indicator (non-blocking)
    showLoadingIndicator();

    // Get answers from the background script
    const questionData = questions.map((q) => ({
      text: q.text,
      type: q.type,
      options: q.options,
      required: q.required,
    }));

    // Request answers asynchronously without blocking UI
    const answers = await chrome.runtime.sendMessage({
      action: "generateAnswers",
      questions: questionData,
    });

    if (answers.error) {
      throw new Error(answers.error);
    }

    console.log("Received answers from AI:", answers);

    // Hide loading indicator
    hideLoadingIndicator();

    // Fill in the answers
    let filledCount = 0;
    const collectedQA = [];

    for (const [index, question] of questions.entries()) {
      const answer = answers[index];
      if (answer && answer !== "N/A") {
        const filled = fillQuestionGoogle(question, answer);
        if (filled) {
          filledCount++;

          // Collect question-answer pair if enabled
          if (config.collectDataEnabled) {
            collectedQA.push({
              question: question.text,
              answer: answer,
              type: question.type,
              timestamp: new Date().toISOString(),
            });
          }

          // Highlight filled field
          if (config.highlightEnabled) {
            highlightElement(question.element);
          }
        }
      }
    }

    // Save collected answers if any
    if (collectedQA.length > 0) {
      chrome.runtime.sendMessage({
        action: "saveAnswers",
        answers: collectedQA,
      });
    }

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

// Fill a single question with an answer
function fillQuestionGoogle(question, answer) {
  try {
    switch (question.type) {
      case "text":
      case "time":
        question.inputElement.value = answer;
        question.inputElement.dispatchEvent(
          new Event("input", { bubbles: true })
        );
        question.inputElement.dispatchEvent(
          new Event("change", { bubbles: true })
        );
        return true;

      case "radio": {
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
      }

      case "checkbox": {
        // Split answer by comma if multiple selections
        const selections = answer.split(",").map((s) => s.trim().toLowerCase());
        let anyChecked = false;
        for (const [idx, opt] of question.options.entries()) {
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
        }

        return anyChecked;
      }

      case "dropdown": {
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
        break;
      }

      case "date": {
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
    }
  } catch (error) {
    console.error(`Error filling question "${question.text}":`, error);
  }

  return false;
}

// Highlight filled element
function highlightElement(element) {
  element.classList.add("ai-filled");

  // Remove highlight after 5 seconds
  setTimeout(() => {
    element.classList.remove("ai-filled");
  }, 5000);
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
        top: 20px;
        right: 20px;
        background: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 320px;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        "></div>
        <div style="font-size: 14px; font-weight: 500; color: #333;">
          AI is analyzing the form...<br>
          <small style="color: #666; font-weight: normal;">You can continue browsing</small>
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
  indicator.style.display = "flex";
}

// Hide loading indicator
function hideLoadingIndicator() {
  const indicator = document.getElementById("ai-form-filler-loading");
  if (indicator) {
    indicator.style.display = "none";
  }
}

function getBgColor(type) {
  switch (type) {
    case "success":
      return "#4caf50";
    case "error":
      return "#f44336";
    default:
      return "#2196f3";
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
    background: ${getBgColor(type)};
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
  await init();
}
