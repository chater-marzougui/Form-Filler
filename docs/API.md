# API Documentation

## Overview

This document describes the internal APIs and architecture of the Form Filler AI extension.

## Architecture Components

### 1. Service Worker (background.js)

The background service worker handles extension lifecycle events and message routing.

#### Events

##### `chrome.runtime.onInstalled`
Triggered when the extension is first installed or updated.

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    // Open options page
  }
});
```

##### `chrome.runtime.onMessage`
Handles messages from content scripts and popup.

**Supported Actions:**
- `getConfig`: Returns current configuration (API key, profile, settings)
- `logError`: Logs errors from content scripts
- `logInfo`: Logs info messages
- `fillComplete`: Receives completion statistics

### 2. Gemini API Module (lib/gemini.js)

Handles all communication with Google's Gemini API.

#### Class: `GeminiAPI`

##### Constructor
```javascript
new GeminiAPI(apiKey: string)
```

##### Methods

###### `generateAnswers(questions, userProfile)`
Generates answers for form questions using AI.

**Parameters:**
- `questions` (Array): Array of question objects
  ```javascript
  {
    text: string,      // Question text
    type: string,      // Field type (text, radio, checkbox, dropdown, date)
    options: Array,    // Available options (for radio/checkbox/dropdown)
    required: boolean  // Whether field is required
  }
  ```
- `userProfile` (Object): User profile data

**Returns:** `Promise<Object>`
- Map of question indices to answers
  ```javascript
  {
    0: "Answer for first question",
    1: "Answer for second question",
    ...
  }
  ```

**Throws:** Error if API key is missing or API request fails

###### `validateApiKey()`
Tests if the API key is valid.

**Returns:** `Promise<boolean>`

##### Private Methods

###### `buildPrompt(questions, userProfile)`
Constructs the prompt sent to Gemini.

###### `parseAnswers(responseText, questions)`
Parses Gemini's response and extracts answers.

### 3. Content Scripts

#### Google Forms (content-scripts/google-forms.js)

##### Functions

###### `init()`
Initializes the content script, loads configuration, and adds UI elements.

###### `extractQuestions()`
Scans the page and extracts all form questions.

**Returns:** Array of question objects
```javascript
[
  {
    index: number,
    element: HTMLElement,
    text: string,
    type: string,
    options: Array<string>,
    required: boolean,
    inputElement: HTMLElement,      // Single input
    inputElements: Array<HTMLElement> // Multiple inputs (radio/checkbox)
  }
]
```

###### `fillForm()`
Main function that orchestrates the form filling process.

**Process:**
1. Extract questions from page
2. Get answers from Gemini API
3. Fill each question with its answer
4. Highlight filled fields
5. Show completion message

###### `fillQuestion(question, answer)`
Fills a single question with the provided answer.

**Parameters:**
- `question`: Question object from extractQuestions()
- `answer`: Answer string from Gemini

**Returns:** `boolean` - True if successfully filled

###### `highlightElement(element)`
Adds visual highlight to a filled element.

#### Microsoft Forms (content-scripts/microsoft-forms.js)

Similar API to Google Forms content script, with form-specific selectors and logic.

### 4. Popup (popup/)

#### UI Elements
- Fill Form button
- Settings button
- Auto-fill toggle
- Highlight toggle
- Status indicator

#### Functions

##### `loadSettings()`
Loads current settings from chrome.storage.

##### `checkFormSupport()`
Determines if current tab is on a supported form.

##### `triggerFill()`
Sends message to content script to fill the form.

### 5. Options Page (options/)

#### UI Elements
- API key input with test button
- User profile form (name, email, phone, etc.)
- Custom fields JSON editor
- Preference toggles
- Save and reset buttons

#### Functions

##### `loadSettings()`
Loads and populates form with saved settings.

##### `testApiKey()`
Validates the entered API key.

##### `saveSettings()`
Saves all settings to chrome.storage.

##### `resetSettings()`
Resets all settings to defaults.

## Chrome Storage Schema

### Keys

#### `apiKey` (string)
Gemini API key for authentication.

#### `userProfile` (object)
```javascript
{
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  dateOfBirth: string,
  company: string,
  jobTitle: string,
  website: string,
  customFields: object
}
```

#### `autoFillEnabled` (boolean)
Whether to automatically fill forms on page load.

#### `highlightEnabled` (boolean)
Whether to highlight filled fields.

## Message Protocol

### Content Script → Background

#### Get Configuration
```javascript
chrome.runtime.sendMessage(
  { action: 'getConfig' },
  (response) => {
    // response contains: { apiKey, userProfile, autoFillEnabled, highlightEnabled }
  }
);
```

#### Log Error
```javascript
chrome.runtime.sendMessage({
  action: 'logError',
  error: 'Error message'
});
```

#### Fill Complete
```javascript
chrome.runtime.sendMessage({
  action: 'fillComplete',
  stats: { total: 10, filled: 8 }
});
```

### Background → Content Script

#### Trigger Fill
```javascript
chrome.tabs.sendMessage(tabId, {
  action: 'fillForm'
});
```

## CSS Classes

### `.ai-filled`
Applied to elements that have been filled by AI.

**Animation:** Highlights element with a brief flash and shows checkmark.

### `.ai-form-filler-btn`
The floating fill button injected into form pages.

### `.ai-form-filler-loading`
Loading indicator shown during AI processing.

## Field Type Detection

### Google Forms

| Field Type | Selector Pattern |
|------------|------------------|
| Text Input | `input[type="text"], textarea` |
| Email | `input[type="email"]` |
| Phone | `input[type="tel"]` |
| Radio | `input[type="radio"]` |
| Checkbox | `input[type="checkbox"]` |
| Dropdown | `select` |
| Date | `input[type="date"]` |
| Time | `input[type="time"]` |

### Microsoft Forms

| Field Type | Selector Pattern |
|------------|------------------|
| Text Input | `input[type="text"], textarea` |
| Email | `input[type="email"]` |
| Number | `input[type="number"]` |
| Radio | `input[type="radio"]` |
| Checkbox | `input[type="checkbox"]` |
| Dropdown | `select, [role="combobox"]` |
| Date | `input[type="date"]` |

## Error Handling

### API Errors
- Invalid API key: User notified to check settings
- Network errors: Retry suggestion with error message
- Rate limiting: User notified to wait and try again

### Form Errors
- No questions found: Error message with suggestion to refresh
- Fill failures: Log which fields failed, continue with others
- Invalid selectors: Graceful degradation, skip problematic fields

## Security Considerations

### API Key Storage
- Stored in chrome.storage.local (encrypted by Chrome)
- Never exposed in logs or error messages
- Only transmitted over HTTPS to Gemini API

### Content Security Policy
- No eval() or inline scripts
- All external requests to whitelisted domains
- No arbitrary code execution

### Permissions
- `storage`: Required for saving settings
- `activeTab`: Only accesses current tab when triggered
- `scripting`: Only for injecting content scripts
- Host permissions: Limited to specific form domains

## Performance Optimizations

### Caching
- Configuration cached in content script
- Reduces message passing overhead

### Lazy Loading
- Gemini API module loaded only when needed
- Content scripts only run on matching domains

### Batching
- All questions processed in single API call
- Reduces API requests and latency

## Testing Considerations

### Manual Testing Checklist
1. Install extension in Chrome
2. Configure API key and profile
3. Navigate to test form
4. Trigger auto-fill
5. Verify all field types filled correctly
6. Check visual feedback
7. Verify data in chrome.storage

### Test Forms
- Create test Google Forms with all field types
- Create test Microsoft Forms with all field types
- Test edge cases (required fields, long forms, nested questions)

## Future API Enhancements

Potential improvements for future versions:

1. **Batch API Support**: Process multiple forms simultaneously
2. **Cache Layer**: Cache common answers to reduce API calls
3. **Offline Mode**: Pre-generate answers for common questions
4. **Form Templates**: Save and reuse form configurations
5. **Answer History**: Track and suggest previous answers
6. **Validation**: Pre-validate answers before filling
7. **Custom Extractors**: Plugin system for new form types
8. **WebSocket Support**: Real-time form monitoring
