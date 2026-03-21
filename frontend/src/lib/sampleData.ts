import { Transaction, Card, Badge, CommunityPost } from '../types/mobile';

export interface UserStats {
  id: string;
  email: string;
  totalAssets: number;
  monthlySpend: number;
  monthlyBudget: number;
  savingRate: number;
  topCategory: string;
}

export const TEST_ACCOUNTS = {
  ADMIN: '11111111-1111-1111-1111-111111111111',
  USER_A: '22222222-2222-2222-2222-222222222222',
  USER_B: '33333333-3333-3333-3333-333333333333',
  RANDOM: 'a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d'
};

export const SAMPLE_USER: UserStats = {
  id: TEST_ACCOUNTS.ADMIN,
  email: 'admin@cardwise.com',
  totalAssets: 125840900,
  monthlySpend: 2450000,
  monthlyBudget: 3500000,
  savingRate: 32,
  topCategory: '식비'
};

export const SAMPLE_CARDS: Card[] = [
  {
    id: 'c1',
    name: '현대카드 The Red Edition 5',
    issuer: '현대카드',
    firstFour: '4579',
    lastFour: '8801',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    color: '#1a1a1a',
    current: 850000,
    target: 5000000,
    benefitType: 'mileage',
    benefitValue: '1.5 마일 / 1천원',
    brand: 'visa',
    tier: 'infinite',
    tags: ['프리미엄', '여행', '마일리지'],
    currency: 'KRW'
  },
  {
    id: 'c2',
    name: '삼성카드 taptap O',
    issuer: '삼성카드',
    firstFour: '5243',
    lastFour: '4229',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
    color: '#e11d48',
    current: 1240000,
    target: 10000000,
    benefitType: 'discount',
    benefitValue: '최대 50% 할인',
    brand: 'mastercard',
    tier: 'platinum',
    tags: ['생활', '쇼핑', '커피'],
    currency: 'KRW'
  },
  {
    id: 'c3',
    name: '신한카드 Deep Dream',
    issuer: '신한카드',
    firstFour: '9400',
    lastFour: '9103',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    color: '#2563eb',
    current: 450000,
    target: 8000000,
    benefitType: 'point',
    benefitValue: '최대 3.5% 적립',
    brand: 'visa',
    tier: 'signature',
    tags: ['무실적', '포인트', '단순함'],
    currency: 'KRW'
  },
  {
    id: 'c4',
    name: 'KB국민 노리2 체크',
    issuer: 'KB국민카드',
    firstFour: '4518',
    lastFour: '5562',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    color: '#fbbf24',
    current: 156000,
    target: 2000000,
    benefitType: 'discount',
    benefitValue: '최대 2만원 할인',
    brand: 'mastercard',
    tier: 'gold',
    tags: ['학생', '체크카드', '가성비'],
    currency: 'KRW'
  },
  {
    id: 'c5',
    name: '롯데카드 LOCA LIKIT 1.2',
    issuer: '롯데카드',
    firstFour: '3791',
    lastFour: '2456',
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    color: '#475569',
    current: 85000,
    target: 1500000,
    benefitType: 'discount',
    benefitValue: '1.2% 결제 할인',
    brand: 'amex',
    tier: 'classic',
    tags: ['범용', '단순함', '사회초년생'],
    currency: 'KRW'
  }
];

