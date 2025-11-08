const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSummaryPrompt } = require('./generate-summary-utils.js');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Gemini API key not configured on server' 
        })
      };
    }

    // Parse request body
    const { githubData } = JSON.parse(event.body);
    if (!githubData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'GitHub data is required' })
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const primaryModelId = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
    const primaryModel = genAI.getGenerativeModel({ model: primaryModelId });

    // Build the prompt using shared utility
    const prompt = buildSummaryPrompt(githubData);

    // Generate content with fallback to 2.5 Flash if Pro is unavailable
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

    // Clean up the response - remove markdown code block tags
    summary = summary.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        summary: summary,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      error: 'Failed to generate AI summary',
      message: error.message || 'Unknown error',
      type: error.name || 'Error'
    };
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorDetails)
    };
  }
};