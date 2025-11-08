// Shared utility functions for AI summary generation
// Used by both Netlify function and local dev server

function buildSummaryPrompt(githubData) {
  const profile = githubData.profile || {};
  const metrics = githubData.metrics || {};
  const repos = githubData.repositories || [];
  const activity = githubData.activity || {};
  const issues = githubData.issues || {};
  const pullRequests = githubData.pullRequests || [];
  const organizations = githubData.organizations || [];
  const contributionTotals = githubData.contributionTotals || {};

  const velocity = metrics.velocity || {};
  const streak = metrics.streak || {};
  const languageStats = metrics.languageStats?.languages || [];

  const repoHighlights = repos.slice(0, 6).map(repo => {
    const topLanguage = Object.entries(repo.languages || {})
      .sort((a, b) => b[1] - a[1])[0]?.[0] || repo.language || 'N/A';
    return `• ${repo.full_name || repo.name} — ${repo.stars || 0} ★, ${topLanguage}, last push ${formatRelative(repo.updated_at)}`;
  }).join('\n') || '• No prominent repositories found in this window.';

  const languageHighlights = languageStats.slice(0, 5).map(lang =>
    `• ${lang.language}: ${lang.percentage}%`
  ).join('\n') || '• Language distribution unavailable.';

  const weeklyTrend = (activity.weeklySeries || []).slice(-8).map(week =>
    `• ${week.label}: ${week.count} commits`
  ).join('\n') || '• Weekly commit cadence data unavailable.';

  const recentEvents = (activity.recent || []).slice(0, 12).map(event => {
    const parts = [];
    parts.push(`${capitalize(event.type || 'update')}`);
    if (event.repo) parts.push(event.repo);
    parts.push(`— ${sanitizeText(event.title || '')}`);
    if (event.metadata && (event.metadata.additions || event.metadata.deletions)) {
      const additions = event.metadata.additions || 0;
      const deletions = event.metadata.deletions || 0;
      parts.push(`(+${additions}/-${deletions})`);
    }
    parts.push(`(${formatRelative(event.time)})`);
    return `• ${parts.join(' ')}`;
  }).join('\n') || '• Recent event data not available.';

  const followers = profile.followers || 0;
  const following = profile.following || 0;
  const stars = metrics.counts?.stars || 0;
  const forks = metrics.counts?.forks || 0;
  const reposCount = metrics.counts?.repos || repos.length;
  const orgList = organizations.slice(0, 6).map(org => org.name || org.login).join(', ') || 'Independent / personal focus';

  return `Craft an insightful developer portfolio summary using the GitHub analytics provided below. Identify meaningful patterns rather than echoing the raw data.

DEVELOPER PROFILE:
• Name: ${profile.name || profile.login || 'Unknown'}
• Followers / Following: ${followers} / ${following}
• Active orgs: ${orgList}
• Public repos tracked: ${reposCount}
• Bio: ${sanitizeText(profile.bio || 'Not provided')}

REPOSITORY HIGHLIGHTS:
${repoHighlights}

RECENT ACTIVITY SNAPSHOT:
${recentEvents}

VELOCITY & STREAKS:
• Commits 7d: ${velocity.week || 0}
• Commits 30d: ${velocity.month || 0}
• Current streak: ${streak.current || 0} days
• Longest streak: ${streak.longest || 0} days
• Weekly trend (recent 8 weeks):
${weeklyTrend}

OPEN SOURCE ENGAGEMENT:
• Open pull requests: ${pullRequests.filter(pr => pr.state === 'OPEN').length}
• Issues opened: ${issues.open || 0}
• Issues closed: ${issues.closed || 0}
• Total stars: ${stars}, forks: ${forks}
• Contributions (90d): commits ${contributionTotals.commits || 0}, PRs ${contributionTotals.pullRequests || 0}, issues ${contributionTotals.issues || 0}, reviews ${contributionTotals.reviews || 0}

LANGUAGE DISTRIBUTION:
${languageHighlights}

Respond with clean semantic HTML using this structure:

<div class="ai-summary">
<h4>🎯 Current Focus</h4>
<p>[Explain the dominant projects and themes, referencing repository highlights, org work, and recent updates.]</p>

<h4>⚡ Development Velocity</h4>
<p>[Describe commitment patterns, streaks, and weekly trends, noting momentum or slowdown and any outliers.]</p>

<h4>🛠️ Technology Stack</h4>
<p>[Summarise the top languages and how they map to projects or evolving expertise, including any shifts in focus.]</p>

<h4>📈 Growth & Impact</h4>
<p>[Comment on community engagement (stars, forks, PRs, issues), collaboration patterns (org work vs personal), and notable achievements or trends.]</p>
</div>

Keep it concise (4 short paragraphs), analytical, and professional. Do not restate the raw bullet lists verbatim; synthesise insights instead.`;
}

function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\r?\n|\r/g, ' ').trim();
}

function formatRelative(dateString) {
  if (!dateString) return 'unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

module.exports = {
  buildSummaryPrompt,
  sanitizeText,
  formatRelative,
  capitalize
};

