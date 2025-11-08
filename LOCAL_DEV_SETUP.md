# Local Development Setup for GitHub Monitor AI Insights

This setup allows you to test AI insights locally using your `.env` file without needing `netlify dev`.

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Make sure your `.env` file contains**:
   ```
   GEMINI_API_KEY=your_api_key_here
   GITHUB_TOKEN=your_github_token_here
   ```

## Usage

### Option 1: Run both servers manually (Recommended)

**Terminal 1** - Start the local dev server:
```bash
node scripts/local-dev-server.js
```

**Terminal 2** - Start Hugo:
```bash
npm run dev
# or
hugo server -D --bind 0.0.0.0 --baseURL http://localhost:1313
```

### Option 2: Use the convenience script

```bash
npm run dev:full
```

This will start both servers in the background. Note: You'll need to manually stop both processes when done.

## How It Works

- The local dev server runs on `http://localhost:8888` (configurable via `LOCAL_FUNCTION_PORT` in `.env`)
- When the frontend detects `localhost` or `127.0.0.1`, it automatically uses the local dev server instead of Netlify functions
- The local server reads `GEMINI_API_KEY` from your `.env` file
- All other functionality remains the same

## Troubleshooting

- **Port already in use**: Change `LOCAL_FUNCTION_PORT` in `.env` or kill the process using port 8888
- **API key not found**: Make sure `GEMINI_API_KEY` is set in your `.env` file
- **CORS errors**: The local server includes CORS headers, so this shouldn't be an issue
- **Function not found**: Make sure the local dev server is running before loading the page

## Production

When deployed to Netlify, the frontend automatically uses the Netlify function endpoint. No changes needed!