// Seeded random for deterministic SSR/Hydration
let seed = 123;
const pseudoRandom = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Helper to generate transaction batches with Korean Merchants & Realistic Time (2026)
const generateTransactions = (): Transaction[] => {
  const koreanMerchants = [
    { name: '스타벅스 성수점', icon: '☕', category: '카페' },
    { name: '쿠팡 로켓배송', icon: '📦', category: '쇼핑' },
    { name: '배달의민족 (BBQ)', icon: '🍗', category: '식비' },
    { name: 'GS25 역삼역점', icon: '🏪', category: '마트' },
    { name: '무신사 온라인', icon: '🧥', category: '쇼핑' },
    { name: '파리바게뜨 한남점', icon: '🥐', category: '카페' },
    { name: 'CJ올리브영 명동점', icon: '💄', category: '쇼핑' },
    { name: '카카오택시 호출', icon: '🚕', category: '교통' },
    { name: '넷플릭스 정기결제', icon: '🎬', category: '서비스' },
    { name: '유튜브 프리미엄', icon: '📺', category: '서비스' },
    { name: '투썸플레이스', icon: '🍰', category: '카페' },
    { name: '마켓컬리 새벽배송', icon: '🥦', category: '마트' },
    { name: 'CGV 영화관람', icon: '🍿', category: '문화' },
    { name: '지하철/버스 교통', icon: '🚌', category: '교통' },
  ];

  const overseasMerchants = [
    { name: 'Apple.com (iCloud)', icon: '🍎', category: '서비스', currency: 'USD' as const, amount: 0.99 },
    { name: 'Amazon US', icon: '📦', category: '쇼핑', currency: 'USD' as const, amount: 45.50 },
    { name: 'Netflix Premium', icon: '🎬', category: '서비스', currency: 'USD' as const, amount: 15.99 },
    { name: 'Airbnb Inc', icon: '🏠', category: '여행', currency: 'USD' as const, amount: 245.00 },
    { name: 'Steam Games', icon: '🎮', category: '문화', currency: 'USD' as const, amount: 59.90 },
  ];

  const txs: Transaction[] = [];
  
  // Current Year 2026
  const year = 2026;
  
  // Reset seed for every generation call to ensure same results on Server/Client
  seed = 123;

  // Generate for Jan, Feb, Mar
  for (let month = 1; month <= 3; month++) {
    // Increased count for rich history
    const count = 45; 
    
    // Monthly Salary
    txs.push({
      id: `salary-${month}`,
      icon: '💰',
      name: `${month}월 급여`,
      category: '수입',
      card: '현대카드',
      amount: 4500000,
      date: `${year}-${month.toString().padStart(2, '0')}-05T10:00:00Z`,
      type: 'income',
      tags: ['고정수입', '월급'],
      currency: 'KRW'
    });

    for (let i = 0; i < count; i++) {
      const day = (i % 27) + 1;
      const hour = (i * 3) % 24;
      const min = (i * 7) % 60;
      const sec = 0;
      
    const isOverseas = pseudoRandom() < 0.15;
    const merchant = isOverseas 
      ? overseasMerchants[Math.floor(pseudoRandom() * overseasMerchants.length)]
      : koreanMerchants[Math.floor(pseudoRandom() * koreanMerchants.length)] as any;

    const amountValue = isOverseas 
      ? (merchant as any).amount || (pseudoRandom() * 100 + 5)
      : Math.floor(pseudoRandom() * 120000) + 3000;

    txs.push({
      id: `tx-${month}-${i}`,
      icon: merchant.icon,
      name: merchant.name,
      category: merchant.category,
      card: SAMPLE_CARDS[Math.floor(pseudoRandom() * SAMPLE_CARDS.length)].name,
      amount: Number(amountValue),
      date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}Z`,
      type: 'expense',
      currency: (merchant as any).currency || 'KRW',
      exchangeRate: (merchant as any).currency === 'USD' ? 1345 : undefined,
      tags: isOverseas ? ['해외결제', 'Overseas'] : [month % 2 === 0 ? '개인' : '생활'],
      benefitInfo: i % 3 === 0 ? `카드 기본 ${Math.floor(pseudoRandom() * 5) + 1}% 할인` : undefined,
      benefitAmount: i % 3 === 0 ? Math.floor(Number(amountValue) * 0.05) : undefined,
      paymentMethod: i % 2 === 0 ? '현대카드 M (4321)' : '신한카드 Deep Oil (2313)',
      items: i % 4 === 0 ? '로켓배송 외 2건' : merchant.name,
      description: i % 5 === 0 ? '매달 이용하는 단골 매장' : '카드 결제 내역'
    });
    }
  }

  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const SAMPLE_TRANSACTIONS = generateTransactions();

export const SPENDING_CATEGORIES = [
  { name: '식비', amount: 850000, color: '#f43f5e' },
  { name: '쇼핑', amount: 620000, color: '#8b5cf6' },
  { name: '교통', amount: 240000, color: '#3b82f6' },
  { name: '서비스', amount: 180000, color: '#10b981' },
  { name: '문화', amount: 120000, color: '#f59e0b' },
  { name: '기타', amount: 440000, color: '#64748b' },
];

export const SAMPLE_BADGES: Badge[] = [
  { id: 'pioneer', name: '초기 개척자', category: 'benefit', tier: 'platinum', description: 'CardWise 첫 가입자 1000명 내 포함', icon: '🥇', progress: 100, achieved: true, achievedDate: '2026-01-01' },
  { id: 'coffee-bronze', name: '커피 중독', category: 'spending', tier: 'bronze', description: '카페 카테고리 5회 이상 이용', icon: '☕', progress: 100, achieved: true, achievedDate: '2026-03-20' },
  { id: 'saving-silver', name: '현명한 생활', category: 'saving', tier: 'silver', description: '누적 할인 금액 5만원 돌파', icon: '💰', progress: 85, achieved: false },
  { id: 'travel-gold', name: '여행 매니아', category: 'spending', tier: 'gold', description: '해외 결제 및 여행 카테고리 이용', icon: '✈️', progress: 40, achieved: false },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    postId: 1,
    accountId: TEST_ACCOUNTS.USER_A,
    category: '꿀팁',
    title: '고정지출 10만원 줄이는 3가지 방법',
    content: '1. 구독 서비스 정리하기 2. 통신사 결합 할인 3. 가스 전기 요금 자동이체...',
    likeCount: 128,
    commentCount: 45,
    viewCount: 1024,
    isLiked: false,
    isBookmarked: false,
    createdAt: '2026-03-19T10:00:00Z',
    updatedAt: '2026-03-19T10:00:00Z',
    tags: ['절약', '고정지출', '꿀팁'],
    author: { name: '현명한체리', avatar: '🍒', badge: '절약왕' },
  },
  {
    postId: 2,
    accountId: TEST_ACCOUNTS.USER_B,
    category: '카드수다',
    title: '현대카드를 메인으로 쓰는 이유',
    content: '디자인도 디자인이지만, 코스트코 결제랑 앱 사용성이 넘사벽인 것 같아요.',
    likeCount: 89,
    commentCount: 23,
    viewCount: 567,
    isLiked: true,
    isBookmarked: false,
    createdAt: '2026-03-20T14:30:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
    tags: ['현대카드', '프리미엄', '디자인'],
    author: { name: '카드마스터', avatar: '💳', badge: 'Infinite' },
  },
  {
    postId: 3,
    accountId: TEST_ACCOUNTS.RANDOM,
    category: '질문',
    title: '사회초년생 첫 신용카드 추천 부탁드려요!',
    content: '주로 교통비랑 편의점 지출이 많은데 어떤 카드가 제일 혜택이 좋을까요?',
    likeCount: 42,
    commentCount: 56,
    viewCount: 890,
    isLiked: false,
    isBookmarked: true,
    createdAt: '2026-03-21T09:00:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
    tags: ['추천', '사회초년생', '신입'],
    author: { name: '무소유꿈나무', avatar: '🌴', badge: '초보' },
  },
  {
    postId: 4,
    accountId: TEST_ACCOUNTS.USER_A,
    category: '꿀팁',
    title: '스타벅스 50% 할인 받는 법 (진짜임)',
    content: '삼성카드 taptap O 카드랑 통신사 사이즈업 조합하면 거의 반값입니다.',
    likeCount: 256,
    commentCount: 12,
    viewCount: 1540,
    isLiked: false,
    isBookmarked: false,
    createdAt: '2026-03-21T11:15:00Z',
    updatedAt: '2026-03-21T11:15:00Z',
    tags: ['스타벅스', '할인', '꿀팁'],
    author: { name: '알뜰살뜰', avatar: '🍋', badge: '절약왕' },
  }
];
