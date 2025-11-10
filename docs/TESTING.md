# Testing Guide

## Manual Testing

### Extension Installation Test

1. **Load Extension**
   - Open Chrome/Edge browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the Form-Filler directory
   - Verify extension appears with icon

2. **Initial Setup Test**
   - Extension should open options page on first install
   - Verify all form fields are present
   - Check that default values are set

### Configuration Testing

#### API Key Configuration

1. **Navigate to Options**
   - Click extension icon → Settings
   - Or right-click icon → Options

2. **Enter Invalid API Key**
   - Enter random text
   - Click "Test API Key"
   - Should show error message

3. **Enter Valid API Key**
   - Get key from https://aistudio.google.com/app/apikey
   - Enter valid key
   - Click "Test API Key"
   - Should show success message

4. **Save Configuration**
   - Fill in user profile fields
   - Click "Save Settings"
   - Should show success message
   - Refresh page - data should persist

#### Profile Testing

Test each field type:
- Text inputs (name, email, phone, address, etc.)
- Date input (date of birth)
- URL input (website)
- Textarea (custom fields JSON)

Test custom fields JSON:
```json
{
  "test_field": "test value",
  "number_field": 123
}
```

Should accept valid JSON and reject invalid JSON.

### Google Forms Testing

#### Create Test Form

Create a Google Form with:
1. Short answer (text)
2. Paragraph (long text)
3. Multiple choice (radio)
4. Checkboxes
5. Dropdown
6. Date
7. Email address
8. Phone number

#### Test Auto-Fill

1. **Manual Trigger**
   - Open the test form
   - Click floating "🤖 Fill Form with AI" button
   - Verify loading indicator appears
   - Wait for completion
   - Check filled fields are highlighted
   - Verify answers are appropriate

2. **Popup Trigger**
   - Open test form
   - Click extension icon
   - Click "Fill Current Form"
   - Verify form fills

3. **Verify Field Types**
   - Text fields: Check text is filled
   - Email: Check email from profile is used
   - Phone: Check phone from profile is used
   - Radio: Check one option is selected
   - Checkboxes: Check appropriate options are checked
   - Dropdown: Check appropriate option is selected
   - Date: Check date is in correct format

### Microsoft Forms Testing

Same tests as Google Forms but on Microsoft Forms platform.

#### Create Test Form

1. Go to forms.office.com or forms.microsoft.com
2. Create form with various field types
3. Test auto-fill functionality

### Error Handling Testing

#### No API Key

1. Clear API key in settings
2. Try to fill form
3. Should show error message

#### No Internet Connection

1. Disconnect from internet
2. Try to fill form
3. Should show appropriate error

#### Invalid Form Page

1. Navigate to non-form page (e.g., google.com)
2. Open extension popup
3. Should show "Not on a form page" message

#### Empty Profile

1. Clear all profile fields
2. Try to fill form
3. Should still attempt to fill with AI reasoning

### UI/UX Testing

#### Popup

- [ ] Opens correctly when clicking icon
- [ ] Shows correct status indicators
- [ ] Buttons work as expected
- [ ] Toggles persist settings
- [ ] Error messages display properly

#### Options Page

- [ ] All fields editable
- [ ] Save button works
- [ ] Reset button works (with confirmation)
- [ ] Test API key button works
- [ ] Status messages display correctly

#### Content Script UI

- [ ] Floating button appears on forms
- [ ] Button is properly positioned
- [ ] Hover effects work
- [ ] Loading indicator appears during processing
- [ ] Success message shows after completion
- [ ] Highlight animation works on filled fields

### Performance Testing

1. **Large Form**
   - Create form with 50+ questions
   - Time how long it takes to fill
   - Should complete within reasonable time (< 30 seconds)

2. **Multiple Forms**
   - Open multiple form tabs
   - Fill each one separately
   - Verify no conflicts

3. **Memory Usage**
   - Check Chrome task manager
   - Verify reasonable memory usage
   - No memory leaks after multiple uses

### Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Chrome (previous version)
- [ ] Edge Chromium (latest)
- [ ] Brave (latest)

### Security Testing

1. **Storage**
   - Check chrome://extensions/ → Extension details → Storage
   - Verify data is stored correctly
   - Verify no sensitive data in plain text in logs

2. **Permissions**
   - Verify only requested permissions are used
   - Check no unnecessary permissions

3. **API Communication**
   - Check Network tab in DevTools
   - Verify API calls are HTTPS only
   - Verify API key is not exposed in logs

### Accessibility Testing

1. **Keyboard Navigation**
   - Tab through popup
   - Tab through options page
   - Verify all elements are keyboard accessible

2. **Screen Reader**
   - Test with screen reader (if available)
   - Verify appropriate ARIA labels

## Automated Testing

### Structure Validation

```bash
# Validate manifest.json
python3 -m json.tool manifest.json

# Check file structure
ls -la background.js
ls -la lib/gemini.js
ls -la content-scripts/
ls -la popup/
ls -la options/
ls -la styles/
ls -la icons/
```

### Code Quality

```bash
# Check for syntax errors (if Node.js available)
node --check background.js
node --check lib/gemini.js
node --check content-scripts/google-forms.js
node --check content-scripts/microsoft-forms.js
node --check popup/popup.js
node --check options/options.js
```

### Security Scan

```bash
# Run CodeQL (if available)
codeql database create --language=javascript
codeql analyze
```

## Test Checklist

### Pre-Release Checklist

- [ ] All manual tests pass
- [ ] Security scan shows no issues
- [ ] No console errors in background script
- [ ] No console errors in content scripts
- [ ] No console errors in popup
- [ ] No console errors in options page
- [ ] Extension loads without errors
- [ ] All permissions are used and necessary
- [ ] Documentation is complete
- [ ] README is accurate
- [ ] Examples work as described

### Regression Testing

After any code changes:
1. Re-test core functionality
2. Re-run security scan
3. Verify no new errors in console
4. Test on both Google Forms and Microsoft Forms

## Bug Reporting

When filing bugs, include:
- Browser version
- OS version
- Extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## Test Data

### Sample Profile

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1 555-123-4567",
  "address": "123 Test St",
  "city": "Test City",
  "state": "TS",
  "zipCode": "12345",
  "country": "Test Country",
  "dateOfBirth": "1990-01-01",
  "company": "Test Corp",
  "jobTitle": "Test Engineer",
  "website": "https://test.example.com",
  "customFields": {
    "education": "Bachelor's Degree",
    "experience": "5 years"
  }
}
```

### Test Forms

Create test forms at:
- Google Forms: https://docs.google.com/forms/
- Microsoft Forms: https://forms.office.com/

## Known Issues

Document any known issues or limitations:
- Large forms (100+ questions) may take longer
- Custom/unusual form elements may not be detected
- Some Microsoft Forms custom dropdowns may require special handling

## Future Testing Improvements

- Automated browser testing (Playwright/Puppeteer)
- Unit tests for lib/gemini.js
- Integration tests for content scripts
- Performance benchmarking
- Continuous integration setup
