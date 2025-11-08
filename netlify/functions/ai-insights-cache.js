'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_DIR = '/tmp/ai-insights-cache';
const CACHE_TTL_WEEKS = 1; // Cache expires after 1 week

/**
 * Get the current year and ISO week number
 * Returns format: YYYY-WW (e.g., "2024-15")
 */
function getWeekKey() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get ISO week number using a more reliable method
  // ISO week: week 1 is the week with the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7; // Convert Sunday (0) to 7
  const daysToThursday = 4 - jan4Day;
  const firstThursday = new Date(year, 0, 4 + daysToThursday);
  
  const daysDiff = Math.floor((now - firstThursday) / (24 * 60 * 60 * 1000));
  const week = Math.floor(daysDiff / 7) + 1;
  
  return `${year}-W${week}`;
}

/**
 * Get cache key for a username
 */
function getCacheKey(username) {
  const weekKey = getWeekKey();
  return `ai-insights-${username}-${weekKey}`;
}

/**
 * Get cache file path
 */
function getCacheFilePath(username) {
  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  
  const cacheKey = getCacheKey(username);
  return path.join(CACHE_DIR, `${cacheKey}.json`);
}

/**
 * Get cached AI insights for a username
 * Returns null if cache doesn't exist or is expired
 */
function getCachedInsights(username) {
  try {
    const cachePath = getCacheFilePath(username);
    
    console.log(`[Cache] Looking for cache file: ${cachePath}`);
    
    if (!fs.existsSync(cachePath)) {
      console.log(`[Cache] Cache file does not exist for ${username}`);
      return null;
    }
    
    const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const cacheWeek = cacheData.weekKey;
    const currentWeek = getWeekKey();
    
    console.log(`[Cache] Found cache for ${username}, week: ${cacheWeek}, current week: ${currentWeek}`);
    
    // Check if cache is from current week
    if (cacheWeek !== currentWeek) {
      // Cache expired, delete it
      console.log(`[Cache] Cache expired (week mismatch), deleting: ${cachePath}`);
      fs.unlinkSync(cachePath);
      return null;
    }
    
    // Check if cache is too old (more than 1 week)
    const cacheAge = Date.now() - cacheData.timestamp;
    const maxAge = CACHE_TTL_WEEKS * 7 * 24 * 60 * 60 * 1000;
    
    if (cacheAge > maxAge) {
      console.log(`[Cache] Cache too old (${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} days), deleting`);
      fs.unlinkSync(cachePath);
      return null;
    }
    
    console.log(`[Cache] Cache valid for ${username}, age: ${Math.floor(cacheAge / (60 * 60 * 1000))} hours`);
    return {
      summary: cacheData.summary,
      timestamp: cacheData.timestamp
    };
  } catch (error) {
    console.warn('[Cache] Error reading cache:', error.message);
    return null;
  }
}

/**
 * Store AI insights in cache
 */
function setCachedInsights(username, summary) {
  try {
    const cachePath = getCacheFilePath(username);
    const weekKey = getWeekKey();
    
    const cacheData = {
      username,
      weekKey,
      summary,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
    
    // Clean up old cache files (from previous weeks)
    cleanupOldCache();
    
    return true;
  } catch (error) {
    console.warn('Error writing cache:', error.message);
    return false;
  }
}

/**
 * Clean up cache files from previous weeks
 */
function cleanupOldCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return;
    }
    
    const files = fs.readdirSync(CACHE_DIR);
    const currentWeek = getWeekKey();
    
    files.forEach(file => {
      if (!file.startsWith('ai-insights-') || !file.endsWith('.json')) {
        return;
      }
      
      try {
        const filePath = path.join(CACHE_DIR, file);
        const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Delete if from a different week
        if (cacheData.weekKey !== currentWeek) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        // If file is corrupted, delete it
        try {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        } catch (e) {
          // Ignore deletion errors
        }
      }
    });
  } catch (error) {
    console.warn('Error cleaning up cache:', error.message);
  }
}

/**
 * Clear cache for a specific username (useful for testing)
 */
function clearCache(username) {
  try {
    const cachePath = getCacheFilePath(username);
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error clearing cache:', error.message);
    return false;
  }
}

module.exports = {
  getCachedInsights,
  setCachedInsights,
  clearCache,
  getWeekKey
};

