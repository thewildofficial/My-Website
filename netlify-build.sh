#!/bin/bash

# Netlify Build Script for GitHub Monitor
# This script injects the GEMINI_API_KEY environment variable into the template

echo "Starting Netlify build process..."

echo "Checking Gemini API key (server-side only)..."
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Warning: GEMINI_API_KEY not set. AI summary will be a placeholder." 
fi

# Run server-side AI summary generator BEFORE Hugo so file is available in /static
echo "Running server-side AI content generation..."
node scripts/generate-ai-content.js || echo "AI generation script failed; continuing without AI summary"

# Run Hugo build
echo "Building site with Hugo..."
hugo --minify --gc --baseURL https://www.abanhasan.net

echo "Build completed successfully!"