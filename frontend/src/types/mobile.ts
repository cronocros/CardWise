export interface Transaction {
  id: string;
  icon: string;
  name: string;
  category: string;
  card: string;
  amount: number;
  date: string; // ISO String
  type: 'expense' | 'income';
  tags?: string[];
  discount?: number;
  reward?: number;
  currency: 'KRW' | 'USD';
  exchangeRate?: number;
  benefitInfo?: string; // e.g., "스타벅스 50% 할인"
}

export interface Card {
  id: string;
  name: string;
  firstFour: string;
  lastFour: string;
  issuer: string;
  gradient: string;
  current: number;
  target: number;
  benefitType: 'discount' | 'mileage' | 'point';
  benefitValue: string;
  tags?: string[];
  cardImageUrl?: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'jcb' | 'local';
  tier: 'classic' | 'gold' | 'platinum' | 'signature' | 'infinite' | 'world' | 'world_elite';
  color: string;
  currency: 'KRW' | 'USD';
}

export interface Badge {
  id: string;
  name: string;
  category: 'spending' | 'saving' | 'benefit';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  achievedDate?: string;
  description: string;
  icon: string;
  progress: number;
  achieved: boolean;
}

export interface CommunityPost {
  postId: number;
  accountId: string;
  category: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  // UI-only virtual author for display
  author?: {
    name: string;
    avatar: string;
    badge?: string;
  };
}

export interface CategoryData {
  name: string;
  percent: number;
  color: string;
}

export interface Tier {
  label: string;
  benefit: string;
  amount: number;
}

export interface Bucket {
  label: string;
  pct: number;
  achieved: boolean;
  value?: string;
  target?: number;
}

export interface CommunityComment {
  commentId: number;
  postId: number;
  accountId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
