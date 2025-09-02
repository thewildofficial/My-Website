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
    
    this.init();
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
    
    if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Gemini API key not found or is placeholder. AI summaries will be disabled.');
      this.geminiApiKey = null;
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
        await this.generateAISummary(commits, pullRequests, repos);
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

    // Update language stats
    const languages = this.extractLanguages(repos);
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang)
      .join(', ');
    
    document.getElementById('language-stats').textContent = topLanguages || 'Various';
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
        title: commit.payload.commits[0]?.message || 'Commit',
        description: `Pushed to ${commit.repo.name}`,
        time: new Date(commit.created_at),
        url: `https://github.com/${commit.repo.name}/commit/${commit.payload.head}`
      })),
      ...pullRequests.slice(0, 5).map(pr => ({
        type: 'pr',
        title: pr.title,
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
    return `Analyze this GitHub activity and create a concise summary with bullet points. Focus on what this developer is actively working on.

Recent Commits (last 15):
${commits.slice(0, 15).map(c => `• ${c.repo}: ${c.message}`).join('\n')}

Open Pull Requests:
${pullRequests.map(pr => `• ${pr.repo}: ${pr.title}`).join('\n')}

Active Repositories:
${repos.slice(0, 8).map(r => `• ${r.name} (${r.language}): ${r.description || 'No description'}`).join('\n')}

Provide a brief summary with bullet points covering:
• Current focus areas and projects
• Technologies being used
• Recent activity patterns

Keep it concise and use bullet points for easy reading.`;
  }

  async callGeminiAPI(prompt) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`, {
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
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini API response:', data);
        throw new Error('Invalid response from Gemini API');
      }
      
      return data.candidates[0].content.parts[0].text;
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
      </div>
    `;
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