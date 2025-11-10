#!/bin/bash

# Form Filler AI - Installation Validator
# This script checks if all required files are present and valid

echo "🤖 Form Filler AI - Installation Validator"
echo "==========================================="
echo ""

errors=0
warnings=0

# Check manifest.json
echo "📋 Checking manifest.json..."
if [ -f "manifest.json" ]; then
    if python3 -m json.tool manifest.json > /dev/null 2>&1; then
        echo "   ✅ manifest.json is valid"
    else
        echo "   ❌ manifest.json has syntax errors"
        ((errors++))
    fi
else
    echo "   ❌ manifest.json not found"
    ((errors++))
fi

# Check required files
echo ""
echo "📁 Checking required files..."

required_files=(
    "background.js"
    "lib/gemini.js"
    "content-scripts/google-forms.js"
    "content-scripts/microsoft-forms.js"
    "popup/popup.html"
    "popup/popup.css"
    "popup/popup.js"
    "options/options.html"
    "options/options.css"
    "options/options.js"
    "styles/highlight.css"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file not found"
        ((errors++))
    fi
done

# Check icons
echo ""
echo "🎨 Checking icons..."

icon_files=(
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

for icon in "${icon_files[@]}"; do
    if [ -f "$icon" ]; then
        echo "   ✅ $icon"
    else
        echo "   ❌ $icon not found"
        ((errors++))
    fi
done

# Check documentation
echo ""
echo "📖 Checking documentation..."

doc_files=(
    "README.md"
    "LICENSE"
    "CONTRIBUTING.md"
    "docs/INSTALLATION.md"
    "docs/USAGE.md"
    "docs/API.md"
    "docs/TESTING.md"
)

for doc in "${doc_files[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc"
    else
        echo "   ⚠️  $doc not found (optional)"
        ((warnings++))
    fi
done

# Check JavaScript syntax
echo ""
echo "🔍 Checking JavaScript syntax..."

if command -v node > /dev/null 2>&1; then
    js_files=(
        "background.js"
        "lib/gemini.js"
        "content-scripts/google-forms.js"
        "content-scripts/microsoft-forms.js"
        "popup/popup.js"
        "options/options.js"
    )
    
    for js in "${js_files[@]}"; do
        if [ -f "$js" ]; then
            if node --check "$js" 2>/dev/null; then
                echo "   ✅ $js syntax OK"
            else
                echo "   ❌ $js has syntax errors"
                ((errors++))
            fi
        fi
    done
else
    echo "   ⚠️  Node.js not found, skipping syntax check"
    ((warnings++))
fi

# Summary
echo ""
echo "==========================================="
echo "📊 Validation Summary:"
echo ""

if [ $errors -eq 0 ]; then
    echo "   ✅ All checks passed!"
    if [ $warnings -gt 0 ]; then
        echo "   ⚠️  $warnings warning(s) found"
    fi
    echo ""
    echo "✨ Your installation is ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Load the extension in Chrome (chrome://extensions/)"
    echo "2. Get a Gemini API key from https://aistudio.google.com/app/apikey"
    echo "3. Configure the extension with your API key and profile"
    echo "4. Try it on a Google Form or Microsoft Form!"
    exit 0
else
    echo "   ❌ $errors error(s) found"
    if [ $warnings -gt 0 ]; then
        echo "   ⚠️  $warnings warning(s) found"
    fi
    echo ""
    echo "❌ Please fix the errors above before using the extension."
    exit 1
fi
