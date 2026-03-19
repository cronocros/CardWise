import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import {
  formatCurrency,
  tryFetchBackendJson,
  type GroupInvitationEnvelope,
  type GroupSummaryEnvelope,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const [groupsResponse, invitationsResponse] = await Promise.all([
    tryFetchBackendJson<GroupSummaryEnvelope>("/groups"),
    tryFetchBackendJson<GroupInvitationEnvelope>("/groups/invitations"),
  ]);

  const groups = groupsResponse?.data ?? [];
  const invitations = invitationsResponse?.data ?? [];
  const totalSpent = groups.reduce((sum, group) => sum + group.currentMonthSpent, 0);

  return (
    <AppShell
      active="ledger"
      eyebrow="그룹 가계부"
      title="참여 중인 그룹과 초대 대기열"
      description="F12 기준으로 그룹 목록, 이번 달 그룹 지출, 대기 중인 초대를 한 화면에 모았습니다."
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-3">
        <MetricCard label="참여 그룹" value={String(groups.length)} helper="현재 멤버십 기준" />
        <MetricCard label="대기 초대" value={String(invitations.length)} helper="수락 또는 거절 필요" />
        <MetricCard label="그룹 합계" value={formatCurrency(totalSpent)} helper="이번 달 그룹 지출" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="내 그룹" subtitle="그룹별 이번 달 합계와 역할을 먼저 보여주고, 결제/통계/초대 화면으로 바로 연결합니다.">
          <div className="grid gap-3">
            {groups.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center">
                <div className="text-base font-semibold text-[var(--text-strong)]">참여 중인 그룹이 없습니다</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">새 그룹을 만들거나 초대를 수락하면 여기에 표시됩니다.</div>
              </div>
            ) : (
              groups.map((group) => (
                <article key={group.groupId} className="cw-interactive-card rounded-[26px] border border-[var(--surface-border)] bg-white p-5 shadow-[0_14px_28px_rgba(190,24,60,0.05)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[20px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{group.groupName}</div>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">{group.description ?? "공동 지출을 관리하는 그룹 가계부"}</div>
                    </div>
                    <Chip tone={group.role === "OWNER" ? "rose" : "emerald"}>{group.role}</Chip>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">멤버 수</div>
                      <div className="mt-2 font-medium text-[var(--text-strong)]">{group.memberCount} / {group.maxMembers}명</div>
                    </div>
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">이번 달 지출</div>
                      <div className="mt-2 font-medium text-[var(--text-strong)]">{formatCurrency(group.currentMonthSpent)}</div>
                    </div>
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">권한</div>
                      <div className="mt-2 font-medium text-[var(--text-strong)]">{group.role === "OWNER" ? "관리 가능" : "멤버 참여"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={`/groups/${group.groupId}/payments`} className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]">결제 목록</Link>
                    <Link href={`/groups/${group.groupId}/stats`} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">통계 보기</Link>
                    {group.role === "OWNER" ? (
                      <Link href={`/groups/${group.groupId}/invite`} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">멤버 초대</Link>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="빠른 작업" subtitle="그룹 생성과 초대 처리 화면을 바로 열 수 있게 분리했습니다.">
            <div className="grid gap-3">
              <Link href="/groups/new" className="rounded-[22px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff7f8,#ffffff)] px-5 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:shadow-[var(--surface-shadow)]">새 그룹 만들기</Link>
              <Link href="/groups/invitations" className="rounded-[22px] border border-[var(--surface-border)] bg-white px-5 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:shadow-[var(--surface-shadow)]">초대 확인하기</Link>
              <Link href="/ledger" className="rounded-[22px] border border-[var(--surface-border)] bg-white px-5 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:shadow-[var(--surface-shadow)]">개인 가계부로 돌아가기</Link>
            </div>
          </Panel>

          <Panel title="대기 중 초대" subtitle="현재 계정 이메일로 도착한 초대를 바로 확인합니다." tone="minimal">
            <div className="grid gap-3">
              {invitations.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                  대기 중인 초대가 없습니다.
                </div>
              ) : (
                invitations.map((invitation) => (
                  <article key={invitation.invitationId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone="amber">PENDING</Chip>
                      <Chip tone="slate">{invitation.groupName}</Chip>
                    </div>
                    <div className="mt-3 text-sm text-[var(--text-body)]">{invitation.inviterName}님이 보낸 초대입니다.</div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
