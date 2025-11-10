# 🤖 Form Filler AI

An intelligent Chrome extension that automatically fills Google Forms and Microsoft Forms using AI-powered analysis from Gemini 2.5 Flash.

> 💡 **New to Form Filler AI?** Check out the [Quick Start Guide](QUICKSTART.md) to get started in 5 minutes!

## ✨ Features

- 🎯 **Smart Form Detection**: Automatically detects and analyzes Google Forms and Microsoft Forms
- 🧠 **AI-Powered Filling**: Uses Google's Gemini 2.5 Flash to intelligently match user profile data to form questions
- 📝 **Multi-Input Support**: Handles text inputs, radio buttons, checkboxes, dropdowns, and date fields
- ✅ **Visual Feedback**: Highlights filled fields with smooth animations
- 💾 **Persistent Storage**: Stores user profile and preferences securely using chrome.storage
- 🎨 **Clean UI**: Beautiful popup and options page with modern design
- 🔒 **Security-First**: Respects browser permissions and security policies (no cross-origin hacks)
- 🏗️ **Modular Architecture**: Clean separation of concerns with service worker, content scripts, and API modules

## 📋 Supported Form Types

- ✅ Google Forms (docs.google.com/forms)
- ✅ Microsoft Forms (forms.office.com, forms.microsoft.com)

## 🚀 Installation

For detailed installation instructions, see [INSTALLATION.md](docs/INSTALLATION.md).

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/chater-marzougui/Form-Filler.git
   cd Form-Filler
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top-right corner)

4. Click "Load unpacked" and select the `Form-Filler` directory

5. The extension icon should appear in your browser toolbar

## ⚙️ Configuration

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure the Extension

1. Click the extension icon in your toolbar
2. Click "Settings" or right-click the extension icon → "Options"
3. Enter your Gemini API key in the "API Configuration" section
4. Click "Test API Key" to verify it works
5. Fill in your user profile information (name, email, phone, etc.)
6. Add any custom fields as JSON if needed
7. Configure preferences (auto-fill on load, highlight filled fields)
8. Click "Save Settings"

## 📖 Usage

### Method 1: Manual Trigger

1. Navigate to a Google Form or Microsoft Form
2. Click the extension icon in your toolbar
3. Click "Fill Current Form"
4. Watch as the AI fills in the form automatically!

### Method 2: Floating Button

1. Navigate to a Google Form or Microsoft Form
2. Look for the floating "🤖 Fill Form with AI" button (bottom-right)
3. Click the button to trigger auto-fill

### Method 3: Auto-fill on Load (Optional)

1. Enable "Auto-fill on page load" in Settings
2. Navigate to any supported form
3. The form will be filled automatically when the page loads

## 🏗️ Architecture

```
Form-Filler/
├── manifest.json              # Extension manifest (MV3)
├── background.js              # Service worker for extension lifecycle
├── lib/
│   └── gemini.js             # Gemini API integration module
├── content-scripts/
│   ├── google-forms.js       # Google Forms detection & filling
│   └── microsoft-forms.js    # Microsoft Forms detection & filling
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── options/
│   ├── options.html          # Options page UI
│   ├── options.css           # Options page styles
│   └── options.js            # Options page logic
├── styles/
│   └── highlight.css         # Visual feedback styles
└── icons/                    # Extension icons
```

## 🔧 Technical Details

### Permissions

- `storage`: Store user profile and preferences
- `activeTab`: Access current tab for form filling
- `scripting`: Inject content scripts dynamically

### Host Permissions

- `https://docs.google.com/forms/*`: Google Forms
- `https://forms.office.com/*`: Microsoft Forms
- `https://forms.microsoft.com/*`: Microsoft Forms (alternate domain)
- `https://generativelanguage.googleapis.com/*`: Gemini API

### Form Field Types Supported

- Text inputs (text, email, tel, textarea)
- Radio buttons (single choice)
- Checkboxes (multiple choice)
- Dropdowns (select elements)
- Date inputs
- Time inputs

## 🔐 Privacy & Security

- ✅ All data is stored locally in chrome.storage
- ✅ API key is stored securely and never shared
- ✅ No data is sent to third parties except Gemini API for form analysis
- ✅ No tracking or analytics
- ✅ Open source - you can review all the code

## 🐛 Troubleshooting

### "API key not configured" error
- Make sure you've entered your Gemini API key in Settings
- Verify the API key is valid using the "Test API Key" button

### "No questions found in the form" error
- The form structure may not be supported yet
- Try refreshing the page and clicking the fill button again

### Form fields not filling correctly
- Make sure your user profile is complete in Settings
- The AI tries to match profile data to questions intelligently
- Some fields may require manual adjustment

### Extension not loading
- Make sure you have Chrome/Chromium version 88+
- Check that "Developer mode" is enabled in chrome://extensions/
- Try removing and re-adding the extension

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed installation instructions
- **[Usage Guide](docs/USAGE.md)** - How to use the extension effectively
- **[API Documentation](docs/API.md)** - Technical API and architecture details
- **[Testing Guide](docs/TESTING.md)** - Manual and automated testing procedures
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Chater Marzougui**

## 🙏 Acknowledgments

- Powered by [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)
- Built with Chrome Extension Manifest V3

## 📝 Changelog

### v1.0.0 (2025)
- Initial release
- Support for Google Forms and Microsoft Forms
- AI-powered form filling with Gemini 2.5 Flash
- User profile management
- Visual feedback with field highlighting
- Popup and options page UI