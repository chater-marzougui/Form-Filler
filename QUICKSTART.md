# Quick Start Guide

Get up and running with Form Filler AI in 5 minutes! ⚡

## Step 1: Get Gemini API Key (2 minutes)

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

**Free Tier:** 60 requests/minute, 1,500/day

## Step 2: Install Extension (1 minute)

### Chrome/Edge:
```bash
# Clone repository
git clone https://github.com/chater-marzougui/Form-Filler.git

# Or download and extract ZIP
```

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select the `Form-Filler` folder
5. Done! 🎉

## Step 3: Configure (2 minutes)

1. **Click extension icon** (🤖) in toolbar
2. **Click "Settings"**
3. **Paste your API key**
4. **Fill in your info:**
   - Name
   - Email
   - Phone (optional)
   - Address (optional)

5. **Click "Save Settings"**

## Step 4: Try It! (30 seconds)

### Test on Google Forms:

1. Open: https://docs.google.com/forms/
2. Create a simple test form with a few questions
3. Open your form
4. Click the **"🤖 Fill Form with AI"** button (bottom-right)
5. Watch the magic! ✨

### Or use the popup:

1. Navigate to any form
2. Click extension icon
3. Click "Fill Current Form"

## That's It! 🎊

Your forms will now fill automatically with AI-powered answers!

## Tips

### For Best Results:

✅ Fill in your complete profile  
✅ Add custom fields for specialized forms  
✅ Review answers before submitting  

### Supported Forms:

- ✅ Google Forms
- ✅ Microsoft Forms

### Supported Field Types:

- ✅ Text inputs
- ✅ Email/Phone
- ✅ Radio buttons
- ✅ Checkboxes
- ✅ Dropdowns
- ✅ Dates

## Troubleshooting

### Not Working?

1. **Check API Key:** Options → Test API Key
2. **Check Profile:** Make sure you filled basic info
3. **Refresh Page:** Try reloading the form
4. **Check Console:** F12 → Console for errors

### Need Help?

- 📖 [Full Documentation](docs/)
- 🐛 [Report Issues](https://github.com/chater-marzougui/Form-Filler/issues)
- 💬 [Discussions](https://github.com/chater-marzougui/Form-Filler/discussions)

## Advanced Usage

### Custom Fields

Add specialized info for job applications, surveys, etc:

```json
{
  "education": "Bachelor's in CS",
  "experience": "5 years",
  "skills": "Python, JavaScript, React",
  "linkedin": "https://linkedin.com/in/yourname"
}
```

### Auto-Fill on Load

Enable in Settings → Auto-fill on page load

⚠️ **Warning:** Always review before submitting!

### Keyboard Shortcut

1. Go to `chrome://extensions/shortcuts`
2. Find "Form Filler AI"
3. Set your preferred shortcut

## Examples

### Job Application Form

Profile setup:
- Name, Email, Phone
- Education, Job Title, Company
- Custom fields: skills, experience, certifications

### Event Registration

Profile setup:
- Name, Email, Phone
- Custom fields: dietary restrictions, t-shirt size

### Survey

Profile setup:
- Basic demographics
- Custom fields: interests, preferences

## What's Next?

- ⚙️ Explore [Settings](docs/USAGE.md) options
- 📚 Read [Full Documentation](docs/)
- 🤝 [Contribute](CONTRIBUTING.md)
- ⭐ Star the repo if you like it!

---

**Enjoy auto-filling forms with AI!** 🤖✨

Made with ❤️ by Chater Marzougui
