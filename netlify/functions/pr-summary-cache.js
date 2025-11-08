'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = '/tmp/pr-summaries-cache';
const CACHE_TTL_DAYS = 30; // Cache PR summaries for 30 days

/**
 * Get cache key for a PR (based on PR URL)
 */
function getPRCacheKey(prUrl) {
  const hash = crypto.createHash('md5').update(prUrl).digest('hex');
  return `pr-summary-${hash}`;
}

/**
 * Get cache file path for a PR
 */
function getPRCacheFilePath(prUrl) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  
  const cacheKey = getPRCacheKey(prUrl);
  return path.join(CACHE_DIR, `${cacheKey}.json`);
}

/**
 * Get cached PR summary
 */
function getCachedPRSummary(prUrl) {
  try {
    const cachePath = getPRCacheFilePath(prUrl);
    
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    
    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const cacheAge = Date.now() - cacheData.timestamp;
    const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
    
    if (cacheAge > maxAge) {
      fs.unlinkSync(cachePath);
      return null;
    }
    
    return cacheData.summary;
  } catch (error) {
    console.warn('Error reading PR cache:', error.message);
    return null;
  }
}

/**
 * Store PR summary in cache
 */
function setCachedPRSummary(prUrl, summary) {
  try {
    const cachePath = getPRCacheFilePath(prUrl);
    
    const cacheData = {
      prUrl,
      summary,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn('Error writing PR cache:', error.message);
    return false;
  }
}

/**
 * Generate AI summary for a PR
 */
async function generatePRSummary(prData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Summarize this GitHub Pull Request in 2-3 sentences. Focus on what changes were made and why. Be concise and technical.

Title: ${prData.title || 'N/A'}

Description:
${prData.body || 'No description provided'}

${prData.additions ? `Additions: +${prData.additions} lines` : ''}
${prData.deletions ? `Deletions: -${prData.deletions} lines` : ''}
${prData.filesChanged ? `Files changed: ${prData.filesChanged}` : ''}

Provide a concise summary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating PR summary:', error);
    throw error;
  }
}

/**
 * Get PR summary (with caching)
 * Returns { summary: string | null, cached: boolean }
 */
async function getPRSummary(prData) {
  if (!prData.url) {
    return { summary: null, cached: false };
  }

  // Check cache first
  const cached = getCachedPRSummary(prData.url);
  if (cached) {
    return { summary: cached, cached: true };
  }

  // Generate new summary
  try {
    const summary = await generatePRSummary(prData);
    setCachedPRSummary(prData.url, summary);
    return { summary, cached: false };
  } catch (error) {
    console.error('Failed to generate PR summary:', error);
    return { summary: null, cached: false };
  }
}

module.exports = {
  getPRSummary,
  getCachedPRSummary,
  setCachedPRSummary
};

