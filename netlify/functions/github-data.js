'use strict';

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const REST_ENDPOINT = 'https://api.github.com';
const MAX_COMMIT_DETAIL_LOOKUPS = 6;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Server missing GitHub token' })
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const username = (payload.username || payload.login || '').trim();
  if (!username) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'username is required' })
    };
  }

  const orgs = Array.isArray(payload.orgs)
    ? payload.orgs.filter(item => typeof item === 'string' && item.trim().length > 0)
    : [];

  const now = new Date();
  const rangeDays = Number(payload.options?.rangeDays) || 90;
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - rangeDays);

  try {
    const graphData = await fetchGraphQL(buildDashboardQuery(), {
      login: username,
      from: fromDate.toISOString(),
      to: now.toISOString(),
      repoLimit: 40,
      prLimit: 30,
      issueLimit: 30
    }, token);

    if (graphData.errors) {
      console.error('GraphQL errors', graphData.errors);
      throw new Error(graphData.errors.map(err => err.message).join('; '));
    }

    const user = graphData?.data?.user;
    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: `User ${username} not found` })
      };
    }

    const profile = mapProfile(user);
    const repoLanguages = { byRepo: {}, totals: {} };
    const repos = mapRepositories(user.repositories?.nodes || [], repoLanguages);

    const languageStats = buildLanguageStats(repoLanguages.totals);
    const heatmapData = buildHeatmap(user.contributionsCollection?.contributionCalendar?.weeks || [], fromDate, now);
    const weeklySeries = buildWeeklySeries(heatmapData);
    const streak = calculateStreaks(heatmapData);
    const velocity = calculateVelocity(heatmapData);
    velocity.weeklySeries = weeklySeries;

    const recentPullRequests = mapPullRequests(user.recentPullRequests?.nodes || []);
    const recentIssues = mapIssues(user.recentIssues?.nodes || []);

    const issuesSummary = {
      open: user.openIssues?.totalCount || 0,
      closed: user.closedIssues?.totalCount || 0,
      samples: {
        open: recentIssues.filter(issue => issue.state === 'OPEN').slice(0, 10),
        closed: recentIssues.filter(issue => issue.state === 'CLOSED').slice(0, 10)
      }
    };

    const contributionTotals = {
      commits: user.contributionsCollection?.totalCommitContributions || 0,
      issues: user.contributionsCollection?.totalIssueContributions || 0,
      pullRequests: user.contributionsCollection?.totalPullRequestContributions || 0,
      reviews: user.contributionsCollection?.totalPullRequestReviewContributions || 0
    };

    const events = await collectActivityEvents({ username, orgs, token });
    const { recentActivities, repoVelocity } = await enrichActivities(events, token);

    const metrics = buildMetrics({
      profile,
      repos,
      pullRequests: recentPullRequests,
      issues: issuesSummary,
      velocity,
      streak,
      languageStats,
      repoVelocity,
      contributionTotals
    });

    const insights = buildInsights({
      profile,
      repos,
      metrics,
      activity: { weeklySeries, heatmap: heatmapData }
    });

    const responsePayload = {
      profile,
      repos,
      repoLanguages,
      pullRequests: recentPullRequests,
      issues: issuesSummary,
      metrics,
      insights,
      contributionTotals,
      organizations: (user.organizations?.nodes || []).map(org => ({
        login: org.login,
        name: org.name || org.login
      })),
      activity: {
        commitsLast7: velocity.week,
        commitsLast30: velocity.month,
        weeklySeries,
        heatmap: heatmapData,
        streak,
        recent: recentActivities.slice(0, 40)
      }
    };

    return {
      statusCode: 200,
      headers: Object.assign({}, corsHeaders(), { 'Content-Type': 'application/json' }),
      body: JSON.stringify(responsePayload)
    };
  } catch (error) {
    console.error('github-data error', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to load GitHub data', details: error.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

async function fetchGraphQL(query, variables, token) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.message || response.statusText;
    throw new Error(`GraphQL error ${response.status}: ${message}`);
  }
  return json;
}

async function fetchREST(path, token) {
  const url = path.startsWith('http') ? path : `${REST_ENDPOINT}${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub REST error ${response.status}: ${text}`);
  }
  return response.json();
}

function mapProfile(user) {
  return {
    login: user.login,
    name: user.name || user.login,
    avatar_url: user.avatarUrl,
    html_url: `https://github.com/${user.login}`,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.websiteUrl,
    twitter_username: user.twitterUsername,
    followers: user.followers?.totalCount || 0,
    following: user.following?.totalCount || 0,
    public_repos: user.repositories?.nodes?.length || 0
  };
}

