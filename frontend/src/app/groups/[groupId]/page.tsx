import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { formatCurrency, formatDateTime, tryFetchBackendJson, type GroupDetailEnvelope } from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage(props: PageProps<"/groups/[groupId]">) {
  const { groupId } = await props.params;
  const detailResponse = await tryFetchBackendJson<GroupDetailEnvelope>(`/groups/${groupId}`);
  const detail = detailResponse?.data ?? null;

  if (!detail) {
    return (
      <AppShell
        active="ledger"
        eyebrow="그룹 상세"
        title={`그룹 #${groupId}`}
        description="그룹을 찾을 수 없습니다."
      >
        <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
          그룹 정보를 불러오지 못했습니다.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      active="ledger"
      eyebrow="그룹 상세"
      title={detail.groupName}
      description="그룹의 현재 상태를 요약하고 결제, 통계, 설정으로 이어집니다."
      actions={
        <>
          <Link
            href={`/groups/${groupId}/payments`}
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            결제
          </Link>
          <Link
            href={`/groups/${groupId}/stats`}
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            통계
          </Link>
          <Link
            href={`/groups/${groupId}/settings`}
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            설정
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="역할" value={detail.role} helper={detail.canManageSettings ? "관리 가능" : "조회 중심"} />
        <MetricCard label="멤버" value={`${detail.memberCount}명`} helper={`${detail.memberCount} / ${detail.maxMembers}명`} />
        <MetricCard label="이번 달" value={formatCurrency(detail.currentMonthSpent)} helper="현재 그룹 지출" />
        <MetricCard label="초대" value={String(detail.pendingInvitationCount)} helper="대기 중 초대" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <Panel title="개요" subtitle={detail.description ?? "그룹 설명이 없습니다."}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">OWNER</div>
              <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{detail.ownerAccountId}</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">조회 시각</div>
              <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{formatDateTime(new Date().toISOString())}</div>
            </div>
          </div>
        </Panel>

        <Panel title="멤버" subtitle="현재 그룹에 참여 중인 멤버 목록입니다." tone="minimal">
          <div className="grid gap-3">
            {detail.members.map((member) => (
              <article key={member.accountId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{member.displayName}</div>
                    <div className="mt-1 text-sm text-[var(--text-body)]">{member.email}</div>
                  </div>
                  <Chip tone={member.role === "OWNER" ? "rose" : "slate"}>{member.role}</Chip>
                </div>
                <div className="mt-2 text-xs text-[var(--text-soft)]">{formatDateTime(member.joinedAt)}</div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
