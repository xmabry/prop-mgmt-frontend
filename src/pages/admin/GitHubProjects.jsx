import { useState } from 'react';
import {
  createGitHubIssue,
  buildIssueBody,
  getGitHubConfig,
  REQUIREMENT_TYPES,
  PRIORITY_LEVELS,
} from '../../services/githubProjects';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField, { Input, Select, Textarea } from '../../components/common/FormField';
import styles from './GitHubProjects.module.css';

const REQUIREMENT_TYPE_OPTIONS = [
  { value: REQUIREMENT_TYPES.FEATURE, label: '✨ Feature Request' },
  { value: REQUIREMENT_TYPES.BUG, label: '🐛 Bug Report' },
  { value: REQUIREMENT_TYPES.MAINTENANCE, label: '🔧 Maintenance' },
  { value: REQUIREMENT_TYPES.ENHANCEMENT, label: '⚡ Enhancement' },
  { value: REQUIREMENT_TYPES.DOCUMENTATION, label: '📚 Documentation' },
];

const PRIORITY_OPTIONS = [
  { value: PRIORITY_LEVELS.CRITICAL, label: '🔴 Critical' },
  { value: PRIORITY_LEVELS.HIGH, label: '🟠 High' },
  { value: PRIORITY_LEVELS.MEDIUM, label: '🟡 Medium' },
  { value: PRIORITY_LEVELS.LOW, label: '🟢 Low' },
];

const emptyForm = {
  type: REQUIREMENT_TYPES.FEATURE,
  priority: PRIORITY_LEVELS.MEDIUM,
  title: '',
  summary: '',
  acceptanceCriteria: '',
  stepsToReproduce: '',
  additionalContext: '',
  propertyAddress: '',
};

const defaultConfig = getGitHubConfig();

