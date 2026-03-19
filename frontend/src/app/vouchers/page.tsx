import { AppShell } from "@/components/app-shell";
import { VouchersClient } from "@/components/vouchers-client";
import { Chip, MetricCard, Panel } from "@/components/app-shell";
import Link from "next/link";
import {
  tryFetchBackendJson,
  type PerformanceResponse,
  type VoucherListResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

export default async function VouchersPage() {
  const [seededCards, activeVouchers, expiredVouchers, expiringVouchers, initialSelectedCardVouchers] =
    await Promise.all([
      Promise.all(
        seededUserCardIds.map(async (userCardId) => {
          const result = await tryFetchBackendJson<PerformanceResponse>(
            `/cards/${userCardId}/performance`,
          );
          return {
            userCardId,
            label: result?.data?.cardName ? `${result.data.cardName} #${userCardId}` : `사용 카드 #${userCardId}`,
          };
        }),
      ),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=active"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=expired"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers/expiring?days=7"),
      tryFetchBackendJson<VoucherListResponse>(`/user-cards/${seededUserCardIds[0]}/vouchers`),
    ]);

  return (
    <AppShell
      active="vouchers"
      eyebrow="바우처 시스템"
      title="바우처를 카드 중심으로 보고, 상태와 사용 흐름을 바로 확인하는 화면"
      description="로즈 블로섬 카드 시스템으로 재구성한 바우처 표면입니다. 선택 카드, 만료 임박, 사용 이력, 사용 / 사용 취소 흐름을 유지하면서 더 읽기 쉬운 구조로 정리했습니다."
      actions={
        <>
          <Link
            href="/benefits"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            혜택
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            설정
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="활성" value={String(activeVouchers?.data?.length ?? 0)} helper="현재 활성 목록" />
        <MetricCard label="만료 임박" value={String(expiringVouchers?.data?.length ?? 0)} helper="7일 이내 확인" />
        <MetricCard
          label="선택 카드"
          value={String(initialSelectedCardVouchers?.data?.length ?? 0)}
          helper={seededCards[0]?.label ?? "사용 카드 #1"}
        />
        <MetricCard label="만료" value={String(expiredVouchers?.data?.length ?? 0)} helper="보관 목록" />
      </section>

      <Panel
        title="빠른 맥락"
        subtitle="바우처 흐름을 한 번에 점검하려면 선택 카드 목록과 만료 임박 목록부터 보는 것이 가장 빠릅니다."
      >
        <div className="flex flex-wrap gap-2">
          <Chip tone="rose">로즈 블로섬 카드</Chip>
          <Chip tone="slate">사용 / 사용 취소 유지</Chip>
          <Chip tone="emerald">이력 유지</Chip>
          <Chip tone="amber">만료 임박 창</Chip>
        </div>
      </Panel>

      <VouchersClient
        initialActiveVouchers={activeVouchers?.data ?? []}
        initialExpiredVouchers={expiredVouchers?.data ?? []}
        initialExpiringVouchers={expiringVouchers?.data ?? []}
        initialSelectedCardVouchers={initialSelectedCardVouchers?.data ?? []}
        seededCards={seededCards}
        initialSelectedUserCardId={seededUserCardIds[0]}
      />
    </AppShell>
  );
}
