# Usage Guide

## Getting Started

### 1. Install the Extension

Follow the installation instructions in the main [README.md](../README.md).

### 2. Configure Your Profile

The extension works best when you provide complete profile information. Here's what each field is used for:

#### Basic Information
- **Name**: Used for name fields, registration forms
- **Email**: Used for email fields, contact forms
- **Phone**: Used for phone number fields
- **Date of Birth**: Used for age verification, birthday fields

#### Address Information
- **Address**: Street address for forms requiring location
- **City**: City name for location-based forms
- **State/Province**: State or province for regional forms
- **ZIP/Postal Code**: Postal code for shipping/billing forms
- **Country**: Country name for international forms

#### Professional Information
- **Company**: Company name for business forms
- **Job Title**: Job position for professional surveys
- **Website**: Personal or company website URL

#### Custom Fields
You can add custom fields as JSON to handle specialized form questions:

```json
{
  "education": "Bachelor's Degree in Computer Science",
  "interests": "Technology, Music, Photography",
  "linkedin": "https://linkedin.com/in/yourprofile",
  "github": "https://github.com/yourusername",
  "experience_years": "5",
  "preferred_language": "English"
}
```

## How It Works

### Form Detection

The extension automatically detects when you're on:
- Google Forms (docs.google.com/forms)
- Microsoft Forms (forms.office.com or forms.microsoft.com)

### AI Processing

When you trigger the form fill:

1. **Extraction**: The extension scans the page and extracts all form questions
2. **Analysis**: Questions are sent to Gemini 2.5 Flash along with your profile and previously learned answers
3. **Matching**: AI intelligently matches your profile data to each question
4. **Filling**: Answers are automatically filled into the appropriate fields
5. **Learning** (optional): If enabled, question-answer pairs are saved locally for future reference
6. **Feedback**: Filled fields are highlighted with visual indicators

**Note**: The AI processing happens in the background, so you can continue browsing or interacting with the page while waiting.

### Field Type Handling

| Field Type | How It's Filled |
|------------|----------------|
| Text Input | Direct text entry from profile or AI-generated |
| Email | Uses your email from profile |
| Phone | Uses your phone from profile |
| Radio Button | AI selects the most appropriate option |
| Checkbox | AI selects one or more relevant options |
| Dropdown | AI picks from available options |
| Date | Uses date from profile or generates appropriate date |

## Tips for Best Results

### 1. Complete Your Profile
The more information you provide, the better the AI can fill forms accurately.

### 2. Use Custom Fields
For specialized forms (job applications, academic surveys), add relevant custom fields.

### 3. Review Before Submitting
Always review the filled form before submitting. The AI is smart but may not be perfect for every field.

### 4. Update Your Profile
Keep your profile information current for best results.

### 5. Test Your API Key
Use the "Test API Key" button in settings to verify your Gemini API is working.

### 6. Enable Learning Mode (Optional)
Turn on "Learn from my answers" in Settings to collect question-answer pairs from filled forms. This helps the AI make better predictions over time by learning from your actual responses. All data is stored locally in your browser.

## Common Use Cases

### Job Applications
```json
{
  "education": "Bachelor of Science in Computer Engineering",
  "graduation_year": "2020",
  "gpa": "3.8",
  "skills": "JavaScript, Python, React, Node.js",
  "certifications": "AWS Certified Developer",
  "availability": "Immediate",
  "willing_to_relocate": "Yes"
}
```

### Event Registration
```json
{
  "organization": "Tech Community Group",
  "how_did_you_hear": "Social Media",
  "dietary_restrictions": "Vegetarian",
  "t_shirt_size": "Medium",
  "emergency_contact": "Jane Doe - +1 234 567 8901"
}
```

### Academic Surveys
```json
{
  "institution": "University of Technology",
  "major": "Computer Science",
  "year": "Senior",
  "research_interests": "Machine Learning, AI",
  "previous_experience": "2 internships"
}
```

## Privacy Considerations

- Your profile data is stored locally in your browser
- Collected question-answer pairs (if learning mode is enabled) are stored locally
- Data is only sent to Gemini API when filling forms
- No data is stored on external servers
- You can clear your profile data and collected answers at any time from Settings
- Learning mode is opt-in and disabled by default

## Troubleshooting

### Form Not Filling
1. Check that you're on a supported form (Google Forms or Microsoft Forms)
2. Verify your API key is configured and valid
3. Ensure your profile has relevant information
4. Try refreshing the page and clicking fill again

### Incorrect Answers
1. Review your profile - make sure information is accurate
2. Add custom fields for specialized questions
3. The AI may need more context - consider being more specific in your profile

### API Errors
1. Check your internet connection
2. Verify your API key hasn't expired
3. Check Gemini API status (service may be temporarily down)
4. Try testing the API key in settings

## Limitations

- Only works on Google Forms and Microsoft Forms
- Requires active internet connection for AI processing
- API key required (free tier available from Google)
- May not handle extremely complex or custom form structures
- Always review filled forms before submitting
