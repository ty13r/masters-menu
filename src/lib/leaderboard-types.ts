export type Platform = "x" | "instagram" | "tiktok" | "facebook";

export interface SocialPost {
  platform: Platform;
  url: string;
  likeCount: number | null;
  lastFetched: string;
}

export interface LeaderboardEntry {
  id: string;
  honoree: string;
  menuData: string;
  socialPosts: SocialPost[];
  totalLikes: number;
  submittedAt: string;
  updatedAt: string;
}

export interface LeaderboardStore {
  entries: LeaderboardEntry[];
  lastModified: string;
}
