import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { formatCurrency, formatDateTime, tryFetchBackendJson, type GroupPaymentEnvelope, type GroupSummaryEnvelope } from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function GroupPaymentsPage(props: PageProps<"/groups/[groupId]/payments">) {
  const { groupId } = await props.params;
  const currentMonth = new Date();
  const year = currentMonth.getFullYear();
  const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
  const from = `${year}-${month}-01`;
  const to = `${year}-${month}-31`;

  const [groupsResponse, paymentsResponse] = await Promise.all([
    tryFetchBackendJson<GroupSummaryEnvelope>("/groups"),
    tryFetchBackendJson<GroupPaymentEnvelope>(`/groups/${groupId}/payments?from=${from}&to=${to}&limit=40`),
  ]);

  const group = groupsResponse?.data?.find((item) => String(item.groupId) === groupId) ?? null;
  const payments = paymentsResponse?.data ?? [];
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <AppShell
      active="ledger"
      theme="minimal"
      eyebrow="그룹 결제 목록"
      title={group?.groupName ?? `그룹 #${groupId}`}
      description="개인 가계부와 별도로 group_id 기준 결제만 읽어와 그룹 멤버 전체 흐름을 확인합니다."
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-3">
        <MetricCard label="이번 달 합계" value={formatCurrency(totalSpent)} helper="현재 목록 합계" />
        <MetricCard label="결제 건수" value={`${payments.length}건`} helper="선택 기간 기준" />
        <MetricCard label="역할" value={group?.role ?? "-"} helper="현재 계정 기준" />
      </section>

      <Panel title="그룹 결제 내역" subtitle="멤버별 결제와 권한에 따른 수정 가능 여부를 같이 보여줍니다." tone="minimal">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link href={`/groups/${groupId}/stats`} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">통계 보기</Link>
          {group?.role === "OWNER" ? (
            <Link href={`/groups/${groupId}/invite`} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">멤버 초대</Link>
          ) : null}
          <Link href="/groups" className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">그룹 목록</Link>
        </div>

        <div className="grid gap-3">
          {payments.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              아직 등록된 그룹 결제가 없습니다.
            </div>
          ) : (
            payments.map((payment) => (
              <article key={payment.paymentId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={payment.canEdit ? "rose" : "slate"}>{payment.canEdit ? "수정 가능" : "조회 전용"}</Chip>
                  <Chip tone="slate">{payment.payerName}</Chip>
                </div>
                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{payment.merchantName}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{formatDateTime(payment.paidAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(payment.amount)}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{payment.currency}</div>
                  </div>
                </div>
                {payment.memo ? <div className="mt-3 text-sm text-[var(--text-body)]">{payment.memo}</div> : null}
              </article>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
