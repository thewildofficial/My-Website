'use strict';

/**
 * GitHub Monitor – Deep analytics dashboard with AI insights.
 * Fetches expanded GitHub data, renders visualisations, and integrates AI summaries.
 */
class GitHubMonitor {
  constructor() {
    const fallbackConfig = {
      username: 'thewildofficial',
      apiUrl: 'https://api.github.com',
      refreshInterval: 300000,
      maxCommits: 60,
      maxRepos: 24,
      maxIssues: 50,
      cacheExpiryMinutes: 30,
      orgs: []
    };

    this.config = Object.assign({}, fallbackConfig, window.GITHUB_CONFIG || {});
    this.cacheKey = `github-monitor::${this.config.username}`;
    this.cacheTTL = (this.config.cacheExpiryMinutes || 30) * 60 * 1000;

    this.state = {
      profile: null,
      repos: [],
      repoLanguages: { byRepo: {}, totals: {} },
      pullRequests: [],
      issues: { open: 0, closed: 0, samples: { open: [], closed: [] } },
      metrics: {},
      activity: {
        commitsLast7: 0,
        commitsLast30: 0,
        weeklySeries: [],
        heatmap: [],
        streak: { current: 0, longest: 0 },
        recent: []
      },
      insights: {},
      organizations: []
    };

    this.charts = {};
    this.aiState = { isGenerating: false, lastSummary: null, timestamp: null };
    this.isLoading = false;
    
    this.init();
  }

