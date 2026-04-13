/**
 * GitHub Projects Integration Service
 * Creates issues with templated format in a GitHub repository/project
 * using the GitHub REST API.
 */

const GITHUB_API_BASE = 'https://api.github.com';

export const REQUIREMENT_TYPES = {
  FEATURE: 'feature',
  BUG: 'bug',
  MAINTENANCE: 'maintenance',
  ENHANCEMENT: 'enhancement',
  DOCUMENTATION: 'documentation',
};

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Build a templated GitHub issue body from requirement data.
 */
export function buildIssueBody({ type, priority, summary, acceptanceCriteria, stepsToReproduce, additionalContext, reportedBy, propertyAddress }) {
  const typeEmojis = {
    [REQUIREMENT_TYPES.FEATURE]: '✨',
    [REQUIREMENT_TYPES.BUG]: '🐛',
    [REQUIREMENT_TYPES.MAINTENANCE]: '🔧',
    [REQUIREMENT_TYPES.ENHANCEMENT]: '⚡',
    [REQUIREMENT_TYPES.DOCUMENTATION]: '📚',
  };

  const priorityBadges = {
    [PRIORITY_LEVELS.CRITICAL]: '🔴 Critical',
    [PRIORITY_LEVELS.HIGH]: '🟠 High',
    [PRIORITY_LEVELS.MEDIUM]: '🟡 Medium',
    [PRIORITY_LEVELS.LOW]: '🟢 Low',
  };

  return `## ${typeEmojis[type] || '📋'} Requirement

**Type:** ${type?.charAt(0).toUpperCase() + type?.slice(1) || 'N/A'}
**Priority:** ${priorityBadges[priority] || priority || 'N/A'}
**Reported By:** ${reportedBy || 'N/A'}
**Property Address:** ${propertyAddress || 'N/A'}
**Date Submitted:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 📝 Summary

${summary || '_No summary provided._'}

---

## ✅ Acceptance Criteria

${acceptanceCriteria
    ? acceptanceCriteria
        .split('\n')
        .filter(Boolean)
        .map((c) => `- [ ] ${c.trim()}`)
        .join('\n')
    : '_No acceptance criteria defined._'}

---

${
  type === REQUIREMENT_TYPES.BUG
    ? `## 🔁 Steps to Reproduce

${stepsToReproduce
      ? stepsToReproduce
          .split('\n')
          .filter(Boolean)
          .map((s, i) => `${i + 1}. ${s.trim()}`)
          .join('\n')
      : '_No steps provided._'}

---

`
    : ''
}## 📎 Additional Context

${additionalContext || '_No additional context._'}

---

*This issue was created via the Property Management Portal.*
`;
}

/**
 * Create a GitHub issue using a personal access token.
 */
export async function createGitHubIssue({ token, owner, repo, title, body, labels = [], assignees = [] }) {
  if (!token || !owner || !repo) {
    throw new Error('GitHub token, owner, and repo are required.');
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body, labels, assignees }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * List repository labels to suggest for issue creation.
 */
export async function listGitHubLabels({ token, owner, repo }) {
  if (!token || !owner || !repo) return [];

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/labels?per_page=50`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) return [];
  return response.json();
}

/**
 * Get configuration from environment variables.
 */
export function getGitHubConfig() {
  return {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
  };
}
