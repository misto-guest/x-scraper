import fs from 'fs';
import path from 'path';
import type { Review, TweetData, ActionItem, AdminData, OpenClawCategory, Project } from '../types/admin';

const DATA_PATH = './data/admin-data.json';

// Read admin data
export function getAdminData(): AdminData {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure new fields exist
    if (!parsed.openclawCategories) {
      parsed.openclawCategories = getDefaultOpenClawCategories();
    }
    if (!parsed.projects) {
      parsed.projects = [];
    }
    return parsed;
  } catch (error) {
    // Return default structure if file doesn't exist
    return {
      reviews: [],
      tweets: {},
      actionItems: [],
      openclawCategories: getDefaultOpenClawCategories(),
      projects: [],
      settings: {
        lastUpdated: null
      }
    };
  }
}

// Save admin data
export function saveAdminData(data: AdminData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getDefaultOpenClawCategories(): OpenClawCategory[] {
  return [
    {
      id: 'feature',
      name: 'Feature Addition',
      keywords: ['feature', 'add', 'implement', 'new'],
      actionTemplate: 'Implement new feature based on tweet: {tweetUrl}'
    },
    {
      id: 'bugfix',
      name: 'Bug Fix',
      keywords: ['fix', 'bug', 'issue', 'error'],
      actionTemplate: 'Fix bug described in: {tweetUrl}'
    },
    {
      id: 'performance',
      name: 'Performance',
      keywords: ['faster', 'optimize', 'performance', 'speed', 'slow'],
      actionTemplate: 'Optimize performance for: {tweetUrl}'
    },
    {
      id: 'security',
      name: 'Security',
      keywords: ['security', 'auth', 'permission', 'vulnerability', 'secure'],
      actionTemplate: 'Address security issue from: {tweetUrl}'
    },
    {
      id: 'integration',
      name: 'Integration',
      keywords: ['integrate', 'connect', 'API', 'webhook', 'integration'],
      actionTemplate: 'Set up integration mentioned in: {tweetUrl}'
    },
    {
      id: 'documentation',
      name: 'Documentation',
      keywords: ['docs', 'guide', 'README', 'tutorial', 'document'],
      actionTemplate: 'Create/update documentation for: {tweetUrl}'
    }
  ];
}

// Reviews CRUD
export function createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review {
  const data = getAdminData();
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.reviews.push(newReview);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return newReview;
}

export function getReviews(): Review[] {
  const data = getAdminData();
  return data.reviews.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getReview(id: string): Review | undefined {
  const data = getAdminData();
  return data.reviews.find(r => r.id === id);
}

export function updateReview(id: string, updates: Partial<Review>): Review | null {
  const data = getAdminData();
  const index = data.reviews.findIndex(r => r.id === id);
  if (index === -1) return null;

  data.reviews[index] = {
    ...data.reviews[index],
    ...updates,
    id: data.reviews[index].id, // Preserve ID
    createdAt: data.reviews[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString()
  };
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.reviews[index];
}

export function deleteReview(id: string): boolean {
  const data = getAdminData();
  const initialLength = data.reviews.length;
  data.reviews = data.reviews.filter(r => r.id !== id);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.reviews.length < initialLength;
}

// Tweets management
export function updateTweetStatus(tweetId: string, status: 'reviewed' | 'archived', tags: string[] = []): void {
  const data = getAdminData();
  if (!data.tweets[tweetId]) {
    data.tweets[tweetId] = {
      id: tweetId,
      status,
      tags,
      reviewedAt: status === 'reviewed' ? new Date().toISOString() : undefined,
      archivedAt: status === 'archived' ? new Date().toISOString() : undefined
    };
  } else {
    data.tweets[tweetId].status = status;
    if (tags.length > 0) {
      data.tweets[tweetId].tags = tags;
    }
    if (status === 'reviewed' && !data.tweets[tweetId].reviewedAt) {
      data.tweets[tweetId].reviewedAt = new Date().toISOString();
    }
    if (status === 'archived' && !data.tweets[tweetId].archivedAt) {
      data.tweets[tweetId].archivedAt = new Date().toISOString();
    }
  }
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
}

export function bulkUpdateTweets(tweetIds: string[], status: 'reviewed' | 'archived'): void {
  const data = getAdminData();
  tweetIds.forEach(id => {
    if (!data.tweets[id]) {
      data.tweets[id] = {
        id,
        status,
        tags: [],
        reviewedAt: status === 'reviewed' ? new Date().toISOString() : undefined,
        archivedAt: status === 'archived' ? new Date().toISOString() : undefined
      };
    } else {
      data.tweets[id].status = status;
      if (status === 'reviewed' && !data.tweets[id].reviewedAt) {
        data.tweets[id].reviewedAt = new Date().toISOString();
      }
      if (status === 'archived' && !data.tweets[id].archivedAt) {
        data.tweets[id].archivedAt = new Date().toISOString();
      }
    }
  });
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
}

export function getTweets(): Record<string, TweetData> {
  const data = getAdminData();
  return data.tweets;
}

// Action Items CRUD
export function createActionItem(item: Omit<ActionItem, 'id' | 'createdAt'>): ActionItem {
  const data = getAdminData();
  const newItem: ActionItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  data.actionItems.push(newItem);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return newItem;
}

export function getActionItems(): ActionItem[] {
  const data = getAdminData();
  return data.actionItems.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateActionItem(id: string, updates: Partial<ActionItem>): ActionItem | null {
  const data = getAdminData();
  const index = data.actionItems.findIndex(i => i.id === id);
  if (index === -1) return null;

  data.actionItems[index] = {
    ...data.actionItems[index],
    ...updates,
    id: data.actionItems[index].id,
    createdAt: data.actionItems[index].createdAt
  };
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.actionItems[index];
}

export function deleteActionItem(id: string): boolean {
  const data = getAdminData();
  const initialLength = data.actionItems.length;
  data.actionItems = data.actionItems.filter(i => i.id !== id);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.actionItems.length < initialLength;
}

// Projects CRUD
export function createProject(project: Omit<Project, 'id'>): Project {
  const data = getAdminData();
  const newProject: Project = {
    ...project,
    id: 'project-' + crypto.randomUUID()
  };
  data.projects.push(newProject);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return newProject;
}

export function getProjects(): Project[] {
  const data = getAdminData();
  return data.projects;
}

export function getProject(id: string): Project | undefined {
  const data = getAdminData();
  return data.projects.find(p => p.id === id);
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const data = getAdminData();
  const index = data.projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    id: data.projects[index].id
  };
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.projects[index];
}

export function deleteProject(id: string): boolean {
  const data = getAdminData();
  const initialLength = data.projects.length;
  data.projects = data.projects.filter(p => p.id !== id);
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.projects.length < initialLength;
}

// OpenClaw Categories CRUD
export function getOpenClawCategories(): OpenClawCategory[] {
  const data = getAdminData();
  return data.openclawCategories;
}

export function updateOpenClawCategory(id: string, updates: Partial<OpenClawCategory>): OpenClawCategory | null {
  const data = getAdminData();
  const index = data.openclawCategories.findIndex(c => c.id === id);
  if (index === -1) return null;

  data.openclawCategories[index] = {
    ...data.openclawCategories[index],
    ...updates,
    id: data.openclawCategories[index].id
  };
  data.settings.lastUpdated = new Date().toISOString();
  saveAdminData(data);
  return data.openclawCategories[index];
}

// Relevance scoring
export function calculateRelevance(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matches = 0;

  keywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
    }
  });

  // Calculate relevance as percentage
  if (keywords.length === 0) return 0;
  return Math.min(100, Math.round((matches / keywords.length) * 100));
}

