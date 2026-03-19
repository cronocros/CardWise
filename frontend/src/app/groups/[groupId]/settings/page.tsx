import Link from "next/link";
import { AppShell, MetricCard } from "@/components/app-shell";
import { GroupSettingsClient } from "@/components/group-settings-client";
import {
  formatCurrency,
  tryFetchBackendJson,
  type GroupDetailEnvelope,
  type GroupInvitationEnvelope,
  type GroupTagEnvelope,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function GroupSettingsPage(props: PageProps<"/groups/[groupId]/settings">) {
  const { groupId } = await props.params;

  const [detailResponse, tagsResponse, invitationsResponse] = await Promise.all([
    tryFetchBackendJson<GroupDetailEnvelope>(`/groups/${groupId}`),
    tryFetchBackendJson<GroupTagEnvelope>(`/groups/${groupId}/tags`),
    tryFetchBackendJson<GroupInvitationEnvelope>(`/groups/${groupId}/invitations`),
  ]);

  const detail = detailResponse?.data ?? null;
  const tags = tagsResponse?.data ?? [];
  const invitations = invitationsResponse?.data ?? [];

  if (!detail) {
    return (
      <AppShell
        active="ledger"
        theme="minimal"
        eyebrow="그룹 설정"
        title={`그룹 #${groupId}`}
        description="그룹 정보를 불러오지 못했습니다."
      >
        <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
          그룹 정보를 불러오지 못했습니다.
          <div className="mt-4">
            <Link href="/groups" className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
              그룹 목록으로
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      active="ledger"
      theme="minimal"
      eyebrow="그룹 설정"
      title={detail.groupName}
      description="그룹 정보, 멤버 권한, 태그, 초대, 위험 작업을 한 페이지에서 제어합니다."
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
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="현재 합계" value={formatCurrency(detail.currentMonthSpent)} helper="이번 달 그룹 지출" />
        <MetricCard label="멤버" value={`${detail.memberCount}명`} helper={`${detail.memberCount} / ${detail.maxMembers}명`} />
        <MetricCard label="초대" value={String(detail.pendingInvitationCount)} helper="대기 중 초대" />
        <MetricCard label="태그" value={String(tags.length)} helper="그룹 태그 개수" />
      </section>

      <GroupSettingsClient
        groupId={groupId}
        initialDetail={detail}
        initialTags={tags}
        initialInvitations={invitations}
      />
    </AppShell>
  );
}
