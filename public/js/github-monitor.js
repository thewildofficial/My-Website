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
      console.log('GitHub Monitor: Starting initialization...');
      console.log('GitHub Monitor: Config:', this.config);
      
      await this.loadGeminiApiKey();
      console.log('GitHub Monitor: API key loaded');
      
      await this.loadGitHubData();
      console.log('GitHub Monitor: Data loaded successfully');
      
      this.setupAutoRefresh();
      console.log('GitHub Monitor: Auto-refresh setup complete');
    } catch (error) {
      console.error('Failed to initialize GitHub Monitor:', error);
      this.showError('Failed to initialize GitHub Monitor. Please check your configuration.');
    }
  }

  async loadGeminiApiKey() {
    // API key is never exposed to client-side for security
    // AI summaries are generated server-side via Netlify function
    this.geminiApiKey = null;
    console.log('GitHub Monitor: Using server-side AI generation for security');
  }

  async loadGitHubData() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      console.log('GitHub Monitor: Loading GitHub data...');
      
      // Load all data in parallel
      const [commits, pullRequests, repos, userStats] = await Promise.all([
        this.fetchRecentCommits(),
        this.fetchPullRequests(),
        this.fetchRepositories(),
        this.fetchUserStats()
      ]);

      console.log('GitHub Monitor: Data fetched:', {
        commits: commits.length,
        pullRequests: pullRequests.length,
        repos: repos.length,
        userStats: userStats.login
      });

      this.updateStats(commits, pullRequests, repos, userStats);
      this.updateTimeline(commits, pullRequests);
      this.updateRepoOverview(repos);
      
      // Always use server-side AI generation for security
      console.log('GitHub Monitor: Generating AI summary via server...');
      await this.generateAISummaryWithCache(commits, pullRequests, repos);

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
    try {
      const response = await fetch(
        `${this.config.apiUrl}/users/${this.config.username}/events?per_page=${this.config.maxCommits}`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const events = await response.json();
      return events.filter(event => event.type === 'PushEvent');
    } catch (error) {
      console.error('Error fetching commits:', error);
      throw error;
    }
  }

  async fetchPullRequests() {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/search/issues?q=author:${this.config.username}+type:pr+state:open`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  async fetchRepositories() {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/users/${this.config.username}/repos?sort=updated&per_page=${this.config.maxRepos}`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  async fetchUserStats() {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/users/${this.config.username}`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  updateStats(commits, pullRequests, repos, userStats) {
    console.log('GitHub Monitor: Updating stats...');
    
    // Update commit count
    const commitCount = commits.length;
    const commitElement = document.getElementById('commit-count');
    if (commitElement) {
      commitElement.textContent = commitCount;
      console.log('GitHub Monitor: Updated commit count:', commitCount);
    } else {
      console.error('GitHub Monitor: commit-count element not found');
    }

    // Update PR count
    const prCount = pullRequests.length;
    const prElement = document.getElementById('pr-count');
    if (prElement) {
      prElement.textContent = prCount;
      console.log('GitHub Monitor: Updated PR count:', prCount);
    } else {
      console.error('GitHub Monitor: pr-count element not found');
    }

    // Update repo count
    const repoCount = repos.length;
    const repoElement = document.getElementById('repo-count');
    if (repoElement) {
      repoElement.textContent = repoCount;
      console.log('GitHub Monitor: Updated repo count:', repoCount);
    } else {
      console.error('GitHub Monitor: repo-count element not found');
    }

    // Update language stats with icons
    const languages = this.extractLanguages(repos);
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const languageIcons = this.getLanguageIcons(topLanguages);
    const languageElement = document.getElementById('language-stats');
    if (languageElement) {
      languageElement.innerHTML = languageIcons;
      console.log('GitHub Monitor: Updated language stats');
    } else {
      console.error('GitHub Monitor: language-stats element not found');
    }
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
    console.log('GitHub Monitor: Updating timeline...');
    const timelineContainer = document.getElementById('activity-timeline');
    
    if (!timelineContainer) {
      console.error('GitHub Monitor: activity-timeline element not found');
      return;
    }
    
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

    console.log('GitHub Monitor: Timeline activities:', activities.length);
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
    console.log('GitHub Monitor: Updating repo overview...');
    const repoContainer = document.getElementById('repo-overview');
    
    if (!repoContainer) {
      console.error('GitHub Monitor: repo-overview element not found');
      return;
    }
    
    console.log('GitHub Monitor: Repos to display:', repos.length);
    
    if (repos.length === 0) {
      repoContainer.innerHTML = `
        <div class="no-repos">
          <p>No repositories found</p>
        </div>
      `;
      return;
    }
    
    repoContainer.innerHTML = repos.slice(0, 12).map(repo => `
      <div class="repo-card">
        <div class="repo-header">
          <h3 class="repo-name">
            <a href="${repo.html_url}" target="_blank" rel="noopener">${this.escapeHtml(repo.name)}</a>
          </h3>
          <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count || 0}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count || 0}</span>
          </div>
        </div>
        <div class="repo-description">${this.escapeHtml(repo.description || 'No description available')}</div>
        <div class="repo-languages">
          ${repo.language ? `<span class="language-tag">${this.escapeHtml(repo.language)}</span>` : ''}
        </div>
        <div class="repo-meta">
          <span class="repo-updated">Updated ${this.formatTimeAgo(new Date(repo.updated_at))}</span>
        </div>
      </div>
    `).join('');
    
    console.log('GitHub Monitor: Repo grid updated with', repos.length, 'repositories');
  }

  async generateAISummaryWithCache(commits, pullRequests, repos) {
    console.log('GitHub Monitor: Generating AI summary with cache...');
    const summaryContainer = document.getElementById('summary-content');
    
    if (!summaryContainer) {
      console.error('GitHub Monitor: summary-content element not found');
      return;
    }
    
    // Check if we should regenerate the summary
    if (!this.shouldRegenerateSummary(commits, pullRequests, repos)) {
      console.log('GitHub Monitor: Using cached summary');
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

    console.log('GitHub Monitor: Generating new summary');
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
    summaryContainer.innerHTML = '<div class="loading-spinner">Generating AI summary via server...</div>';

    try {
      // Prepare data for server-side AI analysis
      const githubData = {
        commits: commits.slice(0, 20).map(commit => ({
          message: commit.payload.commits[0]?.message || '',
          repo: commit.repo.name,
          time: commit.created_at,
          payload: commit.payload
        })),
        pullRequests: pullRequests.map(pr => ({
          title: pr.title,
          body: pr.body || '',
          repo: pr.repository_url.split('/').slice(-2).join('/'),
          state: pr.state,
          number: pr.number,
          created_at: pr.created_at
        })),
        repositories: repos.slice(0, 10).map(repo => ({
          name: repo.name,
          description: repo.description || '',
          language: repo.language,
          updated_at: repo.updated_at,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count
        })),
        metrics: {
          velocity: {
            week: commits.filter(c => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(c.created_at) > weekAgo;
            }).length,
            month: commits.filter(c => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(c.created_at) > monthAgo;
            }).length
          },
          streak: {
            current: this.calculateStreak(commits)
          },
          repoHealth: {
            active: repos.filter(r => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(r.updated_at) > monthAgo;
            }).length
          }
        },
        languageStats: this.calculateLanguageStats(repos)
      };

      const summary = await this.callServerSideAI(githubData);
      summaryContainer.innerHTML = `<div class="ai-summary">${summary}</div>`;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Show a fallback summary when server-side AI is not available
      const fallbackSummary = this.generateFallbackSummary(commits, pullRequests, repos);
      summaryContainer.innerHTML = `
        <div class="ai-summary fallback">
          ${fallbackSummary}
          <div class="fallback-notice">
            <small><i class="fas fa-info-circle"></i> Server-side AI temporarily unavailable. Showing basic summary.</small>
          </div>
        </div>
      `;
    }
  }

  async callServerSideAI(githubData) {
    try {
      console.log('GitHub Monitor: Calling server-side AI function...');
      
      // Check if we're in local development
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalDev) {
        console.log('GitHub Monitor: Local development detected, using enhanced AI analysis');
        return this.generateLocalAIAnalysis(githubData);
      }
      
      console.log('GitHub Monitor: Function URL: /.netlify/functions/generate-summary');
      console.log('GitHub Monitor: Data being sent:', {
        commits: githubData.commits.length,
        pullRequests: githubData.pullRequests.length,
        repositories: githubData.repositories.length
      });
      
      const response = await fetch('/.netlify/functions/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubData })
      });

      console.log('GitHub Monitor: Response status:', response.status);
      console.log('GitHub Monitor: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub Monitor: Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('GitHub Monitor: Server-side AI response received');
      return data.summary;
    } catch (error) {
      console.error('Server-side AI call failed:', error);
      throw error;
    }
  }

  calculateStreak(commits) {
    // Simple streak calculation based on recent commits
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCommit = commits.some(commit => 
        commit.created_at.startsWith(dateStr)
      );
      
      if (hasCommit) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculateLanguageStats(repos) {
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    const total = Object.values(languages).reduce((sum, count) => sum + count, 0);
    const languageStats = {};
    
    Object.entries(languages).forEach(([lang, count]) => {
      languageStats[lang] = {
        count,
        percentage: Math.round((count / total) * 100),
        size: count
      };
    });
    
    return languageStats;
  }

  generateFallbackSummary(commits, pullRequests, repos) {
    const recentCommits = commits.slice(0, 5);
    const topLanguages = this.extractLanguages(repos);
    const topLanguagesList = Object.entries(topLanguages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([lang, count]) => `${lang} (${count})`)
      .join(', ');

    const recentRepos = repos.slice(0, 3).map(repo => repo.name).join(', ');

    return `
      <h4>🎯 Current Focus</h4>
      <p>Active development across ${repos.length} repositories with recent commits in ${recentRepos}.</p>
      
      <h4>⚡ Development Velocity</h4>
      <p>${commits.length} recent commits and ${pullRequests.length} open pull requests show consistent development activity.</p>
      
      <h4>🛠️ Technology Stack</h4>
      <p>Primary languages: ${topLanguagesList || 'Various'}</p>
      
      <h4>📈 Growth & Impact</h4>
      <p>Maintaining active development with ${repos.length} repositories and ongoing contributions.</p>
    `;
  }

  generateLocalAIAnalysis(githubData) {
    const { commits, pullRequests, repositories, metrics, languageStats } = githubData;
    
    // Advanced AI-like analysis for local development
    const analysis = this.performAdvancedAnalysis(githubData);
    
    return `
      <h4>🎯 Current Focus</h4>
      <p>${analysis.focus}</p>
      
      <h4>⚡ Development Velocity</h4>
      <p>${analysis.velocity}</p>
      
      <h4>🛠️ Technology Stack</h4>
      <p>${analysis.technologies}</p>
      
      <h4>📈 Growth & Impact</h4>
      <p>${analysis.impact}</p>
      
      <div class="ai-analysis-meta">
        <small><i class="fas fa-robot"></i> Local AI Analysis • ${new Date().toLocaleTimeString()}</small>
      </div>
    `;
  }

  performAdvancedAnalysis(githubData) {
    const { commits, pullRequests, repositories, metrics, languageStats } = githubData;
    
    // Analyze commit patterns
    const commitAnalysis = this.analyzeCommitPatterns(commits.map(c => c.message));
    const timeAnalysis = this.analyzeTimePatterns(commits);
    const repoAnalysis = this.analyzeRepositoryHealth(repositories);
    const languageAnalysis = this.analyzeLanguageUsage(languageStats);
    
    // Generate intelligent insights
    const focus = this.generateFocusInsight(commitAnalysis, repoAnalysis);
    const velocity = this.generateVelocityInsight(metrics, timeAnalysis);
    const technologies = this.generateTechnologyInsight(languageAnalysis, repositories);
    const impact = this.generateImpactInsight(pullRequests, repositories, metrics);
    
    return { focus, velocity, technologies, impact };
  }

  analyzeTimePatterns(commits) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeek = commits.filter(c => new Date(c.time) > weekAgo).length;
    const thisMonth = commits.filter(c => new Date(c.time) > monthAgo).length;
    
    // Analyze commit times
    const commitHours = commits.map(c => new Date(c.time).getHours());
    const peakHour = this.getMostFrequent(commitHours);
    
    return {
      thisWeek,
      thisMonth,
      peakHour,
      trend: thisWeek > thisMonth / 4 ? 'increasing' : 'stable'
    };
  }

  analyzeRepositoryHealth(repositories) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const active = repositories.filter(r => new Date(r.updated_at) > weekAgo).length;
    const totalStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
    
    return {
      active,
      total: repositories.length,
      totalStars,
      totalForks,
      healthScore: Math.min(100, (active / repositories.length) * 100)
    };
  }

  analyzeLanguageUsage(languageStats) {
    const languages = Object.entries(languageStats)
      .sort(([,a], [,b]) => b.size - a.size);
    
    const primary = languages[0];
    const diversity = languages.length;
    
    return {
      primary: primary ? `${primary[0]} (${primary[1].percentage}%)` : 'Various',
      diversity,
      languages: languages.slice(0, 3).map(([lang, data]) => `${lang} (${data.percentage}%)`).join(', ')
    };
  }

  generateFocusInsight(commitAnalysis, repoAnalysis) {
    const { focus, features, fixes, refactoring } = commitAnalysis;
    const { active, healthScore } = repoAnalysis;
    
    let insight = `Actively developing across ${repoAnalysis.total} repositories with ${active} showing recent activity. `;
    
    if (features > fixes && features > refactoring) {
      insight += "Strong focus on feature development and innovation.";
    } else if (fixes > features) {
      insight += "Prioritizing stability and bug resolution.";
    } else if (refactoring > features) {
      insight += "Emphasizing code quality and technical debt reduction.";
    } else {
      insight += "Balanced approach to development.";
    }
    
    if (healthScore > 80) {
      insight += " Excellent repository maintenance.";
    } else if (healthScore > 60) {
      insight += " Good repository health.";
    } else {
      insight += " Room for improved repository activity.";
    }
    
    return insight;
  }

  generateVelocityInsight(metrics, timeAnalysis) {
    const { thisWeek, thisMonth, peakHour, trend } = timeAnalysis;
    const { velocity, streak } = metrics;
    
    let insight = `${thisWeek} commits this week, ${thisMonth} this month. `;
    
    if (trend === 'increasing') {
      insight += "Productivity is trending upward. ";
    } else {
      insight += "Consistent development pace. ";
    }
    
    if (streak.current > 7) {
      insight += `Impressive ${streak.current}-day commit streak shows strong dedication. `;
    } else if (streak.current > 3) {
      insight += `${streak.current}-day streak indicates good consistency. `;
    } else {
      insight += "Building momentum with recent activity. ";
    }
    
    if (peakHour >= 9 && peakHour <= 17) {
      insight += "Peak productivity during business hours.";
    } else if (peakHour >= 18 || peakHour <= 6) {
      insight += "Active during evening/night hours.";
    } else {
      insight += "Flexible development schedule.";
    }
    
    return insight;
  }

  generateTechnologyInsight(languageAnalysis, repositories) {
    const { primary, diversity, languages } = languageAnalysis;
    const hasPopularRepos = repositories.some(r => r.stargazers_count > 10);
    
    let insight = `Primary language: ${primary}. `;
    
    if (diversity > 5) {
      insight += "Highly diverse technology stack with ";
    } else if (diversity > 3) {
      insight += "Well-rounded technology stack including ";
    } else {
      insight += "Focused technology stack with ";
    }
    
    insight += languages;
    
    if (hasPopularRepos) {
      insight += ". Strong community engagement with popular repositories.";
    } else {
      insight += ". Building towards community recognition.";
    }
    
    return insight;
  }

  generateImpactInsight(pullRequests, repositories, metrics) {
    const { repoHealth } = metrics;
    const totalStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
    
    let insight = `${pullRequests.length} open pull requests show active collaboration. `;
    
    if (totalStars > 100) {
      insight += `Strong community impact with ${totalStars} total stars. `;
    } else if (totalStars > 10) {
      insight += `Growing community engagement with ${totalStars} stars. `;
    } else {
      insight += "Building community presence. ";
    }
    
    if (totalForks > 20) {
      insight += `${totalForks} forks indicate valuable contributions. `;
    } else if (totalForks > 5) {
      insight += `${totalForks} forks show growing influence. `;
    }
    
    insight += `${repoHealth.active} repositories actively maintained.`;
    
    return insight;
  }

  getMostFrequent(arr) {
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    let max = 0;
    let mostFrequent = 0;
    Object.entries(frequency).forEach(([key, value]) => {
      if (value > max) {
        max = value;
        mostFrequent = parseInt(key);
      }
    });
    
    return mostFrequent;
  }

  analyzeCommitPatterns(messages) {
    const patterns = {
      features: 0,
      fixes: 0,
      refactoring: 0,
      documentation: 0,
      focus: ''
    };

    messages.forEach(message => {
      const lower = message.toLowerCase();
      if (lower.includes('feat') || lower.includes('add') || lower.includes('implement')) patterns.features++;
      if (lower.includes('fix') || lower.includes('bug') || lower.includes('issue')) patterns.fixes++;
      if (lower.includes('refactor') || lower.includes('clean') || lower.includes('optimize')) patterns.refactoring++;
      if (lower.includes('doc') || lower.includes('readme') || lower.includes('comment')) patterns.documentation++;
    });

    // Determine focus based on patterns
    if (patterns.features > patterns.fixes && patterns.features > patterns.refactoring) {
      patterns.focus = 'Focus on feature development and new functionality';
    } else if (patterns.fixes > patterns.features) {
      patterns.focus = 'Emphasizing bug fixes and issue resolution';
    } else if (patterns.refactoring > patterns.features) {
      patterns.focus = 'Prioritizing code quality and refactoring';
    } else {
      patterns.focus = 'Balanced development approach';
    }

    return patterns;
  }


  showSummaryPlaceholder() {
    console.log('GitHub Monitor: Showing summary placeholder');
    const summaryContainer = document.getElementById('summary-content');
    
    if (!summaryContainer) {
      console.error('GitHub Monitor: summary-content element not found for placeholder');
      return;
    }
    
    summaryContainer.innerHTML = `
      <div class="summary-placeholder">
        <p>AI-powered summaries are generated server-side for security.</p>
        <p>If this message persists, the server-side AI service may be unavailable.</p>
        <button onclick="githubMonitor.retrySummary()" class="btn">Retry Summary</button>
      </div>
    `;
  }

  retrySummary() {
    console.log('GitHub Monitor: Retrying summary generation...');
    this.loadGitHubData();
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

// Polyfill for requestIdleCallback if not available
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback) {
    return setTimeout(callback, 1);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('GitHub Monitor: DOM loaded, initializing...');
  githubMonitor = new GitHubMonitor();
});