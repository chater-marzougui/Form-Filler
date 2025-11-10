# Installation Guide

## Prerequisites

- Chrome browser (version 88 or higher) or Edge (Chromium-based)
- Google Gemini API key (free tier available)

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (you'll need this later)

**Note:** The free tier includes:
- 60 requests per minute
- 1,500 requests per day
- Sufficient for personal use

## Installation Methods

### Method 1: From Source (Recommended for Developers)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chater-marzougui/Form-Filler.git
   cd Form-Filler
   ```

2. **Load Extension in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Toggle "Developer mode" ON (top-right corner)
   - Click "Load unpacked"
   - Select the `Form-Filler` directory
   - The extension icon should appear in your toolbar

3. **Configure the Extension**
   - Click the extension icon
   - Click "Settings" or the options page will open automatically
   - Paste your Gemini API key
   - Click "Test API Key" to verify
   - Fill in your profile information
   - Click "Save Settings"

### Method 2: Load from ZIP

1. **Download ZIP**
   - Download the latest release ZIP from GitHub
   - Extract the ZIP file to a permanent location (don't use Downloads folder as Chrome needs persistent access)

2. **Load Extension**
   - Follow steps 2-3 from Method 1

### Method 3: From Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store once published.

## Verification

### Verify Installation

1. Look for the extension icon (🤖) in your browser toolbar
2. Click the icon - popup should open
3. Navigate to a Google Form or Microsoft Form
4. The floating "🤖 Fill Form with AI" button should appear

### Test Functionality

1. **Create a Test Form**
   - Go to Google Forms: https://docs.google.com/forms/
   - Create a simple form with a few questions

2. **Test Auto-Fill**
   - Open your test form
   - Click the floating button or extension icon → "Fill Current Form"
   - Watch the form fill automatically!

## Configuration

### Essential Configuration

The extension requires:
1. ✅ Gemini API Key
2. ✅ Basic profile info (name, email)

### Recommended Configuration

For best results, also provide:
- Phone number
- Address information
- Company and job title
- Custom fields for specialized forms

### Advanced Configuration

#### Custom Fields Format

```json
{
  "education": "Bachelor's Degree in Computer Science",
  "experience_years": "5",
  "skills": "JavaScript, Python, React",
  "linkedin": "https://linkedin.com/in/yourprofile"
}
```

## Troubleshooting Installation

### Extension Won't Load

**Problem:** "Manifest file is missing or unreadable"
- **Solution:** Ensure you selected the correct directory containing `manifest.json`

**Problem:** "Extensions cannot be loaded from..."
- **Solution:** Move the extension folder to a different location (not in system protected directories)

### Extension Loads but Doesn't Work

**Problem:** Icon appears but popup doesn't open
- **Solution:** 
  1. Reload the extension (toggle off and on in extensions page)
  2. Check browser console for errors (F12 → Console)

**Problem:** "Service worker registration failed"
- **Solution:**
  1. Clear browser cache
  2. Restart browser
  3. Reload extension

### API Key Issues

**Problem:** "API key not configured"
- **Solution:** Enter your API key in the options page

**Problem:** "Invalid API key"
- **Solution:**
  1. Verify you copied the complete key (no spaces)
  2. Create a new API key if the old one expired
  3. Check API quota limits

**Problem:** API calls failing
- **Solution:**
  1. Check internet connection
  2. Verify API key hasn't been restricted
  3. Check you haven't exceeded daily quota

### Form Detection Issues

**Problem:** Floating button doesn't appear
- **Solution:**
  1. Refresh the form page
  2. Verify you're on a supported form (Google or Microsoft Forms)
  3. Check console for errors

**Problem:** "Not on a form page" message
- **Solution:** 
  1. Verify URL is `docs.google.com/forms/*` or `forms.office.com/*`
  2. Try a different form

## Post-Installation

### Set Your Preferences

1. **Auto-fill on Load**
   - Toggle ON for automatic filling
   - Toggle OFF for manual control

2. **Highlight Filled Fields**
   - Toggle ON to see which fields were filled
   - Toggle OFF for no visual feedback

### Pin the Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Form Filler AI"
3. Click the pin icon to keep it visible

### Keyboard Shortcut (Optional)

1. Go to `chrome://extensions/shortcuts`
2. Find "Form Filler AI"
3. Set a custom keyboard shortcut

## Updating the Extension

### From Source

```bash
cd Form-Filler
git pull origin main
```

Then reload the extension:
1. Go to `chrome://extensions/`
2. Click the reload icon on the extension card

### From ZIP

1. Download the new version
2. Extract to the same location
3. Reload the extension in Chrome

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Form Filler AI"
3. Click "Remove"
4. Confirm removal

**Note:** This will delete all stored data (API key, profile, preferences)

## Data Backup

### Export Your Profile

1. Open Options page
2. Copy your profile information
3. Save to a file for backup

### Backup via Browser

Your data is stored in Chrome's local storage:
- API key
- User profile
- Preferences

Chrome sync does NOT sync extension data by default.

## Multi-Device Setup

To use on multiple devices:

1. Install extension on each device
2. Configure API key (same key works on all devices)
3. Copy profile information to each device

Or:

1. Export profile as JSON
2. Import on other devices using custom fields

## Security Recommendations

1. **Protect Your API Key**
   - Don't share screenshots showing your API key
   - Regenerate key if compromised

2. **Review Auto-Fill Results**
   - Always review filled forms before submitting
   - AI may not be 100% accurate for all questions

3. **Keep Extension Updated**
   - Check for updates regularly
   - Update when security patches are released

## Support

If you encounter issues:

1. Check [TESTING.md](TESTING.md) for troubleshooting steps
2. Check [GitHub Issues](https://github.com/chater-marzougui/Form-Filler/issues)
3. Open a new issue with details

## Next Steps

After installation:

1. ✅ Configure API key and profile
2. ✅ Test on a simple form
3. ✅ Adjust settings to your preference
4. ✅ Try on real forms
5. ✅ Provide feedback!

Enjoy auto-filling forms with AI! 🤖✨