  async init() {
      this.setupEventListeners();
    this.updateStatus('loading', 'Loading…');
    console.log('GitHub Monitor initializing with config:', {
      username: this.config.username,
      apiUrl: this.config.apiUrl,
      orgs: this.config.orgs
    });

    try {
      await this.loadData();
      this.updateStatus('online', 'Connected');
    } catch (error) {
      console.error('GitHub monitor failed to initialise', error);
      this.updateStatus('offline', 'Connection failed');
      this.showError(`Unable to load GitHub analytics: ${error.message || 'Unknown error'}. Please check the console for details.`);
    }
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData({ force: true }));
    }

    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    if (gridBtn) {
      gridBtn.addEventListener('click', () => this.setView('grid'));
    }
    if (listBtn) {
      listBtn.addEventListener('click', () => this.setView('list'));
    }

    const aiRefreshBtn = document.getElementById('ai-refresh-btn');
    if (aiRefreshBtn) {
      aiRefreshBtn.addEventListener('click', () => this.generateAIInsights({ force: true }));
    }

    const aiCopyBtn = document.getElementById('ai-copy-btn');
    if (aiCopyBtn) {
      aiCopyBtn.addEventListener('click', () => this.copyAIInsights());
    }
  }

  updateStatus(status, text) {
    const dot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (dot) {
      dot.className = `status-dot ${status}`;
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  loadCache() {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp || !parsed.payload) return null;

      if (Date.now() - parsed.timestamp > this.cacheTTL) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }

      return parsed.payload;
    } catch (error) {
      console.warn('Unable to read cached GitHub data', error);
      return null;
    }
  }

  saveCache(payload) {
    try {
      const data = {
        timestamp: Date.now(),
        payload
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Unable to cache GitHub data', error);
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.warn('Unable to clear GitHub cache', error);
    }
  }

  async loadData(options = {}) {
    if (this.isLoading) return;
    this.isLoading = true;

    const forceRefresh = Boolean(options.force);
    if (forceRefresh) {
      this.clearCache();
      this.updateStatus('loading', 'Refreshing…');
    }

    try {
      const cached = !forceRefresh ? this.loadCache() : null;
      if (cached) {
        this.state = this.normaliseState(cached);
        this.renderAll({ fromCache: true });
      }

      const fresh = await this.fetchDashboardData();
      this.state = fresh;
      this.saveCache(fresh);
      this.renderAll({ fromCache: false });
      await this.generateAIInsights();
      this.updateStatus('online', 'Updated');
    } catch (error) {
      console.error('Failed to load GitHub data', error);
      this.updateStatus('offline', 'Error');
      this.showError(error.message || 'Unable to fetch GitHub data.');
    } finally {
      this.isLoading = false;
    }
  }

  async fetchDashboardData() {
    const payload = {
      username: this.config.username,
      orgs: Array.isArray(this.config.orgs) ? this.config.orgs : [],
      options: { rangeDays: 90 }
    };

    try {
      const response = await fetch('/.netlify/functions/github-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // If 404, fall back to direct API calls (local dev without netlify dev)
        if (response.status === 404) {
          console.warn('Netlify function not available, falling back to direct GitHub API');
          return await this.fetchAllData();
        }
        
        let errorMessage = `Server error ${response.status}`;
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.details || errorJson.error || errorMessage;
        } catch {
          // ignore parse failure
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.normaliseState(data);
    } catch (error) {
      // Network errors or other failures - fall back to direct API
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('Netlify function unavailable, using direct GitHub API fallback');
        return await this.fetchAllData();
      }
      throw error;
    }
  }

  normaliseState(data = {}) {
    const defaults = {
      profile: null,
      repos: [],
      repoLanguages: { byRepo: {}, totals: {} },
      pullRequests: [],
      issues: { open: 0, closed: 0, samples: { open: [], closed: [] } },
      metrics: {
        counts: {
          repos: 0,
          stars: 0,
          forks: 0,
          followers: 0,
          following: 0,
          openPRs: 0,
          languages: 0,
          issuesOpen: 0,
          issuesClosed: 0
        },
        velocity: { week: 0, month: 0 },
        streak: { current: 0, longest: 0 },
        repoHealth: { labels: [], datasets: [] },
        languageStats: { totalBytes: 0, totalLanguages: 0, languages: [], primary: [], secondary: [] },
        contributionTotals: { commits: 0, issues: 0, pullRequests: 0, reviews: 0 }
      },
      insights: {},
      organizations: [],
      contributionTotals: { commits: 0, issues: 0, pullRequests: 0, reviews: 0 },
      activity: {
        commitsLast7: 0,
        commitsLast30: 0,
        weeklySeries: [],
        heatmap: [],
        streak: { current: 0, longest: 0 },
        recent: []
      }
    };

    const next = {
      profile: data.profile || defaults.profile,
      repos: Array.isArray(data.repos) ? data.repos : defaults.repos,
      repoLanguages: data.repoLanguages || defaults.repoLanguages,
      pullRequests: Array.isArray(data.pullRequests) ? data.pullRequests : defaults.pullRequests,
      issues: data.issues || defaults.issues,
      metrics: Object.assign({}, defaults.metrics, data.metrics || {}),
      insights: data.insights || defaults.insights,
      organizations: Array.isArray(data.organizations) ? data.organizations : defaults.organizations,
      contributionTotals: data.contributionTotals || defaults.contributionTotals,
      activity: Object.assign({}, defaults.activity, data.activity || {})
    };

    next.activity.heatmap = this.ensureHeatmapLevels(next.activity.heatmap);
    next.activity.recent = this.sortActivities(next.activity.recent);

    return next;
  }

  ensureHeatmapLevels(heatmap = []) {
    if (!Array.isArray(heatmap)) return [];
    return heatmap.map(entry => {
      const count = entry.count || 0;
      const date = entry.date ? new Date(entry.date) : new Date();
      return Object.assign({}, entry, {
        count,
        level: entry.level !== undefined ? entry.level : this.heatmapLevel(count),
        label: entry.label || date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        date: date.toISOString()
      });
    });
  }

  sortActivities(activities = []) {
    if (!Array.isArray(activities)) return [];
    return activities
      .map(item => Object.assign({}, item, {
        description: item.description || '',
        metadata: item.metadata || {}
      }))
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }

  async fetchAllData() {
    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled([
      this.fetchProfile().catch(err => {
        console.error('Failed to fetch profile:', err);
        return null;
      }),
      this.fetchRepositories().catch(err => {
        console.error('Failed to fetch repositories:', err);
        return [];
      }),
      this.fetchPullRequests().catch(err => {
        console.error('Failed to fetch pull requests:', err);
        return [];
      }),
      this.fetchIssues().catch(err => {
        console.error('Failed to fetch issues:', err);
        return { open: 0, closed: 0, samples: { open: [], closed: [] } };
      }),
      this.fetchActivity().catch(err => {
        console.error('Failed to fetch activity:', err);
        return {
          commitsLast7: 0,
          commitsLast30: 0,
          dailyCounts: new Map(),
          weeklySeries: [],
          heatmap: [],
          streak: { current: 0, longest: 0 },
          repoVelocity: new Map(),
          recent: []
        };
      })
    ]);

    const profile = results[0].status === 'fulfilled' ? results[0].value : null;
    const repos = results[1].status === 'fulfilled' ? results[1].value : [];
    const pullRequests = results[2].status === 'fulfilled' ? results[2].value : [];
    const issues = results[3].status === 'fulfilled' ? results[3].value : { open: 0, closed: 0, samples: { open: [], closed: [] } };
    const activity = results[4].status === 'fulfilled' ? results[4].value : {
      commitsLast7: 0,
      commitsLast30: 0,
      dailyCounts: new Map(),
      weeklySeries: [],
      heatmap: [],
      streak: { current: 0, longest: 0 },
      repoVelocity: new Map(),
      recent: []
    };

    if (!profile) {
      throw new Error('Unable to fetch GitHub profile. Please check your username and try again.');
    }

    const repoLanguages = await this.fetchRepoLanguages(repos).catch(err => {
      console.error('Failed to fetch repo languages:', err);
      return { byRepo: {}, totals: {} };
    });

    const metrics = this.computeMetrics({ profile, repos, pullRequests, issues, activity, repoLanguages });
    const insights = this.buildInsights({ profile, repos, metrics, activity });

    // Format to match normaliseState expectations
    return this.normaliseState({
      profile,
      repos,
      pullRequests,
      issues,
      repoLanguages,
      metrics,
      insights,
      organizations: [],
      contributionTotals: {
        commits: activity.commitsLast30 || 0,
        issues: (issues.open || 0) + (issues.closed || 0),
        pullRequests: pullRequests.length,
        reviews: 0
      },
      activity: {
        commitsLast7: activity.commitsLast7 || 0,
        commitsLast30: activity.commitsLast30 || 0,
        weeklySeries: activity.weeklySeries || [],
        heatmap: activity.heatmap || [],
        streak: activity.streak || { current: 0, longest: 0 },
        recent: activity.recent || []
      }
    });
  }

  async fetchProfile() {
    const url = `${this.config.apiUrl}/users/${this.config.username}`;
    console.log('Fetching profile from:', url);
    const profile = await this.apiFetch(url);
    console.log('Profile fetched:', profile?.login || 'No login found');

    return {
      login: profile.login,
      name: profile.name || profile.login,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
      company: profile.company,
      location: profile.location,
      blog: profile.blog,
      twitter_username: profile.twitter_username
    };
  }

  async fetchRepositories() {
    const perPage = Math.min(Math.max(this.config.maxRepos || 20, 1), 100);
    const url = `${this.config.apiUrl}/users/${this.config.username}/repos?sort=updated&direction=desc&per_page=${perPage}&type=owner`;
    const repos = await this.apiFetch(url);

    return repos
      .filter(repo => !repo.fork)
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        topics: repo.topics || [],
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
        size: repo.size,
        archived: repo.archived,
        default_branch: repo.default_branch,
        license: repo.license?.spdx_id || repo.license?.name || null,
        pushed_at: repo.pushed_at,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        homepage: repo.homepage
      }));
  }

  async fetchRepoLanguages(repos) {
    const results = {};
    const totals = {};

    for (const repo of repos) {
      try {
        const url = `${this.config.apiUrl}/repos/${repo.full_name}/languages`;
        const languages = await this.apiFetch(url);
        results[repo.full_name] = languages;

        Object.entries(languages || {}).forEach(([language, bytes]) => {
          totals[language] = (totals[language] || 0) + bytes;
        });
      } catch (error) {
        console.warn(`Unable to fetch languages for ${repo.full_name}`, error);
      }
    }

    return { byRepo: results, totals };
  }

  async fetchPullRequests() {
    const query = encodeURIComponent(`author:${this.config.username} type:pr state:open`);
    const url = `${this.config.apiUrl}/search/issues?q=${query}&per_page=30`;
    const response = await this.apiFetch(url);
    return (response.items || []).map(item => ({
      id: item.id,
      title: item.title,
      state: item.state,
      html_url: item.html_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
      repository_url: item.repository_url
    }));
  }

  async fetchIssues() {
    const maxIssues = Math.min(Math.max(this.config.maxIssues || 50, 1), 100);
    const openQuery = encodeURIComponent(`author:${this.config.username} type:issue state:open`);
    const closedQuery = encodeURIComponent(`author:${this.config.username} type:issue state:closed`);

    const [openResponse, closedResponse] = await Promise.all([
      this.apiFetch(`${this.config.apiUrl}/search/issues?q=${openQuery}&per_page=${maxIssues}`),
      this.apiFetch(`${this.config.apiUrl}/search/issues?q=${closedQuery}&per_page=${maxIssues}`)
    ]);

    return {
      open: openResponse.total_count || 0,
      closed: closedResponse.total_count || 0,
      samples: {
        open: (openResponse.items || []).slice(0, 10),
        closed: (closedResponse.items || []).slice(0, 10)
      }
    };
  }

  async fetchActivity() {
    const perPage = Math.min(Math.max(this.config.maxCommits || 60, 10), 300);
    const url = `${this.config.apiUrl}/users/${this.config.username}/events?per_page=${perPage}`;
    const events = await this.apiFetch(url);

    const dailyCounts = new Map();
    const repoVelocity = new Map();
    const recent = [];
    let commitsLast7 = 0;
    let commitsLast30 = 0;

    const now = new Date();

    events.forEach(event => {
      const createdAt = new Date(event.created_at);
      const dateKey = createdAt.toISOString().slice(0, 10);

      if (!dailyCounts.has(dateKey)) {
        dailyCounts.set(dateKey, 0);
      }

      const repoName = event.repo?.name || 'unknown';
      if (!repoVelocity.has(repoName)) {
        repoVelocity.set(repoName, 0);
      }

      switch (event.type) {
        case 'PushEvent': {
          const commitCount = event.payload?.commits?.length || 0;
          dailyCounts.set(dateKey, dailyCounts.get(dateKey) + commitCount);
          repoVelocity.set(repoName, repoVelocity.get(repoName) + commitCount);

          const daysAgo = (now - createdAt) / 86400000;
          if (daysAgo <= 7) commitsLast7 += commitCount;
          if (daysAgo <= 30) commitsLast30 += commitCount;

          // Only add commits if there are meaningful messages
          // Prioritize PRs/issues over commits
          if (commitCount > 0) {
            const firstCommit = event.payload.commits[0];
            const message = firstCommit?.message || '';
            // Extract first line of commit message (before \n)
            const firstLine = message.split('\n')[0].trim();
            
            // Only add if message is meaningful (not just "Update" or empty)
            if (firstLine && firstLine.length > 5 && !firstLine.match(/^(update|fix|bump|merge|wip)/i)) {
              recent.push({
                type: 'commit',
                title: this.truncate(firstLine, 80),
                description: message.length > firstLine.length ? this.truncate(message.split('\n').slice(1).join(' '), 200) : '',
                repo: repoName,
                time: createdAt,
                url: `https://github.com/${repoName}/commit/${firstCommit?.sha || event.payload?.head || event.id}`,
                sha: firstCommit?.sha,
                metadata: {
                  commitCount: commitCount > 1 ? commitCount : undefined
                }
              });
            }
          }
          break;
        }
        case 'PullRequestEvent': {
          const pr = event.payload?.pull_request;
          const action = event.payload?.action || 'updated';
          
          if (pr) {
            recent.push({
              type: 'pr',
              title: pr.title || `PR #${pr.number || event.payload?.number || ''}`,
              description: pr.body ? this.truncate(pr.body, 200) : '',
              repo: repoName,
              time: createdAt,
              url: pr.html_url || `https://github.com/${repoName}/pull/${pr.number}`,
              metadata: {
                state: pr.state,
                number: pr.number,
                merged: pr.merged || false,
                additions: pr.additions,
                deletions: pr.deletions,
                filesChanged: pr.changed_files
              }
            });
          } else {
            // Fallback if PR data not available
            recent.push({
              type: 'pr',
              title: `${this.capitalize(action)} PR #${event.payload?.number || ''}`,
              repo: repoName,
              time: createdAt,
              url: `https://github.com/${repoName}`
            });
          }
          break;
        }
        case 'IssuesEvent': {
          const issue = event.payload?.issue;
          const action = event.payload?.action || 'updated';
          
          if (issue) {
            recent.push({
              type: 'issue',
              title: issue.title || `Issue #${issue.number || ''}`,
              description: issue.body ? this.truncate(issue.body, 200) : '',
              repo: repoName,
              time: createdAt,
              url: issue.html_url || `https://github.com/${repoName}/issues/${issue.number}`,
              metadata: {
                state: issue.state,
                number: issue.number
              }
            });
          } else {
            // Fallback
            recent.push({
              type: 'issue',
              title: `${this.capitalize(action)} issue #${event.payload?.issue?.number || ''}`,
              repo: repoName,
              time: createdAt,
              url: `https://github.com/${repoName}`
            });
          }
          break;
        }
        default:
          break;
      }
    });

    const heatmap = this.buildHeatmap(dailyCounts);
    const weeklySeries = this.buildWeeklySeries(dailyCounts);
    const streak = this.calculateStreaks(heatmap);

    // Sort by priority: PRs/Issues first, then commits, then by time
    recent.sort((a, b) => {
      const typePriority = { pr: 3, issue: 2, commit: 1 };
      const aPriority = typePriority[a.type] || 0;
      const bPriority = typePriority[b.type] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.time - a.time;
    });

    // Limit to top items (prioritize PRs/issues, show fewer commits)
    const prioritized = recent
      .filter(item => item.type === 'pr' || item.type === 'issue')
      .slice(0, 15);
    
    const commits = recent
      .filter(item => item.type === 'commit')
      .slice(0, 10);

    return {
      commitsLast7,
      commitsLast30,
      dailyCounts,
      weeklySeries,
      heatmap,
      streak,
      repoVelocity,
      recent: [...prioritized, ...commits]
    };
  }

  computeMetrics({ profile, repos, pullRequests, issues, activity, repoLanguages }) {
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const languageStats = this.calculateLanguageStats(repoLanguages.totals);
    const repoHealth = this.calculateRepoHealth(repos, activity.repoVelocity, issues);

    return {
      counts: {
        repos: repos.length,
        stars: totalStars,
        forks: totalForks,
        followers: profile?.followers || 0,
        following: profile?.following || 0,
        openPRs: pullRequests.length,
        languages: languageStats.totalLanguages,
        issuesOpen: issues.open,
        issuesClosed: issues.closed
      },
      velocity: {
        week: activity.commitsLast7,
        month: activity.commitsLast30,
        weeklySeries: activity.weeklySeries
      },
      streak: activity.streak,
      repoHealth,
      languageStats,
      activity
    };
  }

  calculateLanguageStats(totals) {
    const entries = Object.entries(totals);
    const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

    const languages = entries
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes ? Math.round((bytes / totalBytes) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const primary = languages.slice(0, 5);
    const secondary = languages.slice(5, 10);

    return {
      totalBytes,
      totalLanguages: languages.length,
      languages,
      primary,
      secondary
    };
  }

  calculateRepoHealth(repos, repoVelocity, issues) {
    const topRepos = repos.slice(0, 5);
    const datasets = [];

    const maxStars = Math.max(...repos.map(repo => repo.stargazers_count || 0), 1);
    const maxForks = Math.max(...repos.map(repo => repo.forks_count || 0), 1);
    const maxIssues = Math.max(...repos.map(repo => repo.open_issues_count || 0), 1);
    const maxVelocity = Math.max(...Array.from(repoVelocity.values()), 1);

    topRepos.forEach(repo => {
      const velocity = repoVelocity.get(repo.full_name) || 0;
      const freshnessDays = this.daysBetween(new Date(repo.pushed_at), new Date());

      datasets.push({
        label: repo.name,
        data: [
          this.scaleValue(velocity, maxVelocity),
          this.scaleValue(repo.stargazers_count || 0, maxStars),
          100 - this.scaleValue(repo.open_issues_count || 0, maxIssues),
          Math.max(0, 100 - freshnessDays)
        ]
      });
    });

    return {
      labels: ['Activity', 'Stars', 'Issue Hygiene', 'Freshness'],
      datasets,
      summary: {
        totalOpenIssues: issues.open,
        totalClosedIssues: issues.closed
      }
    };
  }

  buildInsights({ profile, repos, metrics, activity }) {
    const focusRepo = repos[0];
    const primaryLanguage = metrics.languageStats.primary?.[0];
    const velocityTrend = this.describeVelocityTrend(metrics.velocity.weeklySeries);

    return {
      focus: {
        title: focusRepo ? focusRepo.name : 'Exploration in progress',
        description: focusRepo
          ? `Most recent focus on ${focusRepo.name}, updated ${this.formatTimeAgo(new Date(focusRepo.pushed_at))}.`
          : 'No active repositories detected yet.'
      },
      velocity: {
        summary: velocityTrend,
        week: metrics.velocity.week,
        month: metrics.velocity.month,
        streak: metrics.streak
      },
      stack: {
        primary: primaryLanguage?.language || 'Unknown',
        distribution: metrics.languageStats.primary,
        description: primaryLanguage
          ? `${primaryLanguage.language} dominates with ${primaryLanguage.percentage}% of code volume.`
          : 'Language usage not available.'
      },
      audience: {
        followers: profile?.followers || 0,
        following: profile?.following || 0,
        repos: metrics.counts.repos
      }
    };
  }

  renderAll({ fromCache = false } = {}) {
    this.renderProfile();
    this.renderInsights();
      this.renderMetrics();
    this.renderLanguageSummary();
      this.renderLanguages();
    this.renderCharts();
    this.renderHeatmap();
      this.renderActivity();
      this.renderRepositories();
      
    if (!fromCache) {
      this.toast('Dashboard refreshed with latest GitHub activity.');
    }
  }

  renderProfile() {
    const profile = this.state.profile;
    if (!profile) return;

    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      avatarEl.classList.remove('skeleton');
      avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="${this.escapeHtml(profile.name)} avatar">`;
    }

    const nameEl = document.getElementById('profile-name');
    if (nameEl) {
      nameEl.classList.remove('skeleton');
      nameEl.textContent = profile.name;
    }

    const handleEl = document.getElementById('profile-handle');
    if (handleEl) {
      handleEl.textContent = `@${profile.login}`;
    }

    const bioEl = document.getElementById('profile-bio');
    if (bioEl) {
      bioEl.classList.remove('skeleton');
      bioEl.textContent = profile.bio || 'Tracking live GitHub activity and insights.';
    }

    const metaEl = document.getElementById('profile-meta');
    if (metaEl) {
      const pieces = [
        this.renderMetaIconStat('Followers', profile.followers, 'users'),
        this.renderMetaIconStat('Following', profile.following, 'user-check'),
        this.renderMetaIconStat('Public Repos', profile.public_repos, 'folder')
      ];
      if (profile.location) {
        pieces.push(this.renderMetaIconStat(profile.location, '', 'map-pin'));
      }
      metaEl.innerHTML = pieces.join('');
    }

    const tagsEl = document.getElementById('profile-tags');
    if (tagsEl) {
      const tags = [];
      if (profile.company) tags.push(profile.company);
      if (profile.blog) tags.push('blog');
      if (profile.twitter_username) tags.push(`@${profile.twitter_username}`);
      (this.state.organizations || []).slice(0, 3).forEach(org => {
        tags.push(org.name || org.login);
      });
      if (tags.length === 0) tags.push('Independent');

      tagsEl.innerHTML = tags
        .map(tag => `<span class="profile-tag">${this.escapeHtml(tag)}</span>`)
        .join('');
    }
  }

  renderInsights() {
    const { insights } = this.state;
    const focusTitle = document.getElementById('insight-focus-title');
    const focusDescription = document.getElementById('insight-focus-description');
    const velocityValue = document.getElementById('insight-velocity');
    const velocityDescription = document.getElementById('insight-velocity-description');
    const stackValue = document.getElementById('insight-stack');
    const stackDescription = document.getElementById('insight-stack-description');

    if (focusTitle) focusTitle.textContent = insights.focus?.title || '--';
    if (focusDescription) focusDescription.textContent = insights.focus?.description || '';

    if (velocityValue) {
      velocityValue.textContent = `${insights.velocity?.week || 0} / 7d`;
    }
    if (velocityDescription) {
      const streak = insights.velocity?.streak?.current || 0;
      velocityDescription.textContent = insights.velocity?.summary
        ? `${insights.velocity.summary} • Current streak ${streak} days`
        : 'Consistent activity insights will appear here.';
    }

    if (stackValue) {
      stackValue.textContent = insights.stack?.primary || '--';
    }
    if (stackDescription) {
      stackDescription.textContent = insights.stack?.description || '';
    }
  }

  renderMetrics() {
    const { metrics } = this.state;
    const entries = [
      ['repo-count', metrics.counts?.repos],
      ['commit-count', metrics.velocity?.month],
      ['pr-count', metrics.counts?.openPRs],
      ['language-count', metrics.counts?.languages],
      ['stars-count', metrics.counts?.stars],
      ['forks-count', metrics.counts?.forks],
      ['followers-count', metrics.counts?.followers],
      ['following-count', metrics.counts?.following],
      ['issues-open-count', metrics.counts?.issuesOpen],
      ['issues-closed-count', metrics.counts?.issuesClosed],
      ['streak-current', metrics.streak?.current],
      ['streak-longest', metrics.streak?.longest]
    ];

    entries.forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value !== undefined) {
        el.textContent = value;
      }
    });

    const commitTrend = document.getElementById('commit-trend');
    if (commitTrend) {
      commitTrend.innerHTML = this.renderTrend(
        metrics.velocity?.weeklySeries,
        'Commits momentum over 12 weeks'
      );
    }

    const starsTrend = document.getElementById('stars-trend');
    if (starsTrend) {
      starsTrend.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="21 17 21 7 11 7"/></svg> ${metrics.counts?.stars || 0} total stars`;
    }

    const issuesTrend = document.getElementById('issues-trend');
    if (issuesTrend) {
      issuesTrend.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 7 9 13 13 9 21 17"/><polyline points="21 7 21 17 11 17"/></svg> ${metrics.counts?.issuesClosed || 0} closed historically`;
    }
  }

  renderLanguageSummary() {
    const container = document.getElementById('language-summary');
    if (!container) return;

    const stats = this.state.metrics.languageStats;
    if (!stats || stats.languages.length === 0) {
      container.innerHTML = '<div class="empty-state">No language data available.</div>';
      return;
    }

    const top = stats.primary;
    const listItems = top
      .map(lang => `<div class="language-badge">
        <span class="language-dot" style="background-color: ${this.getLanguageColor(lang.language)}"></span>
        <span>${this.escapeHtml(lang.language)}</span>
        <span style="opacity: 0.6;">${lang.percentage}%</span>
      </div>`)
      .join('');

    container.innerHTML = `
      <p class="insight-description">Language stack spans ${stats.totalLanguages} technologies with ${top[0]?.language || 'n/a'} leading.</p>
      <div>${listItems}</div>
    `;
  }

  renderLanguages() {
    const container = document.getElementById('languages-container');
    if (!container) return;
    
    const stats = this.state.metrics.languageStats;
    if (!stats || stats.languages.length === 0) {
      container.innerHTML = '<div class="empty-state">No languages found</div>';
      return;
    }

    container.innerHTML = stats.languages
      .map(lang => `
        <div class="language-badge">
          <span class="language-dot" style="background-color: ${this.getLanguageColor(lang.language)}"></span>
          <span>${this.escapeHtml(lang.language)}</span>
          <span style="opacity: 0.6;">${lang.percentage}%</span>
        </div>
      `)
      .join('');
  }

  renderCharts() {
    if (typeof window.Chart === 'undefined') {
      setTimeout(() => this.renderCharts(), 400);
      return;
    }
    
    this.renderLanguageChart();
    this.renderVelocityChart();
    this.renderRepoHealthChart();
  }

  renderLanguageChart() {
    const ctx = document.getElementById('language-chart');
    if (!ctx) return;

    const stats = this.state.metrics.languageStats;
    const data = stats.primary.length > 0 ? stats.primary : stats.languages.slice(0, 6);

    const labels = data.map(item => item.language);
    const values = data.map(item => item.bytes);
    const backgroundColors = labels.map(label => this.getLanguageColor(label, true));

    const config = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#e2e2e2' } },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${this.formatPercentage(ctx.parsed, values)}` } }
        }
      }
    };

    this.drawChart('language', ctx, config);

    const footer = document.getElementById('language-chart-footer');
    if (footer) {
      footer.textContent = labels.length
        ? `Top languages: ${labels.slice(0, 3).join(', ')}`
        : 'Language distribution unavailable.';
    }
  }

  renderVelocityChart() {
    const ctx = document.getElementById('velocity-chart');
    if (!ctx) return;

    const series = this.state.activity.weeklySeries;
    const labels = series.map(item => item.label);
    const values = series.map(item => item.count);

    const config = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Commits per week',
          data: values,
          borderColor: '#ff3385',
          backgroundColor: 'rgba(255, 51, 133, 0.2)',
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    };

    this.drawChart('velocity', ctx, config);
  }

  renderRepoHealthChart() {
    const ctx = document.getElementById('repo-health-chart');
    if (!ctx) return;

    const health = this.state.metrics.repoHealth;
    if (!health || health.datasets.length === 0) {
      const footer = document.getElementById('repo-health-footer');
      if (footer) footer.textContent = 'Need more repository data to calculate health metrics.';
      return;
    }

    const datasets = health.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      fill: true,
      backgroundColor: this.radarColor(index, 0.18),
      borderColor: this.radarColor(index, 1),
      pointBackgroundColor: this.radarColor(index, 1),
      borderWidth: 1.5
    }));

    const config = {
      type: 'radar',
      data: {
        labels: health.labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: { color: '#e2e2e2', font: { size: 12 } },
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#e2e2e2' } }
        }
      }
    };

    this.drawChart('repoHealth', ctx, config);
  }

  drawChart(key, ctx, config) {
    if (this.charts[key]) {
      this.charts[key].destroy();
    }
    this.charts[key] = new Chart(ctx, config);
  }

  renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    const heatmap = this.state.activity.heatmap;
    if (!heatmap || heatmap.length === 0) {
      container.innerHTML = '<div class="empty-state">No contribution data available.</div>';
      return;
    }

    container.innerHTML = heatmap
      .map(entry => `
        <div class="heatmap-cell" data-level="${entry.level}" title="${entry.count} commits on ${entry.label}">
          ${entry.count > 0 ? `<span>${entry.count}</span>` : ''}
        </div>
      `)
      .join('');
  }

  renderActivity() {
    const container = document.getElementById('activity-container');
    if (!container) return;

    const items = this.state.activity.recent;
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-state">No recent activity</div>';
      return;
    }

    container.innerHTML = items
      .map(item => {
        const description = item.description
          ? `<p class="activity-description">${this.escapeHtml(item.description)}</p>`
          : '';
        const stats = this.renderActivityStats(item.metadata || {});
        
        // Add type badge for better visual distinction
        const typeLabel = item.type === 'pr' ? 'PR' : item.type === 'issue' ? 'Issue' : 'Commit';
        const typeClass = `activity-type-${item.type}`;
        
        return `
          <div class="activity-item ${typeClass}">
            <svg class="activity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${this.activityIconPath(item.type)}
            </svg>
            <div class="activity-content">
              <div class="activity-title">
                <a href="${item.url}" target="_blank" rel="noopener">
                  ${this.escapeHtml(item.title)}
                </a>
                ${item.type === 'pr' && item.metadata?.number ? `<span class="activity-type-badge">PR #${item.metadata.number}</span>` : ''}
                ${item.type === 'issue' && item.metadata?.number ? `<span class="activity-type-badge">Issue #${item.metadata.number}</span>` : ''}
              </div>
              <div class="activity-meta">
                <span class="activity-repo">${this.escapeHtml(item.repo || '')}</span>
                <span class="activity-time">${this.formatTimeAgo(item.time)}</span>
              </div>
              ${description}
              ${stats}
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderActivityStats(metadata) {
    const badges = [];
    
    // Show commit count if multiple commits in one push
    if (metadata.commitCount && metadata.commitCount > 1) {
      badges.push(`<span class="activity-stat commits">${metadata.commitCount} commits</span>`);
    }
    
    if (typeof metadata.additions === 'number' || typeof metadata.deletions === 'number') {
      const additions = metadata.additions || 0;
      const deletions = metadata.deletions || 0;
      if (additions > 0) badges.push(`<span class="activity-stat additions">+${additions}</span>`);
      if (deletions > 0) badges.push(`<span class="activity-stat deletions">-${deletions}</span>`);
    }
    if (typeof metadata.filesChanged === 'number') {
      badges.push(`<span class="activity-stat files">${metadata.filesChanged} files</span>`);
    }
    if (metadata.state) {
      const stateClass = metadata.state === 'open' ? 'open' : metadata.state === 'closed' ? 'closed' : '';
      badges.push(`<span class="activity-stat state ${stateClass}">${this.escapeHtml(metadata.state)}</span>`);
    }
    if (metadata.merged) {
      badges.push('<span class="activity-stat merged">Merged</span>');
    }
    if (!badges.length) return '';
    return `<div class="activity-stats">${badges.join('')}</div>`;
  }

  renderRepositories() {
    const container = document.getElementById('repos-container');
    if (!container) return;
    
    const repos = this.state.repos;
    if (!repos || repos.length === 0) {
      container.innerHTML = '<div class="empty-state">No repositories found</div>';
      return;
    }
    
    container.innerHTML = repos
      .map(repo => {
        const languages = this.state.repoLanguages.byRepo[repo.full_name] || {};
        const languageChips = Object.entries(languages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([language]) => `<span class="repo-language-chip">${this.escapeHtml(language)}</span>`)
          .join('');

        const topics = (repo.topics || []).slice(0, 4)
          .map(topic => `<span class="repo-topic">#${this.escapeHtml(topic)}</span>`)
          .join('');

        const license = repo.license ? `<span class="repo-meta-item">${this.escapeHtml(repo.license)}</span>` : '';
        const archived = repo.archived ? '<span class="repo-meta-item archived">Archived</span>' : '';
      
        return `
          <article class="repo-card" data-url="${repo.html_url}">
          <div class="repo-header">
            <h3 class="repo-name">
              <a href="${repo.html_url}" target="_blank" rel="noopener">
                ${this.escapeHtml(repo.name)}
              </a>
            </h3>
            <div class="repo-stats">
                <span title="Stars">⭐ ${repo.stargazers_count || 0}</span>
                <span title="Forks">🍴 ${repo.forks_count || 0}</span>
                <span title="Watchers">👀 ${repo.watchers_count || 0}</span>
            </div>
          </div>
            ${repo.description ? `<p class="repo-description">${this.escapeHtml(repo.description)}</p>` : ''}
            <div class="repo-meta">
              <div class="repo-meta-left">
                ${repo.language ? `<span class="repo-language"><span class="repo-language-dot" style="background-color:${this.getLanguageColor(repo.language)}"></span>${this.escapeHtml(repo.language)}</span>` : ''}
                ${license}
                ${archived}
              </div>
              <div class="repo-meta-right">
                <span class="repo-updated">Updated ${this.formatTimeAgo(new Date(repo.pushed_at))}</span>
                ${repo.size ? `<span class="repo-meta-item">${this.humanFileSize(repo.size * 1024)}</span>` : ''}
          </div>
        </div>
            ${topics ? `<div class="repo-topics">${topics}</div>` : ''}
            ${languageChips ? `<div class="repo-languages">${languageChips}</div>` : ''}
          </article>
      `;
      })
      .join('');

    container.querySelectorAll('.repo-card').forEach((card, index) => {
      const repo = repos[index];
      if (!repo) return;
      card.addEventListener('click', event => {
        if (event.target.closest('a')) return;
        const newWindow = window.open(repo.html_url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.opener = null;
        }
      });
    });
  }

  setView(view) {
    const container = document.getElementById('repos-container');
    if (!container) return;
    
      container.className = `repos-container ${view}-view`;

    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    
    if (gridBtn && listBtn) {
      if (view === 'grid') {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        gridBtn.setAttribute('aria-selected', 'true');
        listBtn.setAttribute('aria-selected', 'false');
      } else {
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        listBtn.setAttribute('aria-selected', 'true');
        gridBtn.setAttribute('aria-selected', 'false');
      }
    }
  }

  async generateAIInsights({ force = false } = {}) {
    if (this.aiState.isGenerating) return;
    if (!force && this.aiState.lastSummary) return;

    const container = document.getElementById('ai-insights-container');
    const timestampEl = document.getElementById('ai-insights-timestamp');
    if (!container) return;

    this.aiState.isGenerating = true;
    container.innerHTML = '<div class="ai-placeholder skeleton">Synthesising AI insights…</div>';
    if (timestampEl) timestampEl.textContent = '';

    try {
      const payload = this.prepareAIPayload();
      console.log('Requesting AI insights with payload size:', JSON.stringify(payload).length, 'bytes');
      
      // Detect if we're running locally and use local dev server
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const aiEndpoint = isLocalhost 
        ? 'http://localhost:8888/.netlify/functions/generate-summary'
        : '/.netlify/functions/generate-summary';
      
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubData: payload })
      });

      if (!response.ok) {
        // If 404, the function isn't available (local dev without netlify dev)
        if (response.status === 404) {
          console.warn('AI function not available (running locally without netlify dev)');
          container.innerHTML = '<div class="ai-placeholder"><p>AI insights require Netlify functions. Run <code>netlify dev</code> for full functionality, or deploy to Netlify.</p><p>Current data is still available below.</p></div>';
          return;
        }
        
        let errorMessage = `AI service error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('AI function error:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('AI function error (non-JSON):', text);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const summary = data.summary || '<p>AI did not return any insights.</p>';
      
      // Clean up any markdown code blocks that might be in the response
      const cleanedSummary = summary.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();
      
      container.innerHTML = cleanedSummary;
      this.aiState.lastSummary = cleanedSummary;
      this.aiState.timestamp = data.timestamp || new Date().toISOString();

      if (timestampEl && this.aiState.timestamp) {
        const timestamp = new Date(this.aiState.timestamp);
        timestampEl.textContent = `Last updated ${timestamp.toLocaleString()}`;
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      const errorMsg = error.message || 'Unknown error';
      container.innerHTML = `<div class="ai-placeholder">
        <p><strong>AI insights unavailable.</strong></p>
        <p style="font-size: 0.875rem; opacity: 0.8;">${this.escapeHtml(errorMsg)}</p>
        <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem;">Check console for details or try again later.</p>
      </div>`;
    } finally {
      this.aiState.isGenerating = false;
    }
  }

  prepareAIPayload() {
    const { profile, repos, metrics, issues, pullRequests, activity, organizations, contributionTotals } = this.state;
    const repoLanguages = this.state.repoLanguages.byRepo;
    const recentActivities = Array.isArray(activity.recent) ? activity.recent.slice(0, 30) : [];

    return {
      profile,
      metrics,
      issues,
      organizations,
      contributionTotals,
      config: {
        username: this.config.username,
        orgs: this.config.orgs || []
      },
      pullRequests: pullRequests.slice(0, 20).map(pr => ({
        title: pr.title,
        url: pr.html_url,
        repo: pr.repo,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        additions: pr.additions,
        deletions: pr.deletions,
        labels: pr.labels,
        state: pr.state,
        commit_message: pr.commit_message,
        commit_body: pr.commit_body
      })),
      repositories: repos.slice(0, 15).map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        language_color: repo.language_color,
        topics: repo.topics,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        updated_at: repo.pushed_at,
        created_at: repo.created_at,
        open_issues_count: repo.open_issues_count,
        license: repo.license,
        archived: repo.archived,
        default_branch: repo.default_branch,
        languages: repoLanguages[repo.full_name] || {}
      })),
      activity: {
        weeklySeries: activity.weeklySeries,
        streak: activity.streak,
        commitsLast7: activity.commitsLast7,
        commitsLast30: activity.commitsLast30,
        heatmap: activity.heatmap,
        recent: recentActivities
      }
    };
  }

  copyAIInsights() {
    const container = document.getElementById('ai-insights-container');
    if (!container) return;

    const text = container.innerText || container.textContent || '';
    if (!text) return;

    navigator.clipboard.writeText(text.trim())
      .then(() => this.toast('AI insights copied to clipboard'))
      .catch(err => {
        console.warn('Unable to copy AI insights', err);
        this.toast('Copy failed. Please select and copy manually.', true);
      });
  }

  async apiFetch(url) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      let message = `GitHub API error ${response.status}`;
      try {
        const body = await response.json();
        if (body?.message) message = body.message;
      } catch (error) {
        // ignore json parse errors
      }
      throw new Error(message);
    }

    return response.json();
  }

  buildHeatmap(dailyCounts) {
    const results = [];
    const today = new Date();

    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const count = dailyCounts.get(key) || 0;
      results.push({
        date,
        count,
        level: this.heatmapLevel(count),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }

    return results;
  }

  buildWeeklySeries(dailyCounts) {
    const series = [];
    const today = new Date();
    const weeks = 12;

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      let count = 0;
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + day);
        const key = date.toISOString().slice(0, 10);
        count += dailyCounts.get(key) || 0;
      }

      series.push({
        label: this.formatWeekLabel(weekStart),
        count
      });
    }

    return series;
  }

  calculateStreaks(heatmap) {
    const chronological = heatmap.slice().sort((a, b) => a.date - b.date);

    let current = 0;
    let longest = 0;
    let running = 0;

    chronological.forEach(entry => {
      if (entry.count > 0) {
        running += 1;
      } else {
        running = 0;
      }
      longest = Math.max(longest, running);
    });

    for (let i = chronological.length - 1; i >= 0; i--) {
      if (chronological[i].count > 0) {
        current += 1;
      } else if (chronological[i].date < new Date()) {
        break;
      }
    }

    return { current, longest };
  }

  heatmapLevel(count) {
    if (count === 0) return 0;
    if (count < 2) return 1;
    if (count < 4) return 2;
    if (count < 8) return 3;
    return 4;
  }

  activityIconPath(type) {
    switch (type) {
      case 'commit':
        return '<path d="M12 1a4 4 0 014 4 3.99 3.99 0 01-3 3.86V15a3 3 0 11-2 0V8.86A3.99 3.99 0 018 5a4 4 0 014-4z"/>';
      case 'pr':
        return '<path d="M9 18V5a3 3 0 013-3h5m-5 0l3 3-3 3"/><path d="M9 7H4a1 1 0 00-1 1v9"/><circle cx="4" cy="19" r="2"/><circle cx="9" cy="19" r="2"/>';
      case 'issue':
      default:
        return '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="1"/>';
    }
  }

  renderMetaIconStat(label, value, iconName) {
    const icons = {
      users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
      'user-check': '<path d="M19 21v-2a4 4 0 00-3-3.87"/><path d="M12 7a4 4 0 10-4 4 4 4 0 004-4z"/><line x1="8" y1="21" x2="8" y2="19"/><line x1="12" y1="21" x2="12" y2="19"/><polyline points="16 11 18 13 22 9"/>',
      folder: '<path d="M3 7a2 2 0 012-2h3l2 2h11a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
      'map-pin': '<path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>'
    };

    const icon = icons[iconName] || '<circle cx="12" cy="12" r="10"/>';
    const valueLabel = value !== '' ? `${value}` : '';

    return `
      <span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${icon}</svg>
        ${this.escapeHtml(valueLabel || label)}
      </span>
    `;
  }

  renderTrend(series = [], label = '') {
    if (!Array.isArray(series) || series.length < 2) return '';
    const recent = series.slice(-2).map(item => item.count);
    const delta = recent[1] - recent[0];
    const trendUp = delta >= 0;

    return `
      <span class="metric-trend ${trendUp ? '' : 'negative'}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${trendUp ? '<polyline points="18 9 12 15 6 9"/>' : '<polyline points="6 15 12 9 18 15"/>'}
        </svg>
        ${trendUp ? '+' : ''}${delta} vs previous week
      </span>
    `;
  }

  describeVelocityTrend(series = []) {
    if (!Array.isArray(series) || series.length < 4) {
      return 'Activity trend data limited.';
    }

    const lastTwo = series.slice(-2).map(item => item.count);
    if (lastTwo[1] > lastTwo[0]) {
      return 'Commit cadence trending upward week-over-week.';
    }
    if (lastTwo[1] < lastTwo[0]) {
      return 'Commit cadence slightly down week-over-week.';
    }
    return 'Commit cadence holding steady week-over-week.';
  }

  formatPercentage(value, values) {
    const sum = values.reduce((total, current) => total + current, 0);
    if (sum === 0) return '0%';
    return `${Math.round((value / sum) * 1000) / 10}%`;
  }

  truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTimeAgo(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2629800) return `${Math.floor(diffInSeconds / 604800)}w ago`;

    return date.toLocaleDateString();
  }

  formatWeekLabel(date) {
    const options = { month: 'short', day: 'numeric' };
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
  }

  humanFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
  }

  scaleValue(value, max) {
    return max === 0 ? 0 : Math.round(Math.min(100, (value / max) * 100));
  }

  radarColor(index, alpha) {
    const palette = [
      [255, 51, 133],
      [80, 227, 202],
      [123, 97, 255],
      [255, 181, 71],
      [46, 204, 113]
    ];
    const [r, g, b] = palette[index % palette.length];
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getLanguageColor(language, translucent = false) {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      'C++': '#f34b7d',
      C: '#555555',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Shell: '#89e051',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Swift: '#FA7343',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      Vue: '#4fc08d',
      React: '#61dafb'
    };

    const fallback = '#ff3385';
    const base = colors[language] || fallback;
    if (!translucent) return base;

    const rgb = this.hexToRgb(base);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
  }

  hexToRgb(hex) {
    const stripped = hex.replace('#', '');
    const bigint = parseInt(stripped, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  daysBetween(dateA, dateB) {
    const diff = Math.abs(dateB.getTime() - dateA.getTime());
    return Math.floor(diff / 86400000);
  }

  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  toast(message, isError = false) {
    if (!message) return;
    const toast = document.createElement('div');
    toast.className = `monitor-toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
      }, 3200);
    }, 50);
  }

  showError(message) {
    const container = document.querySelector('.monitor-container');
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';
    errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; max-width: 600px; padding: 1rem 1.5rem; background: rgba(239, 68, 68, 0.95); color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 10000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.githubMonitor = new GitHubMonitor();
});

