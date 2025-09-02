/**
 * Enhanced GitHub Activity Monitor
 * Feature-rich real-time monitoring with AI-powered insights, metrics, and analytics
 */

class EnhancedGitHubMonitor {
  constructor() {
    this.config = window.GITHUB_CONFIG || {
      username: 'thewildofficial',
      apiUrl: 'https://api.github.com',
      refreshInterval: 300000, // 5 minutes
      maxCommits: 100,
      maxRepos: 50,
      maxEvents: 100
    };
    
    this.geminiApiKey = null;
    this.lastUpdate = null;
    this.isLoading = false;
    this.autoRefreshEnabled = true;
    this.refreshTimer = null;
    
    // Enhanced caching system
    this.cacheKeys = {
      summary: 'github-monitor-summary',
      stats: 'github-monitor-stats',
      repos: 'github-monitor-repos',
      activity: 'github-monitor-activity'
    };
    
    // Data storage
    this.data = {
      commits: [],
      pullRequests: [],
      issues: [],
      repositories: [],
      events: [],
      userStats: {},
      languageStats: {},
      contributionData: {}
    };
    
    this.init();
  }

  async init() {
    try {
      this.setupEventListeners();
      this.updateConnectionStatus('loading', 'Initializing...');
      
      await this.loadGeminiApiKey();
      await this.loadAllGitHubData();
      this.startAutoRefresh();
      
      this.updateConnectionStatus('online', 'Connected');
      this.updateLastSync();
    } catch (error) {
      console.error('Failed to initialize Enhanced GitHub Monitor:', error);
      this.updateConnectionStatus('offline', 'Connection failed');
      this.showError('Failed to initialize GitHub Monitor. Please check your configuration.');
    }
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.manualRefresh());
    }

    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('auto-refresh');
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener('change', (e) => {
        this.autoRefreshEnabled = e.target.checked;
        if (this.autoRefreshEnabled) {
          this.startAutoRefresh();
        } else {
          this.stopAutoRefresh();
        }
      });
    }

    // Summary regeneration
    const regenerateBtn = document.getElementById('regenerate-summary');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => this.regenerateAISummary());
    }

    // Timeline filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterTimeline(e.target.dataset.filter);
      });
    });

    // Repository controls
    const sortSelect = document.getElementById('repo-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortRepositories(e.target.value);
      });
    }

    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener('click', () => this.setRepoView('grid'));
      listViewBtn.addEventListener('click', () => this.setRepoView('list'));
    }
  }

  async loadGeminiApiKey() {
    // Try to load from local config or environment
    if (window.GEMINI_API_KEY && window.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
      this.geminiApiKey = window.GEMINI_API_KEY;
    } else if (window.LOCAL_CONFIG?.geminiApiKey) {
      this.geminiApiKey = window.LOCAL_CONFIG.geminiApiKey;
    } else {
      console.warn('Gemini API key not found. AI summaries will be disabled.');
    }
  }

  async loadAllGitHubData() {
    this.updateConnectionStatus('loading', 'Loading GitHub data...');
    
    try {
      // Load data in parallel for better performance
      const [events, repos, userStats] = await Promise.all([
        this.fetchGitHubData(`/users/${this.config.username}/events?per_page=${this.config.maxEvents}`),
        this.fetchGitHubData(`/users/${this.config.username}/repos?sort=updated&per_page=${this.config.maxRepos}`),
        this.fetchGitHubData(`/users/${this.config.username}`)
      ]);

      this.data.events = events;
      this.data.repositories = repos;
      this.data.userStats = userStats;

      // Process and categorize events
      this.processEvents(events);
      
      // Calculate advanced metrics
      await this.calculateMetrics();
      
      // Update all UI components
      this.updateAllUI();
      
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to load GitHub data:', error);
      throw error;
    }
  }

  processEvents(events) {
    this.data.commits = [];
    this.data.pullRequests = [];
    this.data.issues = [];

    events.forEach(event => {
      switch (event.type) {
        case 'PushEvent':
          this.data.commits.push(event);
          break;
        case 'PullRequestEvent':
          this.data.pullRequests.push(event);
          break;
        case 'IssuesEvent':
          this.data.issues.push(event);
          break;
      }
    });

    // Sort by date
    this.data.commits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    this.data.pullRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    this.data.issues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async calculateMetrics() {
    // Language distribution
    this.data.languageStats = this.calculateLanguageDistribution();
    
    // Contribution streak
    const streak = this.calculateContributionStreak();
    
    // Velocity metrics
    const velocity = this.calculateCodingVelocity();
    
    // Repository health
    const repoHealth = this.calculateRepositoryHealth();
    
    this.data.metrics = {
      streak,
      velocity,
      repoHealth,
      languages: this.data.languageStats
    };
  }

  calculateLanguageDistribution() {
    const languages = {};
    let totalSize = 0;

    this.data.repositories.forEach(repo => {
      if (repo.language && repo.size > 0) {
        languages[repo.language] = (languages[repo.language] || 0) + repo.size;
        totalSize += repo.size;
      }
    });

    // Convert to percentages
    Object.keys(languages).forEach(lang => {
      languages[lang] = {
        size: languages[lang],
        percentage: ((languages[lang] / totalSize) * 100).toFixed(1)
      };
    });

    return languages;
  }

  calculateContributionStreak() {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    let streak = 0;
    let currentDate = new Date(today);

    // Get commits from last 30 days
    const recentCommits = this.data.commits.filter(commit => {
      const commitDate = new Date(commit.created_at);
      return (today - commitDate) <= (30 * oneDay);
    });

    // Calculate consecutive days with commits
    for (let i = 0; i < 30; i++) {
      const dayCommits = recentCommits.filter(commit => {
        const commitDate = new Date(commit.created_at);
        return commitDate.toDateString() === currentDate.toDateString();
      });

      if (dayCommits.length > 0) {
        streak++;
      } else if (streak > 0) {
        break; // Break on first day without commits
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      current: streak,
      commits: recentCommits.length,
      period: '30d'
    };
  }

  calculateCodingVelocity() {
    const last7Days = this.data.commits.filter(commit => {
      const commitDate = new Date(commit.created_at);
      const daysDiff = (new Date() - commitDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const last30Days = this.data.commits.filter(commit => {
      const commitDate = new Date(commit.created_at);
      const daysDiff = (new Date() - commitDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    return {
      week: last7Days.length,
      month: last30Days.length,
      average: {
        daily: (last30Days.length / 30).toFixed(1),
        weekly: (last30Days.length / 4).toFixed(1)
      }
    };
  }

  calculateRepositoryHealth() {
    const activeRepos = this.data.repositories.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 90; // Active in last 3 months
    });

    const totalStars = this.data.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = this.data.repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

    return {
      active: activeRepos.length,
      total: this.data.repositories.length,
      stars: totalStars,
      forks: totalForks,
      languages: Object.keys(this.data.languageStats).length
    };
  }

  updateAllUI() {
    this.updateEnhancedStats();
    this.updateMetrics();
    this.updateTimeline();
    this.updateRepositories();
    this.generateAISummaryWithCache();
  }

  updateEnhancedStats() {
    // Commit count with trend
    const commitCount = this.data.commits.length;
    const lastWeekCommits = this.data.commits.filter(commit => {
      const commitDate = new Date(commit.created_at);
      const daysDiff = (new Date() - commitDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    const commitCountElement = document.getElementById('commit-count');
    if (commitCountElement) {
      commitCountElement.textContent = lastWeekCommits;
    }
    
    const trendElement = document.getElementById('commit-trend');
    if (trendElement) {
      const trend = lastWeekCommits > 5 ? 'up' : lastWeekCommits > 0 ? 'stable' : 'down';
      trendElement.textContent = `${lastWeekCommits} this week`;
      trendElement.className = `stat-trend ${trend}`;
    }

    // PR count with status
    const openPRs = this.data.pullRequests.filter(pr => pr.payload.action === 'opened').length;
    const prCountElement = document.getElementById('pr-count');
    if (prCountElement) {
      prCountElement.textContent = openPRs;
    }
    
    const prStatus = document.getElementById('pr-status');
    if (prStatus) {
      prStatus.textContent = openPRs > 0 ? `${openPRs} open` : 'none open';
    }

    // Repository count with detail
    const activeRepos = this.data.repositories.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    }).length;

    const repoCountElement = document.getElementById('repo-count');
    if (repoCountElement) {
      repoCountElement.textContent = activeRepos;
    }
    
    const repoDetail = document.getElementById('repo-detail');
    if (repoDetail) {
      repoDetail.textContent = `${activeRepos}/${this.data.repositories.length} active`;
    }

    // Streak information
    const streak = this.data.metrics?.streak || { current: 0, period: '30d' };
    const streakCountElement = document.getElementById('streak-count');
    if (streakCountElement) {
      streakCountElement.textContent = streak.current;
    }
    
    const streakDetail = document.getElementById('streak-detail');
    if (streakDetail) {
      streakDetail.textContent = `${streak.current} days`;
    }

    // Enhanced language stats
    this.updateLanguageBreakdown();
  }

  updateLanguageBreakdown() {
    const languageContainer = document.getElementById('language-stats');
    if (!languageContainer) return;

    const topLanguages = Object.entries(this.data.languageStats)
      .sort(([,a], [,b]) => b.size - a.size)
      .slice(0, 5);

    const languageHTML = topLanguages.map(([lang, data]) => {
      const color = this.getLanguageColor(lang);
      return `
        <span class="language-tag" title="${lang}: ${data.percentage}%">
          <span class="language-icon" style="background-color: ${color}"></span>
          ${lang}
          <small>${data.percentage}%</small>
        </span>
      `;
    }).join('');

    languageContainer.innerHTML = languageHTML;
  }

  updateMetrics() {
    // Velocity chart placeholder
    const velocityChart = document.getElementById('velocity-chart');
    if (velocityChart && this.data.metrics?.velocity) {
      const { week, month, average } = this.data.metrics.velocity;
      velocityChart.innerHTML = `
        <div class="velocity-stats">
          <div class="velocity-item">
            <span class="velocity-number">${week}</span>
            <span class="velocity-label">This Week</span>
          </div>
          <div class="velocity-item">
            <span class="velocity-number">${month}</span>
            <span class="velocity-label">This Month</span>
          </div>
          <div class="velocity-item">
            <span class="velocity-number">${average.daily}</span>
            <span class="velocity-label">Daily Avg</span>
          </div>
        </div>
      `;
    }

    // Language chart
    const languageChart = document.getElementById('language-chart');
    if (languageChart) {
      const topLangs = Object.entries(this.data.languageStats)
        .sort(([,a], [,b]) => b.size - a.size)
        .slice(0, 5);
      
      languageChart.innerHTML = `
        <div class="language-chart">
          ${topLangs.map(([lang, data]) => `
            <div class="lang-bar">
              <span class="lang-name">${lang}</span>
              <div class="lang-progress">
                <div class="lang-fill" style="width: ${data.percentage}%; background-color: ${this.getLanguageColor(lang)}"></div>
              </div>
              <span class="lang-percent">${data.percentage}%</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Repository health
    const repoHealth = document.getElementById('repo-health');
    if (repoHealth && this.data.metrics?.repoHealth) {
      const health = this.data.metrics.repoHealth;
      repoHealth.innerHTML = `
        <div class="health-grid">
          <div class="health-item">
            <span class="health-number">${health.active}</span>
            <span class="health-label">Active Repos</span>
          </div>
          <div class="health-item">
            <span class="health-number">${health.stars}</span>
            <span class="health-label">Total Stars</span>
          </div>
          <div class="health-item">
            <span class="health-number">${health.forks}</span>
            <span class="health-label">Total Forks</span>
          </div>
          <div class="health-item">
            <span class="health-number">${health.languages}</span>
            <span class="health-label">Languages</span>
          </div>
        </div>
      `;
    }
  }

  updateTimeline() {
    const timelineContent = document.getElementById('timeline-content');
    if (!timelineContent) return;

    const allEvents = [
      ...this.data.commits.map(e => ({...e, category: 'commit'})),
      ...this.data.pullRequests.map(e => ({...e, category: 'pr'})),
      ...this.data.issues.map(e => ({...e, category: 'issue'}))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);

    const timelineHTML = allEvents.map(event => {
      const icon = this.getEventIcon(event);
      const timeAgo = this.timeAgo(new Date(event.created_at));
      const description = this.getEventDescription(event);

      return `
        <div class="timeline-item" data-category="${event.category}">
          <div class="timeline-icon">${icon}</div>
          <div class="timeline-content">
            <div class="timeline-description">${description}</div>
            <div class="timeline-meta">
              <span class="timeline-repo">${event.repo.name}</span>
              <span class="timeline-time">${timeAgo}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    timelineContent.innerHTML = timelineHTML;
  }

  updateRepositories() {
    const repoOverview = document.getElementById('repo-overview');
    if (!repoOverview) return;

    const repoHTML = this.data.repositories.slice(0, 12).map(repo => {
      const lastUpdate = this.timeAgo(new Date(repo.updated_at));
      const languageColor = repo.language ? this.getLanguageColor(repo.language) : '#666';

      return `
        <div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
          <div class="repo-header">
            <h4 class="repo-name">${repo.name}</h4>
            <div class="repo-stats">
              <span title="Stars">⭐ ${repo.stargazers_count}</span>
              <span title="Forks">🔀 ${repo.forks_count}</span>
            </div>
          </div>
          <p class="repo-description">${repo.description || 'No description available'}</p>
          <div class="repo-footer">
            ${repo.language ? `
              <span class="repo-language">
                <span class="language-dot" style="background-color: ${languageColor}"></span>
                ${repo.language}
              </span>
            ` : ''}
            <span class="repo-updated">Updated ${lastUpdate}</span>
          </div>
        </div>
      `;
    }).join('');

    repoOverview.innerHTML = repoHTML;
  }

  async generateAISummaryWithCache() {
    if (!this.geminiApiKey) {
      const summaryContentElement = document.getElementById('summary-content');
      if (summaryContentElement) {
        summaryContentElement.innerHTML = 
          '<div class="error-message">AI summary unavailable - Gemini API key not configured</div>';
      }
      return;
    }

    // Check cache first
    const cached = this.loadFromCache(this.cacheKeys.summary);
    const dataHash = this.generateDataHash();
    
    if (cached && cached.dataHash === dataHash && this.isCacheValid(cached.timestamp, 6 * 60 * 60 * 1000)) {
      const summaryContentElement = document.getElementById('summary-content');
      if (summaryContentElement) {
        summaryContentElement.innerHTML = cached.content;
      }
      const lastUpdatedElement = document.getElementById('last-updated');
      if (lastUpdatedElement) {
        lastUpdatedElement.textContent = this.formatTime(new Date(cached.timestamp));
      }
      return;
    }

    // Generate new summary
    await this.generateAISummary();
  }

  async generateAISummary() {
    const summaryContent = document.getElementById('summary-content');
    if (summaryContent) {
      summaryContent.innerHTML = `
        <div class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>Generating AI analysis...</span>
        </div>
      `;
    }

    try {
      const prompt = this.buildEnhancedSummaryPrompt();
      const response = await this.callGeminiAPI(prompt);
      
      if (summaryContent) {
        summaryContent.innerHTML = response;
      }
      const lastUpdatedElement = document.getElementById('last-updated');
      if (lastUpdatedElement) {
        lastUpdatedElement.textContent = this.formatTime(new Date());
      }
      
      // Cache the result
      this.saveToCache(this.cacheKeys.summary, {
        content: response,
        dataHash: this.generateDataHash(),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      if (summaryContent) {
        summaryContent.innerHTML = '<div class="error-message">Failed to generate AI analysis. Please try again.</div>';
      }
    }
  }

  buildEnhancedSummaryPrompt() {
    const recentCommits = this.data.commits.slice(0, 10).map(commit => {
      const message = commit.payload?.commits?.[0]?.message || 'No message';
      return `• ${commit.repo.name}: ${this.truncateText(message, 60)}`;
    }).join('\n');

    const topRepos = this.data.repositories.slice(0, 5).map(repo => 
      `• ${repo.name} (${repo.language || 'N/A'}) - ${repo.stargazers_count} stars`
    ).join('\n');

    const languages = Object.entries(this.data.languageStats)
      .sort(([,a], [,b]) => b.size - a.size)
      .slice(0, 3)
      .map(([lang, data]) => `${lang} (${data.percentage}%)`)
      .join(', ');

    const metrics = this.data.metrics || {};
    const velocity = metrics.velocity || {};
    const streak = metrics.streak || {};

    return `Create a professional developer portfolio summary from this comprehensive GitHub activity data:

RECENT COMMITS (${this.data.commits.length} total):
${recentCommits}

TOP REPOSITORIES:
${topRepos}

DEVELOPMENT METRICS:
• Commits this week: ${velocity.week || 0}
• Commits this month: ${velocity.month || 0}
• Current streak: ${streak.current || 0} days
• Active repositories: ${metrics.repoHealth?.active || 0}

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

  async callGeminiAPI(prompt) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not available');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate summary';
  }

  // Helper methods
  async fetchGitHubData(endpoint) {
    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Monitor/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  }

  getLanguageColor(language) {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'Shell': '#89e051',
      'Vue': '#2c3e50',
      'React': '#61DAFB',
      'C': '#555555',
      'R': '#198CE7',
      'Scala': '#c22d40'
    };
    return colors[language] || '#666666';
  }

  getEventIcon(event) {
    const icons = {
      commit: '📝',
      pr: '🔄',
      issue: '🐛'
    };
    return icons[event.category] || '📋';
  }

  getEventDescription(event) {
    switch (event.category) {
      case 'commit':
        const commitMsg = event.payload?.commits?.[0]?.message || 'Committed changes';
        return this.truncateText(commitMsg, 60);
      case 'pr':
        const action = event.payload?.action || 'updated';
        const prTitle = event.payload?.pull_request?.title || 'Pull request';
        return `${action} PR: ${this.truncateText(prTitle, 50)}`;
      case 'issue':
        const issueAction = event.payload?.action || 'updated';
        const issueTitle = event.payload?.issue?.title || 'Issue';
        return `${issueAction} issue: ${this.truncateText(issueTitle, 50)}`;
      default:
        return 'GitHub activity';
    }
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  generateDataHash() {
    const key = `${this.data.commits.length}-${this.data.repositories.length}-${this.lastUpdate?.getTime() || 0}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  loadFromCache(key) {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return null;
    }
  }

  saveToCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  isCacheValid(timestamp, maxAge) {
    return (Date.now() - timestamp) < maxAge;
  }

  updateConnectionStatus(status, message) {
    const statusDot = document.getElementById('connection-status');
    const statusText = document.getElementById('status-text');
    
    if (statusDot) {
      statusDot.className = `status-dot ${status}`;
    }
    
    if (statusText) {
      statusText.textContent = message;
    }
  }

  updateLastSync() {
    const syncTime = document.getElementById('sync-time');
    if (syncTime) {
      syncTime.textContent = this.formatTime(new Date());
    }
    this.updateNextUpdateTime();
  }

  updateNextUpdateTime() {
    const nextUpdateTime = document.getElementById('next-update-time');
    if (nextUpdateTime && this.autoRefreshEnabled) {
      const nextUpdate = new Date(Date.now() + this.config.refreshInterval);
      nextUpdateTime.textContent = this.formatTime(nextUpdate);
    }
  }

  async manualRefresh() {
    if (this.isLoading) return;
    
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshBtn.style.transform = '';
      }, 500);
    }
    
    await this.loadAllGitHubData();
    this.updateLastSync();
  }

  async regenerateAISummary() {
    await this.generateAISummary();
  }

  filterTimeline(filter) {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  sortRepositories(sortBy) {
    let sortedRepos = [...this.data.repositories];
    
    switch (sortBy) {
      case 'stars':
        sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'forks':
        sortedRepos.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'name':
        sortedRepos.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'size':
        sortedRepos.sort((a, b) => b.size - a.size);
        break;
      default: // updated
        sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    
    this.data.repositories = sortedRepos;
    this.updateRepositories();
  }

  setRepoView(view) {
    const repoGrid = document.getElementById('repo-overview');
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    
    if (view === 'list') {
      repoGrid.classList.add('list-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    } else {
      repoGrid.classList.remove('list-view');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    }
  }

  startAutoRefresh() {
    if (!this.autoRefreshEnabled) return;
    
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      this.loadAllGitHubData().catch(console.error);
    }, this.config.refreshInterval);
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  showError(message) {
    const summaryContent = document.getElementById('summary-content');
    if (summaryContent) {
      summaryContent.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }
}

// Initialize the enhanced monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.githubMonitor = new EnhancedGitHubMonitor();
});

// Add some additional CSS for the new components
const additionalStyles = `
<style>
.velocity-stats, .health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  text-align: center;
}

.velocity-item, .health-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.velocity-number, .health-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
  font-family: var(--font-mono);
}

.velocity-label, .health-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.language-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lang-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.lang-name {
  min-width: 80px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.lang-progress {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.lang-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.lang-percent {
  min-width: 40px;
  text-align: right;
  font-family: var(--font-mono);
  color: var(--text-muted);
  font-size: 0.7rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.timeline-item:hover {
  background: var(--bg-primary);
  margin: 0 -1rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
}

.timeline-icon {
  font-size: 1.2rem;
  min-width: 24px;
}

.timeline-content {
  flex: 1;
}

.timeline-description {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.repo-card {
  cursor: pointer;
  transition: var(--transition-smooth);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.repo-name {
  margin: 0;
  font-size: 1rem;
  color: var(--accent-color);
  font-weight: 500;
}

.repo-stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.repo-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.repo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.repo-language {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
}

.language-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.repo-updated {
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);
