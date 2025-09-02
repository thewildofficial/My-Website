#!/bin/bash

# Netlify Build Script for GitHub Monitor
# This script injects the GEMINI_API_KEY environment variable into the template

echo "Starting Netlify build process..."

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Warning: GEMINI_API_KEY environment variable is not set"
    echo "AI summaries will be disabled in production"
fi

# Create a temporary template with the API key injected
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "Injecting GEMINI_API_KEY into template..."
    
    # Create a backup of the original template
    cp layouts/page/github-monitor.html layouts/page/github-monitor.html.backup
    
    # Replace the placeholder with the actual API key
    sed "s/YOUR_API_KEY_HERE/$GEMINI_API_KEY/g" layouts/page/github-monitor.html.backup > layouts/page/github-monitor.html
fi

# Run Hugo build
echo "Building site with Hugo..."
hugo --minify --gc --baseURL https://www.abanhasan.net

# Restore original template if we modified it
if [ ! -z "$GEMINI_API_KEY" ] && [ -f "layouts/page/github-monitor.html.backup" ]; then
    echo "Restoring original template..."
    mv layouts/page/github-monitor.html.backup layouts/page/github-monitor.html
fi

echo "Build completed successfully!"