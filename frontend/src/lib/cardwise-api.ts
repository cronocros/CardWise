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

export interface SeededCardSummary {
  userCardId: number;
  label: string;
  href: string;
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
