export interface Review {
  id: string;
  date: string;
  notes: string;
  actionItems: Array<{
    text: string;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TweetData {
  id: string;
  status: 'reviewed' | 'archived' | 'new';
  tags: string[];
  reviewedAt?: string;
  archivedAt?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedEffort: number;
  dependencies: string;
  sourceTweetId?: string;
  sourceTweetContent?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

// New types for categorization and OpenClaw integration
export interface OpenClawCategory {
  id: string;
  name: string;
  keywords: string[];
  actionTemplate: string;
}

export interface Project {
  id: string;
  name: string;
  keywords: string[];
  relevanceThreshold: number;
  description: string;
  actionTemplate: string;
}

export interface TweetAnalysis {
  analysisType: 'openclaw' | 'project';
  category?: string;
  projectId?: string;
  projectName?: string;
  relevanceScore: number;
  summary: string;
  suggestedActions: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: string;
}

export interface AdminData {
  reviews: Review[];
  tweets: Record<string, TweetData>;
  actionItems: ActionItem[];
  openclawCategories: OpenClawCategory[];
  projects: Project[];
  settings: {
    lastUpdated: string | null;
  };
}
