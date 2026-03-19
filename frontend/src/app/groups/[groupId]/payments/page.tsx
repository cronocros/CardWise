import Link from "next/link";
import { AppShell, MetricCard } from "@/components/app-shell";
import { GroupPaymentsClient } from "@/components/group-payments-client";
import {
  formatCurrency,
  tryFetchBackendJson,
  type GroupDetailEnvelope,
  type GroupPaymentEnvelope,
  type GroupTagEnvelope,
  type PerformanceResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

export default async function GroupPaymentsPage(props: PageProps<"/groups/[groupId]/payments">) {
  const { groupId } = await props.params;

  const [detailResponse, paymentsResponse, tagsResponse, performanceResponses] = await Promise.all([
    tryFetchBackendJson<GroupDetailEnvelope>(`/groups/${groupId}`),
    tryFetchBackendJson<GroupPaymentEnvelope>(`/groups/${groupId}/payments?limit=100`),
    tryFetchBackendJson<GroupTagEnvelope>(`/groups/${groupId}/tags`),
    Promise.all(
      seededUserCardIds.map(async (userCardId) => ({
        userCardId,
        result: await tryFetchBackendJson<PerformanceResponse>(`/cards/${userCardId}/performance`),
      })),
    ),
  ]);

  const detail = detailResponse?.data ?? null;
  const payments = paymentsResponse?.data ?? [];
  const tags = tagsResponse?.data ?? [];
  const cardOptions = performanceResponses
    .map(({ userCardId, result }) => ({
      userCardId,
      cardName: result?.data.cardName ?? `카드 #${userCardId}`,
      tierName: result?.data.annual?.currentTier?.tierName ?? null,
    }))
    .filter((option) => Boolean(option.cardName));

  return (
    <AppShell
      active="ledger"
      theme="minimal"
      eyebrow="그룹 결제"
      title={detail?.groupName ?? `그룹 #${groupId}`}
      description="F12 기준으로 그룹 결제를 등록, 수정, 삭제하고 카드와 태그를 함께 연결합니다."
      actions={
        <>
          <Link
            href={`/groups/${groupId}/settings`}
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            그룹 설정
          </Link>
          <Link
            href={`/groups/${groupId}/stats`}
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            통계
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="결제 건수" value={String(payments.length)} helper="현재 목록 기준" />
        <MetricCard label="이번 달 합계" value={formatCurrency(detail?.currentMonthSpent ?? 0)} helper="그룹 전체 합계" />
        <MetricCard label="태그" value={String(tags.length)} helper="결제 태그 개수" />
        <MetricCard label="역할" value={detail?.role ?? "-"} helper={detail?.canManageSettings ? "관리 가능" : "조회 중심"} />
      </section>

      <GroupPaymentsClient
        groupId={groupId}
        groupName={detail?.groupName ?? `그룹 #${groupId}`}
        role={detail?.role ?? "MEMBER"}
        initialPayments={payments}
        initialTags={tags}
        cardOptions={cardOptions}
      />
    </AppShell>
  );
}
