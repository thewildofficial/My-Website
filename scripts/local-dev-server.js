#!/usr/bin/env node

/**
 * Local development server for Netlify functions
 * Reads from .env file and provides the same API endpoints
 * 
 * Usage: node scripts/local-dev-server.js
 * Then run Hugo normally - the frontend will detect localhost and use this server
 */

require('dotenv').config();
const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSummaryPrompt } = require('../netlify/functions/generate-summary-utils.js');

const PORT = process.env.LOCAL_FUNCTION_PORT || 8888;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only handle POST requests to generate-summary
  if (req.method !== 'POST' || !req.url.includes('generate-summary')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'GEMINI_API_KEY not found in .env file' 
      }));
      return;
    }

    // Read request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { githubData } = JSON.parse(body);
        if (!githubData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'githubData is required' }));
          return;
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const primaryModelId = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
        const primaryModel = genAI.getGenerativeModel({ model: primaryModelId });

        // Build the prompt
        const prompt = buildSummaryPrompt(githubData);

        // Generate content with fallback
        let response;
        try {
          const result = await primaryModel.generateContent(prompt);
          response = await result.response;
        } catch (primaryError) {
          if (primaryModelId === 'gemini-2.5-flash') {
            throw primaryError;
          }
          console.warn('Primary Gemini model failed, attempting fallback:', primaryError.message);
          const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const fallbackResult = await fallbackModel.generateContent(prompt);
          response = await fallbackResult.response;
        }

        let summary = response.text();
        summary = summary.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          summary: summary,
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error('Error generating AI summary:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Failed to generate AI summary',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }));
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error', message: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Local dev server running on http://localhost:${PORT}`);
  console.log(`   AI insights endpoint: http://localhost:${PORT}/.netlify/functions/generate-summary`);
  console.log(`   Make sure GEMINI_API_KEY is set in your .env file\n`);
});