// Auto-detect category for OpenClaw upgrades
export function detectOpenClawCategory(text: string): OpenClawCategory | null {
  const categories = getOpenClawCategories();
  let bestMatch: OpenClawCategory | null = null;
  let highestScore = 0;

  categories.forEach(category => {
    const score = calculateRelevance(text, category.keywords);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  });

  // Only return if we have at least 30% relevance
  return highestScore >= 30 ? bestMatch : null;
}

// Find matching project
export function findMatchingProject(text: string): { project: Project; score: number } | null {
  const projects = getProjects();
  let bestMatch: { project: Project; score: number } | null = null;
  let highestScore = 0;

  projects.forEach(project => {
    const score = calculateRelevance(text, project.keywords);
    if (score > highestScore && score >= project.relevanceThreshold) {
      highestScore = score;
      bestMatch = { project, score };
    }
  });

  return bestMatch;
}

// Export functions
export function exportReviewsAsMarkdown(): string {
  const reviews = getReviews();
  let markdown = '# Reviews Export\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `---\n\n`;

  reviews.forEach(review => {
    markdown += `## ${review.date}\n\n`;
    markdown += `**Notes:** ${review.notes || 'No notes'}\n\n`;

    if (review.actionItems && review.actionItems.length > 0) {
      markdown += `### Action Items\n\n`;
      review.actionItems.forEach((item, index) => {
        const status = item.completed ? '✅' : '⬜';
        markdown += `${index + 1}. ${status} ${item.text}\n`;
      });
      markdown += '\n';
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

export function exportReviewsAsCSV(): string {
  const reviews = getReviews();
  let csv = 'Date,Notes,Action Items,Completed Count,Total Count\n';

  reviews.forEach(review => {
    const notes = review.notes?.replace(/"/g, '""') || '';
    const actionItems = review.actionItems?.map(i => i.text).join('; ') || '';
    const completedCount = review.actionItems?.filter(i => i.completed).length || 0;
    const totalCount = review.actionItems?.length || 0;

    csv += `"${review.date}","${notes}","${actionItems}",${completedCount},${totalCount}\n`;
  });

  return csv;
}