export default function GitHubProjects() {
  const [config, setConfig] = useState({
    token: defaultConfig.token,
    owner: defaultConfig.owner,
    repo: defaultConfig.repo,
  });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const validate = () => {
    const e = {};
    if (!config.token) e.token = 'GitHub token is required';
    if (!config.owner) e.owner = 'Repository owner is required';
    if (!config.repo) e.repo = 'Repository name is required';
    if (!form.title.trim()) e.title = 'Issue title is required';
    if (!form.summary.trim()) e.summary = 'Summary is required';
    return e;
  };

  const handlePreview = () => {
    const body = buildIssueBody({ ...form, reportedBy: 'Property Manager' });
    setPreviewBody(body);
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setError('');
    setSubmitting(true);
    try {
      const body = buildIssueBody({ ...form, reportedBy: 'Property Manager' });
      const labels = [form.type, form.priority];
      const issue = await createGitHubIssue({
        token: config.token,
        owner: config.owner,
        repo: config.repo,
        title: form.title,
        body,
        labels,
      });
      setResult(issue);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>GitHub Projects Integration</h1>
          <p className={styles.subtitle}>Create templated GitHub issues for requirements collection</p>
        </div>
      </div>

      {result && (
        <div className={styles.successCard}>
          <span className={styles.successIcon}>🎉</span>
          <div>
            <p className={styles.successTitle}>Issue created successfully!</p>
            <a href={result.html_url} target="_blank" rel="noopener noreferrer" className={styles.issueLink}>
              #{result.number}: {result.title} →
            </a>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setResult(null)}>✕</Button>
        </div>
      )}

      {error && (
        <div className={styles.errorCard}>
          <span>❌</span>
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError('')}>✕</Button>
        </div>
      )}

      <div className={styles.grid}>
        <Card title="Repository Configuration">
          <div className={styles.configForm}>
            <FormField label="GitHub Personal Access Token" required error={errors.token}
              hint="Needs 'repo' scope. Token is not stored on any server.">
              <Input
                type="password"
                value={config.token}
                onChange={(e) => { setConfig({ ...config, token: e.target.value }); setErrors({}); }}
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </FormField>
            <div className={styles.repoRow}>
              <FormField label="Owner / Org" required error={errors.owner}>
                <Input
                  value={config.owner}
                  onChange={(e) => { setConfig({ ...config, owner: e.target.value }); setErrors({}); }}
                  placeholder="your-org"
                />
              </FormField>
              <FormField label="Repository" required error={errors.repo}>
                <Input
                  value={config.repo}
                  onChange={(e) => { setConfig({ ...config, repo: e.target.value }); setErrors({}); }}
                  placeholder="prop-requirements"
                />
              </FormField>
            </div>
          </div>
        </Card>

        <Card title="Create GitHub Issue">
          <form className={styles.issueForm} onSubmit={handleSubmit}>
            <div className={styles.typeRow}>
              <FormField label="Type" required>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {REQUIREMENT_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Priority" required>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Issue Title" required error={errors.title}>
              <Input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({}); }}
                placeholder="Brief, descriptive title…"
              />
            </FormField>

            <FormField label="Property Address">
              <Input
                value={form.propertyAddress}
                onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
                placeholder="123 Main St (if applicable)"
              />
            </FormField>

            <FormField label="Summary / Description" required error={errors.summary}>
              <Textarea
                value={form.summary}
                onChange={(e) => { setForm({ ...form, summary: e.target.value }); setErrors({}); }}
                placeholder="Describe the requirement or issue in detail…"
                rows={4}
              />
            </FormField>

            <FormField label="Acceptance Criteria" hint="One criterion per line">
              <Textarea
                value={form.acceptanceCriteria}
                onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
                placeholder="As a user, I can…&#10;System should…&#10;Validated by…"
                rows={4}
              />
            </FormField>

            {form.type === REQUIREMENT_TYPES.BUG && (
              <FormField label="Steps to Reproduce" hint="One step per line">
                <Textarea
                  value={form.stepsToReproduce}
                  onChange={(e) => setForm({ ...form, stepsToReproduce: e.target.value })}
                  placeholder="1. Navigate to…&#10;2. Click on…&#10;3. Observe…"
                  rows={3}
                />
              </FormField>
            )}

            <FormField label="Additional Context">
              <Textarea
                value={form.additionalContext}
                onChange={(e) => setForm({ ...form, additionalContext: e.target.value })}
                placeholder="Any screenshots, references, or extra context…"
                rows={2}
              />
            </FormField>

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={handlePreview}>👁️ Preview</Button>
              <Button variant="primary" type="submit" loading={submitting}>
                🐙 Create GitHub Issue
              </Button>
            </div>
          </form>
        </Card>

        {showPreview && (
          <Card
            title="Issue Preview"
            action={<Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>✕ Close</Button>}
            className={styles.previewCard}
          >
            <pre className={styles.preview}>{previewBody}</pre>
          </Card>
        )}

        <Card title="Issue Template Guide">
          <div className={styles.guide}>
            <div className={styles.guideSection}>
              <h4 className={styles.guideTitle}>📋 Template Structure</h4>
              <p className={styles.guideText}>Every issue is created with a standardized template that includes type, priority, summary, acceptance criteria, and context.</p>
            </div>
            <div className={styles.guideSection}>
              <h4 className={styles.guideTitle}>🏷️ Automatic Labels</h4>
              <p className={styles.guideText}>Issues are automatically labeled with the requirement type and priority level for easy filtering in GitHub Projects.</p>
            </div>
            <div className={styles.guideSection}>
              <h4 className={styles.guideTitle}>🔒 Security</h4>
              <p className={styles.guideText}>Your GitHub token is used only for this API call and is never stored on any server. Use a fine-grained token with only repository issue write permissions.</p>
            </div>
            <div className={styles.guideSection}>
              <h4 className={styles.guideTitle}>🚀 Getting Started</h4>
              <ol className={styles.guideList}>
                <li>Create a GitHub repo for requirements</li>
                <li>Generate a Personal Access Token with <code>repo</code> scope</li>
                <li>Enter the token, owner, and repo above</li>
                <li>Fill in the issue details and submit</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
