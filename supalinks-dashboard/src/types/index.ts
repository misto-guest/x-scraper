export interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  title?: string;
  description?: string;
  domain?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  active: boolean;
  analytics: LinkAnalytics;
}

export interface LinkAnalytics {
  clicks: number;
  uniqueClicks: number;
  lastClick?: string;
  topCountries: Array<{ country: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
}

export interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  primary: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  term?: string;
  content?: string;
  links: string[];
  createdAt: string;
}

export interface CreateLinkData {
  slug: string;
  originalUrl: string;
  title?: string;
  description?: string;
  domain?: string;
  tags?: string[];
  expiresAt?: string;
}
