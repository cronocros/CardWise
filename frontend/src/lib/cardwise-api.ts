export const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://localhost:8080/api/v1";

export type JsonRecord = Record<string, unknown>;

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface PendingAction {
  pendingActionId: number;
  actionType: string;
  referenceTable: string | null;
  referenceId: number | null;
  title: string;
  description: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED" | string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface PendingActionsResponse {
  data: PendingAction[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PendingActionCountResponse {
  data?: {
    count?: number;
    total?: number;
    pendingCount?: number;
  };
  count?: number;
  total?: number;
  pendingCount?: number;
}

export interface PaymentAdjustment {
  adjustmentId: number;
  paymentId: number;
  adjustmentType: string;
  originalKrwAmount: number;
  adjustedKrwAmount: number;
  differenceAmount: number;
  reason: string | null;
  billedAt: string | null;
  createdAt: string;
}

export interface PaymentAdjustmentsResponse {
  data: PaymentAdjustment[];
}

export type PaymentRecord = {
  paymentId: number;
  userCardId: number;
  merchantName: string;
  krwAmount: number;
  finalKrwAmount?: number;
  paidAt: string;
  isAdjusted: boolean;
  tierChanged?: boolean;
  newTierName?: string;
};

export interface CreatePaymentRequest {
  userCardId: number;
  merchantName: string;
  krwAmount: number;
  paidAt: string;
}

export interface PaymentListResponse {
  data: PaymentRecord[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PerformanceResponse {
  data: {
    userCardId: number;
    cardName: string;
    annualPeriod: {
      from: string;
      to: string;
      issuedAt: string;
      basis: string;
    };
    currentMonth: {
      yearMonth: string;
      monthlySpent: number;
      previousMonthSpent: number | null;
      changeRate: number | null;
    };
    annual: {
      accumulated: number;
      currentTier: {
        tierName: string;
        minAmount: number;
        maxAmount: number | null;
        achievedAt: string | null;
        remainingAmount: number | null;
      } | null;
      nextTier: {
        tierName: string;
        minAmount: number;
        maxAmount: number | null;
        achievedAt: string | null;
        remainingAmount: number | null;
      } | null;
    };
    benefitQualification: {
      periodLag: string;
      periodLagLabel: string;
      referenceMonth: string;
      referenceMonthSpent: number;
      qualifiedTierName: string | null;
      gracePeriod: {
        active: boolean;
        expiresAt: string | null;
        remainingDays: number | null;
        minSpendPerMonth: number;
      };
    };
    specialPeriod: {
      active: boolean;
      name: string | null;
      from: string | null;
      to: string | null;
      creditMultiplier: number | null;
    };
    voucherUnlocks: Array<{
      voucherName: string;
      unlockType: string;
      unlockState: "LOCKED" | "ELIGIBLE" | "UNLOCKED" | string;
      requiredAnnualPerformance: number | null;
      currentAnnualPerformance: number;
      remainingAmount: number | null;
      availableAt: string | null;
      remainingCount: number | null;
      totalCount: number | null;
      validUntil: string | null;
      notes: string | null;
    }>;
    monthlyBreakdown: Array<{
      yearMonth: string;
      spent: number;
    }>;
  };
}

export interface VoucherRecord {
  userVoucherId: number;
  cardVoucherId: number;
  userCardId: number;
  cardId?: number | null;
  cardName: string;
  cardNickname?: string | null;
  cardLabel?: string | null;
  voucherName: string;
  voucherType?: string | null;
  periodType?: string | null;
  description?: string | null;
  remainingCount?: number | null;
  totalCount?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  unlockType?: string | null;
  unlockState?: "LOCKED" | "ELIGIBLE" | "UNLOCKED" | string | null;
  requiredAnnualPerformance?: number | null;
  currentAnnualPerformance?: number | null;
  remainingAmount?: number | null;
  availableAt?: string | null;
  notes?: string | null;
  status?: string | null;
  daysUntilExpiry?: number | null;
}

export interface VoucherHistoryEntry {
  voucherHistoryId?: number;
  action?: string | null;
  memo?: string | null;
  createdAt: string;
  beforeRemainingCount?: number | null;
  afterRemainingCount?: number | null;
}

export interface VoucherListResponse {
  data: VoucherRecord[];
}

export interface VoucherHistoryResponse {
  data: VoucherHistoryEntry[];
}

export interface SeededCardSummary {
  userCardId: number;
  label: string;
  href: string;
}

export interface DashboardMonthlySummaryResponse {
  data: {
    yearMonth: string;
    totalSpent: number;
    totalBenefit: number;
    paymentCount: number;
    previousYearMonth: string | null;
    previousSpent: number;
    changeAmount: number;
    changeRate: number | null;
  };
}

export interface DashboardCardSummaryResponse {
  data: Array<{
    userCardId: number;
    cardName: string;
    spentAmount: number;
    benefitAmount: number;
    paymentCount: number;
    annualAccumulated: number | null;
    currentTierName: string | null;
  }>;
}

export interface DashboardCategorySummaryResponse {
  data: Array<{
    categoryId: number;
    categoryName: string;
    spentAmount: number;
    benefitAmount: number;
    paymentCount: number;
    sharePercent: number;
  }>;
}

export interface DashboardTagSummaryResponse {
  data: Array<{
    tagId: number;
    tagName: string;
    spentAmount: number;
    paymentCount: number;
    sharePercent: number;
  }>;
}

export interface DashboardTrendResponse {
  data: Array<{
    yearMonth: string;
    totalSpent: number;
    totalBenefit: number;
    paymentCount: number;
  }>;
}

export interface DashboardTagCrossResponse {
  data: {
    crossType: string;
    selectedTags: Array<{
      tagId: number;
      tagName: string;
    }>;
    totalSpent: number;
    paymentCount: number;
    breakdown: Array<{
      label: string;
      amount: number;
      paymentCount: number;
    }>;
  };
}

export interface NotificationSettingsResponse {
  data: {
    notificationSettingId: number;
    accountId: string;
    voucherExpiryAlert: boolean;
    performanceReminder: boolean;
    paymentConfirmAlert: boolean;
    groupInviteAlert: boolean;
    groupActivityAlert: boolean;
    emailNotification: boolean;
    pushNotification: boolean;
    updatedAt: string;
  };
}

export interface NotificationSettingsPatchRequest {
  voucherExpiryAlert?: boolean;
  performanceReminder?: boolean;
  paymentConfirmAlert?: boolean;
  groupInviteAlert?: boolean;
  groupActivityAlert?: boolean;
  emailNotification?: boolean;
  pushNotification?: boolean;
}

export interface NotificationItem {
  notificationId: number;
  notificationType: string;
  eventCode: string;
  title: string;
  body: string;
  actionUrl: string | null;
  actionLabel: string | null;
  referenceTable: string | null;
  referenceId: number | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListEnvelope {
  data: NotificationItem[];
}

export interface NotificationUnreadCountEnvelope {
  data: {
    unreadCount: number;
  };
}

export interface BenefitCategoryEnvelope {
  data: Array<{
    categoryId: number;
    categoryName: string;
    benefitCount: number;
  }>;
}

export interface BenefitSearchEnvelope {
  data: Array<{
    cardBenefitId: number;
    cardId: number;
    cardName: string;
    cardCompanyName: string;
    cardImageUrl: string | null;
    benefitType: string;
    benefitTypeLabel: string;
    discountType: string;
    discountValue: number;
    benefitLabel: string;
    targetLabel: string;
    categoryId: number | null;
    categoryName: string | null;
    merchantId: number | null;
    merchantName: string | null;
    description: string | null;
    monthlyLimitCount: number | null;
    monthlyLimitAmount: number | null;
    minPaymentAmount: number | null;
    performanceTierId: number | null;
    tierName: string | null;
    requiredPerformanceAmount: number | null;
    maxPerformanceAmount: number | null;
    isMyCard: boolean;
    userCardId: number | null;
    cardNickname: string | null;
    isEligible: boolean;
    eligibilityLabel: string;
    currentSpent: number | null;
    latestPerformanceMonth: string | null;
    remainingToEligible: number | null;
    matchScore: number;
  }>;
}

export interface BenefitRecommendationEnvelope {
  data: {
    scope: string;
    comparedCount: number;
    reason: string;
    recommendation: BenefitSearchEnvelope["data"][number] | null;
  };
}

export interface UpdateCardRequest {
  cardNickname?: string;
  issuedAt?: string;
}

export interface DeleteCardResponse {
  userCardId: number;
  message: string;
}

export interface CardBenefitDetailEnvelope {
  data: {
    cardId: number;
    cardName: string;
    cardCompanyName: string;
    cardImageUrl: string | null;
    isMyCard: boolean;
    userCardId: number | null;
    cardNickname: string | null;
    currentSpent: number | null;
    latestPerformanceMonth: string | null;
    benefits: BenefitSearchEnvelope["data"];
  };
}

export interface UserCardSummaryResponse {
  userCardId: number;
  cardId: number;
  cardName: string;
  cardNickname: string | null;
  issuedAt: string;
  isActive: boolean;
}

export interface UserCardsResponse {
  data: UserCardSummaryResponse[];
}

export interface NotificationItemResponse {
  notificationId: number;
  notificationType: string;
  eventCode: string;
  title: string;
  body: string;
  actionUrl: string | null;
  actionLabel: string | null;
  referenceTable: string | null;
  referenceId: number | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

export interface GroupSummaryEnvelope {
  data: Array<{
    groupId: number;
    groupName: string;
    description: string | null;
    role: string;
    memberCount: number;
    currentMonthSpent: number;
    maxMembers: number;
  }>;
}

export interface GroupMemberRecord {
  accountId: string;
  displayName: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface GroupTagRecord {
  tagId: number;
  tagName: string;
  color: string | null;
}

export interface GroupDetailEnvelope {
  data: {
    groupId: number;
    groupName: string;
    description: string | null;
    role: string;
    memberCount: number;
    currentMonthSpent: number;
    maxMembers: number;
    ownerAccountId: string;
    canManageSettings: boolean;
    pendingInvitationCount: number;
    members: GroupMemberRecord[];
  };
}

export interface GroupActionEnvelope {
  data: {
    groupId: number;
    status: string;
    message: string;
  };
}

export interface GroupTagEnvelope {
  data: GroupTagRecord[];
}

export interface GroupPaymentRecord {
  paymentId: number;
  accountId: string;
  userCardId: number;
  payerName: string;
  merchantName: string;
  amount: number;
  paidAt: string;
  currency: string;
  memo: string | null;
  tagNames: string[];
  canEdit: boolean;
}

export interface GroupInvitationEnvelope {
  data: Array<{
    invitationId: number;
    groupId: number;
    groupName: string;
    inviterName: string;
    inviteeEmail: string;
    invitationStatus: string;
    expiresAt: string;
    createdAt: string;
  }>;
}

export interface GroupPaymentEnvelope {
  data: GroupPaymentRecord[];
}

export interface GroupStatsEnvelope {
  data: {
    groupId: number;
    groupName: string;
    from: string;
    to: string;
    totalSpent: number;
    paymentCount: number;
    memberStats: Array<{
      accountId: string;
      displayName: string;
      spentAmount: number;
      paymentCount: number;
      sharePercent: number;
    }>;
    tagStats: Array<{
      tagName: string;
      spentAmount: number;
      paymentCount: number;
      sharePercent: number;
    }>;
    monthlyTrend: Array<{
      yearMonth: string;
      totalSpent: number;
      paymentCount: number;
    }>;
  };
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function backendUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return new URL(normalizedPath, normalizeBaseUrl(BACKEND_BASE_URL)).toString();
}

export async function fetchBackendJson<T>(
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(backendUrl(pathname), {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Backend request failed (${response.status} ${response.statusText}) for ${pathname}: ${body}`,
    );
  }

  return (await response.json()) as T;
}

export async function tryFetchBackendJson<T>(
  pathname: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return await fetchBackendJson<T>(pathname, init);
  } catch {
    return null;
  }
}

export function unwrapData<T>(value: unknown): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: T }).data ?? null;
  }

  return value as T;
}

export function unwrapArray<T>(value: unknown): T[] {
  const unwrapped = unwrapData<unknown>(value);
  return Array.isArray(unwrapped) ? (unwrapped as T[]) : [];
}

export function getPendingCount(value: PendingActionCountResponse | null) {
  if (!value) {
    return 0;
  }

  const fromData = value.data?.count ?? value.data?.total ?? value.data?.pendingCount;
  return value.count ?? value.total ?? value.pendingCount ?? fromData ?? 0;
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSignedCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatDaysUntilExpiry(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (value < 0) {
    return `만료 ${Math.abs(value)}일 전`;
  }

  return `D-${value}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
