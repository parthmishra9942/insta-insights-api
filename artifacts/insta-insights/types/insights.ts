export type LinkType = 'reel' | 'post' | 'profile';

export interface RatePoint {
  label: string;
  value: number;
}

export interface InsightsData {
  headline: string;
  summary: {
    views: number;
    accountsReached: number;
    avgWatchTimeSec: number;
    follows: number;
    profileVisits: number;
  };
  durationSec: number;
  engagementCounts: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reposts: number;
  };
  engagementRate: number;
  estimatedReach: number;
  viewsOverTime: {
    labels: string[];
    all: number[];
    followers: number[];
    nonFollowers: number[];
  };
  watchTimeCurve: number[];
  topSources: RatePoint[];
  rates: {
    skipRate: number;
    shareRate: number;
    likeRate: number;
    saveRate: number;
    repostRate: number;
    commentRate: number;
  };
  audience: {
    followersPct: number;
    nonFollowersPct: number;
    age: RatePoint[];
    country: RatePoint[];
    gender: RatePoint[];
  };
}

export interface AnalyzedLink {
  id: string;
  url: string;
  type: LinkType;
  createdAt: number;
  previewUri?: string;
  data: InsightsData;
}