function mapRepositories(nodes, repoLanguages) {
  return (nodes || []).map(node => {
    const languageMap = {};
    (node.languages?.edges || []).forEach(edge => {
      const name = edge.node?.name;
      if (!name) return;
      languageMap[name] = (languageMap[name] || 0) + (edge.size || 0);
      repoLanguages.totals[name] = (repoLanguages.totals[name] || 0) + (edge.size || 0);
    });
    if (Object.keys(languageMap).length > 0) {
      repoLanguages.byRepo[node.nameWithOwner] = languageMap;
    }

    return {
      id: node.nameWithOwner,
      name: node.name,
      full_name: node.nameWithOwner,
      html_url: node.url,
      description: node.description,
      language: node.primaryLanguage?.name || null,
      language_color: node.primaryLanguage?.color || null,
      topics: (node.repositoryTopics?.nodes || []).map(topicNode => topicNode.topic?.name).filter(Boolean),
      stargazers_count: node.stargazerCount || 0,
      forks_count: node.forkCount || 0,
      watchers_count: node.watchers?.totalCount || node.stargazerCount || 0,
      open_issues_count: node.openIssues?.totalCount || 0,
      size: node.diskUsage || null,
      archived: node.isArchived,
      private: node.isPrivate,
      default_branch: node.defaultBranchRef?.name || 'main',
      license: node.licenseInfo?.spdxId || node.licenseInfo?.name || null,
      pushed_at: node.pushedAt,
      updated_at: node.updatedAt,
      created_at: node.createdAt,
      homepage: node.homepageUrl
    };
  });
}

function mapPullRequests(nodes) {
  return (nodes || []).map(node => ({
    id: `${node.baseRepository?.nameWithOwner || 'repo'}#${node.number}`,
    title: node.title,
    state: node.state,
    html_url: node.url,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
    merged_at: node.mergedAt,
    additions: node.additions || 0,
    deletions: node.deletions || 0,
    repo: node.baseRepository?.nameWithOwner,
    labels: (node.labels?.nodes || []).map(label => ({
      name: label.name,
      color: label.color
    })),
    commit_message: node.commits?.nodes?.[0]?.commit?.messageHeadline || null,
    commit_body: node.commits?.nodes?.[0]?.commit?.message || null
  }));
}

function mapIssues(nodes) {
  return (nodes || []).map(node => ({
    id: `${node.repository?.nameWithOwner || 'repo'}#${node.number}`,
    title: node.title,
    state: node.state,
    html_url: node.url,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
    closed_at: node.closedAt,
    repo: node.repository?.nameWithOwner
  }));
}

