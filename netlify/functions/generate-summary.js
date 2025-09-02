const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build the prompt
    const prompt = buildSummaryPrompt(githubData);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

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
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate AI summary',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

function buildSummaryPrompt(githubData) {
  const { commits, repositories, metrics, languageStats } = githubData;
  
  const recentCommits = commits.slice(0, 10).map(commit => {
    const message = commit.payload?.commits?.[0]?.message || 'No message';
    return `• ${commit.repo.name}: ${truncateText(message, 60)}`;
  }).join('\n');

  const topRepos = repositories.slice(0, 5).map(repo => 
    `• ${repo.name} (${repo.language || 'N/A'}) - ${repo.stargazers_count} stars`
  ).join('\n');

  const languages = Object.entries(languageStats)
    .sort(([,a], [,b]) => b.size - a.size)
    .slice(0, 3)
    .map(([lang, data]) => `${lang} (${data.percentage}%)`)
    .join(', ');

  const velocity = metrics?.velocity || {};
  const streak = metrics?.streak || {};

  return `Create a professional developer portfolio summary from this comprehensive GitHub activity data:

RECENT COMMITS (${commits.length} total):
${recentCommits}

TOP REPOSITORIES:
${topRepos}

DEVELOPMENT METRICS:
• Commits this week: ${velocity.week || 0}
• Commits this month: ${velocity.month || 0}
• Current streak: ${streak.current || 0} days
• Active repositories: ${metrics?.repoHealth?.active || 0}

TECHNOLOGY STACK:
${languages}

Respond with clean HTML using this structure:

<div class="ai-summary">
<h4>🎯 Current Focus</h4>
<p>[2-3 sentences about main development areas and projects]</p>

<h4>⚡ Development Velocity</h4>
<p>[Insights about coding activity and productivity patterns]</p>

<h4>🛠️ Technology Stack</h4>
<p>[Analysis of languages and tools being used]</p>

<h4>📈 Growth & Impact</h4>
<p>[Commentary on repository health, contributions, and development trends]</p>
</div>

Keep it professional, insightful, and concise. Focus on patterns and meaningful insights rather than just listing data.`;
}

function truncateText(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}