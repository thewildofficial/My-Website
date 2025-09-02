/**
 * GitHub Activity Monitor
 * Real-time monitoring with AI-powered summaries using Gemini 2.5 Flash
 */

class GitHubMonitor {
  constructor() {
    this.config = window.GITHUB_CONFIG || {
      username: 'thewildofficial',
      apiUrl: 'https://api.github.com',
      refreshInterval: 300000, // 5 minutes
      maxCommits: 50,
      maxRepos: 20
    };
    
    this.geminiApiKey = null; // Will be set via environment or user input
    this.lastUpdate = null;
    this.isLoading = false;
    
    // Caching properties
    this.cacheKey = 'github-monitor-cache';
    this.summaryCache = this.loadSummaryCache();
    
    this.init();
  }

  // Cache management methods
  loadSummaryCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load summary cache:', error);
      return null;
    }
  }

  saveSummaryCache(data) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save summary cache:', error);
    }
  }

  generateDataHash(commits, pullRequests, repos) {
    // Create a simple hash based on recent activity
    const latestCommit = commits[0]?.created_at || '';
    const latestPR = pullRequests[0]?.created_at || '';
    const repoCount = repos.length;
    const hashString = `${latestCommit}-${latestPR}-${repoCount}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  shouldRegenerateSummary(commits, pullRequests, repos) {
    if (!this.summaryCache) {
      console.log('No cache found, generating new summary');
      return true;
    }

    const currentHash = this.generateDataHash(commits, pullRequests, repos);
    const cacheAge = Date.now() - (this.summaryCache.timestamp || 0);
    const maxCacheAge = 6 * 60 * 60 * 1000; // 6 hours

    if (this.summaryCache.dataHash !== currentHash) {
      console.log('Data changed, regenerating summary');
      return true;
    }

    if (cacheAge > maxCacheAge) {
      console.log('Cache expired, regenerating summary');
      return true;
    }

    console.log('Using cached summary');
    return false;
  }

  async init() {
    try {
      await this.loadGeminiApiKey();
      await this.loadGitHubData();
      this.setupAutoRefresh();
    } catch (error) {
      console.error('Failed to initialize GitHub Monitor:', error);
      this.showError('Failed to initialize GitHub Monitor. Please check your configuration.');
    }
  }

  async loadGeminiApiKey() {
    // Get API key from environment variable (set in Netlify)
    // This will be available as a build-time environment variable
    this.geminiApiKey = window.GEMINI_API_KEY || null;
    
    console.log('Gemini API Key status:', this.geminiApiKey ? 'Found' : 'Not found');
    console.log('API Key value:', this.geminiApiKey === 'YOUR_API_KEY_HERE' ? 'Placeholder' : 'Set');
    console.log('Full API key (first 10 chars):', this.geminiApiKey ? this.geminiApiKey.substring(0, 10) + '...' : 'null');
    
    // Check if it's a valid API key (starts with AIza and is longer than 20 chars)
    const isValidApiKey = this.geminiApiKey && 
                         this.geminiApiKey !== 'YOUR_API_KEY_HERE' && 
                         this.geminiApiKey.length > 20 && 
                         this.geminiApiKey.startsWith('AIza');
    
    if (!isValidApiKey) {
      console.warn('Gemini API key not found, is placeholder, or invalid. AI summaries will be disabled.');
      console.warn('Expected: API key starting with "AIza" and longer than 20 characters');
      this.geminiApiKey = null;
    } else {
      console.log('Gemini API key loaded successfully');
    }
  }

  async loadGitHubData() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // Load all data in parallel
      const [commits, pullRequests, repos, userStats] = await Promise.all([
        this.fetchRecentCommits(),
        this.fetchPullRequests(),
        this.fetchRepositories(),
        this.fetchUserStats()
      ]);

      this.updateStats(commits, pullRequests, repos, userStats);
      this.updateTimeline(commits, pullRequests);
      this.updateRepoOverview(repos);
      
      if (this.geminiApiKey) {
        await this.generateAISummaryWithCache(commits, pullRequests, repos);
      } else {
        this.showSummaryPlaceholder();
      }

      this.lastUpdate = new Date();
      this.updateLastUpdatedTime();

    } catch (error) {
      console.error('Error loading GitHub data:', error);
      this.showError('Failed to load GitHub data. Please try again later.');
    } finally {
      this.isLoading = false;
    }
  }

  async fetchRecentCommits() {
    const response = await fetch(
      `${this.config.apiUrl}/users/${this.config.username}/events?per_page=${this.config.maxCommits}`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const events = await response.json();
    return events.filter(event => event.type === 'PushEvent');
  }

  async fetchPullRequests() {
    const response = await fetch(
      `${this.config.apiUrl}/search/issues?q=author:${this.config.username}+type:pr+state:open`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  }

  async fetchRepositories() {
    const response = await fetch(
      `${this.config.apiUrl}/users/${this.config.username}/repos?sort=updated&per_page=${this.config.maxRepos}`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  }

  async fetchUserStats() {
    const response = await fetch(
      `${this.config.apiUrl}/users/${this.config.username}`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  }

  updateStats(commits, pullRequests, repos, userStats) {
    // Update commit count
    const commitCount = commits.length;
    document.getElementById('commit-count').textContent = commitCount;

    // Update PR count
    const prCount = pullRequests.length;
    document.getElementById('pr-count').textContent = prCount;

    // Update repo count
    const repoCount = repos.length;
    document.getElementById('repo-count').textContent = repoCount;

    // Update language stats with icons
    const languages = this.extractLanguages(repos);
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const languageIcons = this.getLanguageIcons(topLanguages);
    document.getElementById('language-stats').innerHTML = languageIcons;
  }

  getLanguageIcons(languages) {
    const badgeMap = {
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Python': 'python',
      'Java': 'java',
      'C++': 'c++',
      'C#': 'csharp',
      'Go': 'go',
      'Rust': 'rust',
      'PHP': 'php',
      'Ruby': 'ruby',
      'Swift': 'swift',
      'Kotlin': 'kotlin',
      'HTML': 'html5',
      'CSS': 'css3',
      'Shell': 'shell',
      'Dockerfile': 'docker',
      'Vue': 'vue.js',
      'React': 'react',
      'Angular': 'angular',
      'Node.js': 'node.js',
      'C': 'c',
      'R': 'r',
      'Scala': 'scala',
      'Perl': 'perl',
      'Lua': 'lua',
      'Haskell': 'haskell',
      'Clojure': 'clojure',
      'Elixir': 'elixir',
      'Erlang': 'erlang',
      'F#': 'fsharp',
      'OCaml': 'ocaml',
      'Julia': 'julia',
      'MATLAB': 'matlab',
      'Assembly': 'assembly',
      'PowerShell': 'powershell',
      'Bash': 'bash',
      'Zsh': 'zsh',
      'Fish': 'fish',
      'Makefile': 'make',
      'CMake': 'cmake',
      'YAML': 'yaml',
      'JSON': 'json',
      'XML': 'xml',
      'Markdown': 'markdown',
      'TeX': 'latex',
      'Roff': 'roff',
      'Vim script': 'vim',
      'Emacs Lisp': 'emacs',
      'Lisp': 'lisp',
      'Scheme': 'scheme',
      'Prolog': 'prolog',
      'Smalltalk': 'smalltalk',
      'COBOL': 'cobol',
      'Fortran': 'fortran',
      'Pascal': 'pascal',
      'Ada': 'ada',
      'Delphi': 'delphi',
      'Visual Basic': 'visualbasic',
      'Objective-C': 'objective-c',
      'Objective-C++': 'objective-c++',
      'Dart': 'dart',
      'Flutter': 'flutter',
      'React Native': 'react',
      'Xamarin': 'xamarin',
      'Ionic': 'ionic',
      'Cordova': 'cordova',
      'PhoneGap': 'phonegap',
      'Titanium': 'titanium',
      'Unity': 'unity',
      'Unreal Engine': 'unrealengine',
      'Godot': 'godot'
    };

    return languages.map(([lang, count]) => {
      const badgeName = badgeMap[lang] || 'code';
      const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(lang)}-3670A0?style=for-the-badge&logo=${badgeName}&logoColor=ffdd54`;
      return `<img src="${badgeUrl}" alt="${lang}" title="${lang} (${count} repos)" style="height: 20px; margin: 0 2px;" />`;
    }).join('');
  }

  extractLanguages(repos) {
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    return languages;
  }

  updateTimeline(commits, pullRequests) {
    const timelineContainer = document.getElementById('activity-timeline');
    
    // Combine and sort activities
    const activities = [
      ...commits.slice(0, 10).map(commit => ({
        type: 'commit',
        title: this.truncateCommitMessage(commit.payload.commits[0]?.message || 'Commit'),
        description: `Pushed to ${commit.repo.name}`,
        time: new Date(commit.created_at),
        url: `https://github.com/${commit.repo.name}/commit/${commit.payload.head}`
      })),
      ...pullRequests.slice(0, 5).map(pr => ({
        type: 'pr',
        title: this.truncateCommitMessage(pr.title),
        description: `Pull request #${pr.number}`,
        time: new Date(pr.created_at),
        url: pr.html_url
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 15);

    timelineContainer.innerHTML = activities.map(activity => `
      <div class="timeline-item">
        <div class="timeline-icon ${activity.type}">
          <i class="fas fa-${activity.type === 'commit' ? 'code-commit' : 'code-branch'}"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">
            <a href="${activity.url}" target="_blank" rel="noopener">${this.escapeHtml(activity.title)}</a>
          </div>
          <div class="timeline-description">${this.escapeHtml(activity.description)}</div>
          <div class="timeline-meta">
            <span><i class="fas fa-clock"></i> ${this.formatTimeAgo(activity.time)}</span>
            <span><i class="fas fa-external-link-alt"></i> View on GitHub</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  truncateCommitMessage(message) {
    if (!message) return 'Commit';
    
    // Remove common prefixes and clean up
    let cleanMessage = message
      .replace(/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?:?\s*/i, '')
      .replace(/^(\w+):\s*/, '')
      .trim();
    
    // If still too long, truncate intelligently
    if (cleanMessage.length > 60) {
      // Try to break at a sentence or word boundary
      const truncated = cleanMessage.substring(0, 57);
      const lastSpace = truncated.lastIndexOf(' ');
      const lastPeriod = truncated.lastIndexOf('.');
      const breakPoint = Math.max(lastSpace, lastPeriod);
      
      if (breakPoint > 30) {
        cleanMessage = cleanMessage.substring(0, breakPoint) + '...';
      } else {
        cleanMessage = cleanMessage.substring(0, 57) + '...';
      }
    }
    
    return cleanMessage;
  }

  updateRepoOverview(repos) {
    const repoContainer = document.getElementById('repo-overview');
    
    repoContainer.innerHTML = repos.slice(0, 12).map(repo => `
      <div class="repo-card">
        <div class="repo-header">
          <h3 class="repo-name">
            <a href="${repo.html_url}" target="_blank" rel="noopener">${this.escapeHtml(repo.name)}</a>
          </h3>
          <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
          </div>
        </div>
        <div class="repo-description">${this.escapeHtml(repo.description || 'No description available')}</div>
        <div class="repo-languages">
          ${repo.language ? `<span class="language-tag">${this.escapeHtml(repo.language)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  async generateAISummaryWithCache(commits, pullRequests, repos) {
    const summaryContainer = document.getElementById('summary-content');
    
    // Check if we should regenerate the summary
    if (!this.shouldRegenerateSummary(commits, pullRequests, repos)) {
      // Use cached summary
      summaryContainer.innerHTML = `
        <div class="ai-summary cached">
          ${this.summaryCache.summary}
          <div class="cache-indicator">
            <small><i class="fas fa-clock"></i> Cached summary from ${new Date(this.summaryCache.timestamp).toLocaleString()}</small>
          </div>
        </div>
      `;
      return;
    }

    // Generate new summary
    await this.generateAISummary(commits, pullRequests, repos);
    
    // Cache the new summary
    const newSummary = summaryContainer.querySelector('.ai-summary')?.innerHTML;
    if (newSummary) {
      this.saveSummaryCache({
        summary: newSummary,
        dataHash: this.generateDataHash(commits, pullRequests, repos)
      });
      this.summaryCache = this.loadSummaryCache();
    }
  }

  async generateAISummary(commits, pullRequests, repos) {
    const summaryContainer = document.getElementById('summary-content');
    summaryContainer.innerHTML = '<div class="loading-spinner">Generating AI summary with Gemini 2.5 Flash...</div>';

    try {
      // Prepare data for AI analysis
      const recentCommits = commits.slice(0, 20).map(commit => ({
        message: commit.payload.commits[0]?.message || '',
        repo: commit.repo.name,
        time: commit.created_at
      }));

      const recentPRs = pullRequests.map(pr => ({
        title: pr.title,
        body: pr.body || '',
        repo: pr.repository_url.split('/').slice(-2).join('/'),
        state: pr.state
      }));

      const activeRepos = repos.slice(0, 10).map(repo => ({
        name: repo.name,
        description: repo.description || '',
        language: repo.language,
        updated: repo.updated_at
      }));

      const prompt = this.buildSummaryPrompt(recentCommits, recentPRs, activeRepos);
      const summary = await this.callGeminiAPI(prompt);
      
      summaryContainer.innerHTML = `<div class="ai-summary">${summary}</div>`;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      summaryContainer.innerHTML = '<div class="error-message">Failed to generate AI summary. Please try again later.</div>';
    }
  }

  buildSummaryPrompt(commits, pullRequests, repos) {
    // Clean and summarize commit messages
    const cleanCommits = commits.slice(0, 8).map(c => {
      const cleanMessage = this.truncateCommitMessage(c.message);
      return `• ${c.repo}: ${cleanMessage}`;
    }).join('\n');

    return `Create a professional developer portfolio summary from this GitHub activity:

COMMITS:
${cleanCommits}

REPOS:
${repos.slice(0, 5).map(r => `• ${r.name} (${r.language || 'N/A'})`).join('\n')}

Respond with HTML using exactly this format:

<div class="ai-summary">
<h4>🔍 Current Focus:</h4>
<p>[Main project areas]</p>

<h4>💻 Technologies:</h4>
<p>[Languages and tools]</p>

<h4>📈 Recent Activity:</h4>
<p>[Key updates]</p>
</div>

Keep it concise and professional.`;
  }

  async callGeminiAPI(prompt) {
    try {
      console.log('Making Gemini API call with prompt length:', prompt.length);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      console.log('Gemini API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (!data.candidates || !data.candidates[0]) {
        console.error('No candidates in Gemini API response:', data);
        throw new Error('No candidates in response from Gemini API');
      }
      
      const candidate = data.candidates[0];
      
      // Check for safety ratings that might block content
      if (candidate.finishReason === 'SAFETY') {
        console.warn('Content was blocked by safety filters:', candidate.safetyRatings);
        throw new Error('Content was blocked by Gemini safety filters. Try a different prompt.');
      }
      
      if (!candidate.content) {
        console.error('No content in candidate:', candidate);
        console.error('Candidate finish reason:', candidate.finishReason);
        console.error('Safety ratings:', candidate.safetyRatings);
        throw new Error(`No content in response. Finish reason: ${candidate.finishReason}`);
      }
      
      if (!candidate.content.parts || !candidate.content.parts[0]) {
        console.error('No parts in content:', candidate.content);
        console.error('Full candidate:', candidate);
        
        // Handle MAX_TOKENS case - sometimes the response is truncated but still usable
        if (candidate.finishReason === 'MAX_TOKENS' && candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          console.warn('Response was truncated due to MAX_TOKENS, but attempting to use partial content');
          return candidate.content.parts[0]?.text || 'AI summary was truncated due to length limits.';
        }
        
        throw new Error('No parts in content from Gemini API');
      }
      
      if (!candidate.content.parts[0].text) {
        console.error('No text in first part:', candidate.content.parts[0]);
        throw new Error('No text content in response parts');
      }
      
      return candidate.content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  showSummaryPlaceholder() {
    const summaryContainer = document.getElementById('summary-content');
    summaryContainer.innerHTML = `
      <div class="summary-placeholder">
        <p>AI-powered summaries with Gemini 2.5 Flash are currently unavailable.</p>
        <p>Please check your environment configuration.</p>
        <button onclick="githubMonitor.testApiKey()" class="btn">Test API Key</button>
      </div>
    `;
  }

  testApiKey() {
    console.log('=== API Key Test ===');
    console.log('Window GEMINI_API_KEY:', window.GEMINI_API_KEY);
    console.log('This instance API key:', this.geminiApiKey);
    console.log('API key length:', this.geminiApiKey ? this.geminiApiKey.length : 0);
    console.log('Is placeholder:', this.geminiApiKey === 'YOUR_API_KEY_HERE');
    console.log('Starts with AIza:', this.geminiApiKey ? this.geminiApiKey.startsWith('AIza') : false);
    
    const isValidApiKey = this.geminiApiKey && 
                         this.geminiApiKey !== 'YOUR_API_KEY_HERE' && 
                         this.geminiApiKey.length > 20 && 
                         this.geminiApiKey.startsWith('AIza');
    
    if (isValidApiKey) {
      alert('✅ API key is valid and loaded! Check console for details.');
    } else {
      alert('❌ API key not found or invalid.\n\nTo fix:\n1. Edit local-config.js\n2. Replace YOUR_API_KEY_HERE with your actual Gemini API key\n3. Get API key from: https://makersuite.google.com/app/apikey');
    }
  }

  updateLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement && this.lastUpdate) {
      lastUpdatedElement.textContent = this.formatTimeAgo(this.lastUpdate);
    }
  }

  setupAutoRefresh() {
    setInterval(() => {
      if (!this.isLoading) {
        this.loadGitHubData();
      }
    }, this.config.refreshInterval);
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.monitor-content');
    if (container) {
      container.insertBefore(errorDiv, container.firstChild);
    }
  }
}

// Initialize the GitHub Monitor when the page loads
let githubMonitor;
document.addEventListener('DOMContentLoaded', () => {
  githubMonitor = new GitHubMonitor();
});