# Netlify Server-Side AI Setup

This document explains the server-side AI analysis setup for the GitHub Monitor.

## Overview

The GitHub Monitor now uses Netlify serverless functions to generate AI summaries server-side, keeping the Gemini API key secure and preventing client-side exposure.

## Architecture

1. **Client-side**: JavaScript collects GitHub data and sends it to the serverless function
2. **Server-side**: Netlify function processes the data with Gemini AI and returns the summary
3. **Security**: API key is stored as a Netlify environment variable, never exposed to the client

## Setup Instructions

### 1. Environment Variables

In your Netlify dashboard, add the following environment variable:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Function Dependencies

The function dependencies are automatically installed during the build process via the `netlify-build.sh` script.

### 3. Local Development

For local development, you can use Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

This will start a local server that includes the serverless functions.

## File Structure

```
netlify/
├── functions/
│   ├── generate-summary.js    # Main serverless function
│   └── package.json          # Function dependencies
```

## API Endpoint

The AI summary generation is available at:
```
/.netlify/functions/generate-summary
```

### Request Format

```json
{
  "githubData": {
    "commits": [...],
    "repositories": [...],
    "metrics": {...},
    "languageStats": {...}
  }
}
```

### Response Format

```json
{
  "summary": "<html>AI generated summary</html>",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

- ✅ API key stored server-side only
- ✅ No client-side API key exposure
- ✅ CORS headers configured
- ✅ Error handling for missing API key
- ✅ Input validation

## Troubleshooting

### AI Summary Not Working

1. Check that `GEMINI_API_KEY` is set in Netlify environment variables
2. Verify the function is deployed correctly
3. Check Netlify function logs for errors

### Local Development Issues

1. Make sure you're running `netlify dev` for local development
2. Check that the function URL in `local-config.js` is correct
3. Verify function dependencies are installed

## Build Process

The build process:
1. Installs function dependencies
2. Builds the Hugo site
3. Deploys both static site and serverless functions

## Monitoring

Monitor your function performance in the Netlify dashboard under "Functions" tab.