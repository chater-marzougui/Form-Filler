# Contributing to Form Filler AI

Thank you for your interest in contributing to Form Filler AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser version and OS
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear use case
- Explain how it would benefit users
- Consider implementation complexity

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

#### Development Setup

```bash
# Clone the repository
git clone https://github.com/chater-marzougui/Form-Filler.git
cd Form-Filler

# Load the extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the Form-Filler directory
```

#### Coding Standards

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code style
- Keep functions focused and single-purpose
- Use modern JavaScript (ES6+)
- Avoid global variables

#### File Organization

```
Form-Filler/
├── background.js           # Service worker
├── lib/                    # Shared libraries
│   └── gemini.js          # Gemini API module
├── content-scripts/        # Form-specific scripts
├── popup/                  # Extension popup
├── options/                # Settings page
├── styles/                 # CSS files
├── icons/                  # Extension icons
└── docs/                   # Documentation
```

#### Testing Your Changes

Before submitting a PR:

1. **Manual Testing**

   - Test on Google Forms
   - Test on Microsoft Forms
   - Try different field types
   - Test error scenarios
   - Verify UI/UX changes

2. **Browser Testing**

   - Test in Chrome
   - Test in Edge (Chromium)
   - Verify in different screen sizes

3. **Security**
   - No hardcoded credentials
   - No eval() or unsafe code
   - Validate user inputs
   - Follow CSP guidelines

#### Pull Request Process

1. Update documentation if needed
2. Add/update comments in code
3. Follow commit message conventions
4. Reference related issues
5. Describe changes clearly in PR

#### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat: Add support for linear scale questions

Implement extraction and filling for linear scale (1-10)
questions in Google Forms.

Closes #42
```

```
fix: Prevent duplicate form fills

Add isProcessing flag to prevent multiple simultaneous
fill operations that could conflict.

Fixes #38
```

### Areas for Contribution

#### High Priority

- Additional form platform support (Typeform, JotForm, etc.)
- Improved field detection accuracy
- Better error handling and user feedback
- Performance optimizations
- Accessibility improvements

#### Medium Priority

- Internationalization (i18n)
- Keyboard shortcuts
- Form templates
- Answer history
- Dark mode

#### Low Priority

- Custom themes
- Statistics/analytics
- Export/import profiles
- Advanced settings

## Development Guidelines

### Adding New Form Platform Support

To add support for a new form platform:

1. Create a new content script in `content-scripts/`
2. Implement form detection logic
3. Implement field extraction
4. Implement field filling logic
5. Update manifest.json with new matches
6. Add documentation

Example structure:

```javascript
// content-scripts/platform-name.js

// Initialize
async function init() {
  config = await getConfig();
  addFillButton();
}

// Extract questions
function extractQuestions() {
  // Platform-specific selectors
  return questions;
}

// Fill form
async function fillForm() {
  // Use shared Gemini API
  // Fill extracted questions
}

// Initialize
init();
```

### Improving AI Accuracy

To improve answer generation:

1. Enhance the prompt in `lib/gemini.js`
2. Add more context to questions
3. Improve answer parsing logic
4. Add validation before filling

### UI/UX Improvements

- Follow Material Design principles
- Ensure accessibility (ARIA labels, keyboard nav)
- Test on different screen sizes
- Provide clear feedback to users
- Use consistent styling

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

## Questions?

If you have questions:

- Check existing documentation
- Search closed issues
- Open a new issue with your question
- Tag it as "question"

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in:

- README.md (Contributors section)
- Release notes
- Project documentation

Thank you for contributing! 🎉