function buildLanguageStats(totals) {
  const entries = Object.entries(totals || {});
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  const languages = entries
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: totalBytes ? Math.round((bytes / totalBytes) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return {
    totalBytes,
    totalLanguages: languages.length,
    languages,
    primary: languages.slice(0, 5),
    secondary: languages.slice(5, 10)
  };
}

function buildHeatmap(weeks, fromDate, toDate) {
  const items = [];
  (weeks || []).forEach(week => {
    (week.contributionDays || []).forEach(day => {
      const date = new Date(day.date);
      if (date < fromDate || date > toDate) return;
      items.push({
        date: date.toISOString(),
        count: day.contributionCount || 0,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    });
  });

  // ensure contiguous range
  const map = new Map(items.map(item => [item.date.slice(0, 10), item]));
  const padded = [];
  for (let cursor = new Date(fromDate); cursor <= toDate; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10);
    if (map.has(key)) {
      padded.push(map.get(key));
    } else {
      padded.push({
        date: new Date(cursor).toISOString(),
        count: 0,
        label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
  }

  return padded.map(entry => Object.assign({}, entry, { level: heatmapLevel(entry.count) }));
}

function buildWeeklySeries(heatmap) {
  if (!Array.isArray(heatmap) || heatmap.length === 0) return [];
  const series = [];

  for (let i = 0; i < heatmap.length; i += 7) {
    const slice = heatmap.slice(i, i + 7);
    if (slice.length === 0) continue;

    const startDate = new Date(slice[0].date);
    const endDate = new Date(slice[slice.length - 1].date);
    const count = slice.reduce((sum, day) => sum + (day.count || 0), 0);

    series.push({
      label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      count
    });
  }

  return series;
}

function calculateVelocity(heatmap) {
  const now = new Date();
  const weekThreshold = new Date(now);
  weekThreshold.setDate(now.getDate() - 7);

  const monthThreshold = new Date(now);
  monthThreshold.setDate(now.getDate() - 30);

  let week = 0;
  let month = 0;

  (heatmap || []).forEach(entry => {
    const date = new Date(entry.date);
    if (date >= monthThreshold) {
      month += entry.count || 0;
    }
    if (date >= weekThreshold) {
      week += entry.count || 0;
    }
  });

  return { week, month };
}

function calculateStreaks(heatmap) {
  if (!Array.isArray(heatmap) || heatmap.length === 0) {
    return { current: 0, longest: 0 };
  }

  let current = 0;
  let longest = 0;
  let running = 0;

  heatmap.forEach(day => {
    if ((day.count || 0) > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  });

  for (let i = heatmap.length - 1; i >= 0; i--) {
    if ((heatmap[i].count || 0) > 0) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest };
}

async function collectActivityEvents({ username, orgs, token }) {
  const requests = [
    fetchREST(`/users/${encodeURIComponent(username)}/events?per_page=100`, token).catch(() => [])
  ];

  orgs.forEach(org => {
    requests.push(
      fetchREST(`/orgs/${encodeURIComponent(org)}/events?per_page=100`, token)
        .then(events => events.filter(event => event?.actor?.login === username))
        .catch(() => [])
    );
  });

  const results = await Promise.all(requests);
  return results.flat().filter(Boolean);
}

async function enrichActivities(events, token) {
  const uniqueEvents = dedupeEvents(events);
  const recentActivities = [];
  const repoVelocity = new Map();
  const commitDetailFetches = [];

  uniqueEvents.forEach(event => {
    const type = event.type;
    const repoName = event.repo?.name;
    const createdAt = event.created_at;

    if (repoName) {
      repoVelocity.set(repoName, (repoVelocity.get(repoName) || 0) + 1);
    }

    if (type === 'PushEvent' && event.payload?.commits) {
      event.payload.commits.forEach(commit => {
        const entry = {
          type: 'commit',
          title: truncate(commit.message || 'Commit', 120),
          description: truncate(commit.message || '', 240),
          repo: repoName,
          time: createdAt,
          url: `https://github.com/${repoName}/commit/${commit.sha}`,
          sha: commit.sha,
          metadata: {}
        };
        recentActivities.push(entry);

        if (commitDetailFetches.length < MAX_COMMIT_DETAIL_LOOKUPS) {
          commitDetailFetches.push(
            fetchREST(`/repos/${repoName}/commits/${commit.sha}`, token)
              .then(detail => {
                entry.metadata = {
                  additions: detail.stats?.additions || 0,
                  deletions: detail.stats?.deletions || 0,
                  filesChanged: detail.files?.length || 0
                };
                if (!entry.description || entry.description.length < 10) {
                  entry.description = truncate(detail.commit?.message || '', 240);
                }
              })
              .catch(() => {})
          );
        }
      });
    } else if (type === 'PullRequestEvent' && event.payload?.pull_request) {
      const pr = event.payload.pull_request;
      recentActivities.push({
        type: 'pr',
        title: `${capitalize(event.payload.action || 'updated')} PR #${pr.number}: ${truncate(pr.title || '', 100)}`,
        description: truncate(pr.body || '', 240),
        repo: pr.base?.repo?.full_name || repoName,
        time: createdAt,
        url: pr.html_url,
        metadata: {
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          merged: Boolean(pr.merged),
          state: pr.state
        }
      });
    } else if (type === 'IssuesEvent' && event.payload?.issue) {
      const issue = event.payload.issue;
      recentActivities.push({
        type: 'issue',
        title: `${capitalize(event.payload.action || 'updated')} issue #${issue.number}: ${truncate(issue.title || '', 100)}`,
        description: truncate(issue.body || '', 240),
        repo: issue.repository?.full_name || repoName,
        time: createdAt,
        url: issue.html_url,
        metadata: { state: issue.state }
      });
    }
  });

  await Promise.all(commitDetailFetches);

  recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return { recentActivities, repoVelocity };
}

function dedupeEvents(events = []) {
  const seen = new Set();
  return events.filter(event => {
    const key = event.id || `${event.type}-${event.created_at}-${event.repo?.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildMetrics({ profile, repos, pullRequests, issues, velocity, streak, languageStats, repoVelocity, contributionTotals }) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const openPRs = pullRequests.filter(pr => pr.state === 'OPEN').length;

  return {
    counts: {
      repos: repos.length,
      stars: totalStars,
      forks: totalForks,
      followers: profile.followers,
      following: profile.following,
      openPRs,
      languages: languageStats.totalLanguages,
      issuesOpen: issues.open || 0,
      issuesClosed: issues.closed || 0
    },
    velocity,
    streak,
    repoHealth: buildRepoHealth(repos, repoVelocity),
    languageStats,
    contributionTotals
  };
}

function buildRepoHealth(repos, repoVelocity) {
  const topRepos = repos.slice(0, 5);
  const labels = ['Activity', 'Stars', 'Issue Hygiene', 'Freshness'];
  const datasets = [];

  const maxStars = Math.max(...repos.map(repo => repo.stargazers_count || 0), 1);
  const maxIssues = Math.max(...repos.map(repo => repo.open_issues_count || 0), 1);

  topRepos.forEach((repo, index) => {
    const velocity = repoVelocity.get(repo.full_name) || 0;
    const freshnessDays = daysBetween(new Date(repo.pushed_at), new Date());

    datasets.push({
      label: repo.name,
      data: [
        scaleValue(velocity, 10),
        scaleValue(repo.stargazers_count || 0, maxStars),
        100 - scaleValue(repo.open_issues_count || 0, maxIssues),
        Math.max(0, 100 - Math.min(freshnessDays, 100))
      ],
      index
    });
  });

  return { labels, datasets };
}

function buildInsights({ profile, repos, metrics, activity }) {
  const focusRepo = repos[0];
  const primaryLanguage = metrics.languageStats.primary?.[0];
  const velocityTrend = describeVelocityTrend(activity.weeklySeries);

  return {
    focus: {
      title: focusRepo ? focusRepo.name : 'Exploration in progress',
      description: focusRepo
        ? `Latest momentum in ${focusRepo.full_name}, active ${formatRelativeTime(focusRepo.pushed_at)}.`
        : 'No active repositories detected in the tracked window.'
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
        ? `${primaryLanguage.language} leads with ${primaryLanguage.percentage}% of tracked code volume.`
        : 'Language usage data not available.'
    },
    audience: {
      followers: profile.followers,
      following: profile.following,
      repos: metrics.counts.repos
    }
  };
}

function buildDashboardQuery() {
  return /* GraphQL */ `
    query Dashboard($login: String!, $from: DateTime!, $to: DateTime!, $repoLimit: Int!, $prLimit: Int!, $issueLimit: Int!) {
      user(login: $login) {
        login
        name
        avatarUrl
        bio
        company
        location
        websiteUrl
        twitterUsername
        followers { totalCount }
        following { totalCount }
        organizations(first: 20) { nodes { login name } }
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
        repositories(
          first: $repoLimit,
          orderBy: { field: PUSHED_AT, direction: DESC },
          ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR],
          isFork: false
        ) {
          nodes {
            name
            nameWithOwner
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            watchers { totalCount }
            isArchived
            isPrivate
            diskUsage
            updatedAt
            pushedAt
            createdAt
            defaultBranchRef { name }
            primaryLanguage { name color }
            licenseInfo { spdxId name }
            repositoryTopics(first: 8) { nodes { topic { name } } }
            languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
              totalSize
              edges {
                size
                node { name color }
              }
            }
            openIssues: issues(states: OPEN) { totalCount }
          }
        }
        recentPullRequests: pullRequests(first: $prLimit, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            title
            url
            createdAt
            updatedAt
            mergedAt
            additions
            deletions
            state
            number
            baseRepository { nameWithOwner url }
            labels(first: 6) { nodes { name color } }
            commits(first: 1) { nodes { commit { messageHeadline message } } }
          }
        }
        recentIssues: issues(first: $issueLimit, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            title
            url
            createdAt
            updatedAt
            closedAt
            state
            number
            repository { nameWithOwner url }
          }
        }
        openIssues: issues(states: OPEN) { totalCount }
        closedIssues: issues(states: CLOSED) { totalCount }
        openPullRequests: pullRequests(states: OPEN) { totalCount }
      }
    }
  `;
}

function heatmapLevel(count) {
  if (!count) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 8) return 3;
  return 4;
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function scaleValue(value, max) {
  if (!max) return 0;
  return Math.round(Math.min(100, (value / max) * 100));
}

function daysBetween(a, b) {
  const diff = Math.abs(b.getTime() - a.getTime());
  return Math.floor(diff / 86400000);
}

function describeVelocityTrend(series = []) {
  if (!Array.isArray(series) || series.length < 2) return 'Activity trend data limited.';
  const lastTwo = series.slice(-2).map(item => item.count);
  if (lastTwo[1] > lastTwo[0]) return 'Commit cadence trending upward week-over-week.';
  if (lastTwo[1] < lastTwo[0]) return 'Commit cadence softened against the prior week.';
  return 'Commit cadence holding steady week-over-week.';
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'recently';
  const date = new Date(dateInput);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

