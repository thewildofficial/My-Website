#!/bin/bash

# Netlify Build Script for GitHub Monitor
# This script builds the site and installs function dependencies

echo "Starting Netlify build process..."

# Check if GEMINI_API_KEY is set for server-side functions
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Warning: GEMINI_API_KEY environment variable is not set"
    echo "AI summaries will be disabled in production"
fi

# Install function dependencies
echo "Installing function dependencies..."
cd netlify/functions
if [ -f "package.json" ]; then
    npm install --production
    echo "Function dependencies installed"
else
    echo "No function dependencies to install"
fi
cd ../..

# Run Hugo build
echo "Building site with Hugo..."
hugo --minify --gc --baseURL https://www.abanhasan.net

echo "Build completed successfully!"