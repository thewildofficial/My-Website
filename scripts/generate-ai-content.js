#!/usr/bin/env node
/**
 * Server-side AI summary generation for GitHub Monitor (Netlify build step)
 * Fetches recent GitHub activity then calls Gemini API using GEMINI_API_KEY (env var)
 * Outputs JSON to static/data/github-ai-content.json consumed by client JS.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'thewildofficial';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Not exposed to client
const OUT_DIR = path.join(process.cwd(), 'static', 'data');
const OUT_FILE = path.join(OUT_DIR, 'github-ai-content.json');

async function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GitHub-Monitor/1.0', ...headers } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else {
          reject(new Error(`Request failed ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function getActivity() {
  const events = await fetchJSON(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=50`);
  const pushEvents = events.filter(e => e.type === 'PushEvent');
  const commits = pushEvents.slice(0, 20).map(e => ({
    repo: e.repo.name,
    message: e.payload?.commits?.[0]?.message || 'Commit',
    time: e.created_at
  }));
  const repos = await fetchJSON(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`);
  const topRepos = repos.slice(0, 10).map(r => ({ name: r.name, language: r.language, stars: r.stargazers_count, updated: r.updated_at }));
  return { commits, topRepos };
}

function buildPrompt(data) {
  const commitLines = data.commits.slice(0, 10).map(c => `• ${c.repo}: ${c.message.substring(0,60)}` ).join('\n');
  const repoLines = data.topRepos.slice(0, 5).map(r => `• ${r.name} (${r.language || 'N/A'}) - ${r.stars}★`).join('\n');
  return `Create a concise professional developer activity summary:

RECENT COMMITS:\n${commitLines}\n\nTOP REPOS:\n${repoLines}\n\nReturn ONLY HTML inside <div class="ai-summary"> using subsections: Current Focus, Technologies, Recent Activity.`;
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('No GEMINI_API_KEY provided');
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 } });
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST',
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            resolve(text);
          } catch(e){ reject(e); }
        } else {
          reject(new Error(`Gemini error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function main() {
  console.log('Generating AI GitHub summary (server-side)...');
  const activity = await getActivity();
  let aiSummary = 'AI summary unavailable.';
  if (GEMINI_API_KEY) {
    try {
      const prompt = buildPrompt(activity);
      aiSummary = await callGemini(prompt);
    } catch (e) {
      console.warn('Gemini generation failed:', e.message);
    }
  } else {
    console.warn('Skipping Gemini generation (no key).');
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ aiSummary, lastUpdated: new Date().toISOString() }, null, 2));
  console.log('Wrote', OUT_FILE);
}

main().catch(err => { console.error(err); process.exit(1); });