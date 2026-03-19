"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, ActionButton, Chip, MetricCard, Panel } from "@/components/app-shell";

type ToggleState = {
  label: string;
  description: string;
  enabled: boolean;
};

const initialToggles: ToggleState[] = [
  {
    label: "실적 달성 알림",
    description: "구간 달성 시 축하 배너와 함께 알려줍니다.",
    enabled: true,
  },
  {
    label: "바우처 만료 알림",
    description: "D-7, D-3, D-1 시점을 기준으로 노출합니다.",
    enabled: true,
  },
  {
    label: "월간 요약 리포트",
    description: "한 달에 한 번 사용 패턴을 정리합니다.",
    enabled: false,
  },
  {
    label: "민감 작업 확인",
    description: "조정과 해제 작업에 추가 확인 단계를 둡니다.",
    enabled: true,
  },
];

const themeOptions = [
  {
    key: "blossom",
    title: "Rose Blossom",
    subtitle: "기본 앱 화면",
    selected: true,
  },
  {
    key: "minimal",
    title: "Rose Minimal",
    subtitle: "리스트와 설정",
    selected: false,
  },
  {
    key: "glass",
    title: "Rose Glass",
    subtitle: "특별 순간",
    selected: false,
  },
] as const;

export default function SettingsPage() {
  const [toggles, setToggles] = useState(initialToggles);

  const enabledCount = toggles.filter((item) => item.enabled).length;

  return (
    <AppShell
      active="settings"
      theme="minimal"
      eyebrow="Preferences"
      title="앱 환경과 알림을 조용하고 밀도 있게 정리하는 화면"
      description="설정은 Rose Minimal 톤으로 정리하되, 앱 전체의 Blossom 기반과 어긋나지 않게 구조만 더 단단하게 잡았습니다."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            대시보드
          </Link>
          <Link
            href="/benefits"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            혜택
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="활성 설정" value={String(enabledCount)} helper="켜진 항목 수" />
        <MetricCard label="알림 채널" value="3" helper="앱 / 이메일 / 배지" />
        <MetricCard label="연동 카드" value="4" helper="기준 카드 샘플" />
        <MetricCard label="스킨" value="Minimal" helper="설정 화면 전용" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="계정" subtitle="프로필과 앱 사용 상태를 한 번에 확인할 수 있게 정리했습니다.">
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--primary-50)] text-xl font-semibold text-[var(--accent-strong)]">
                  CW
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="rose">Active</Chip>
                    <Chip tone="slate">CardWise</Chip>
                  </div>
                  <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                    crono
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-body)]">현재 앱은 모바일 우선 설정과 알림 최적화 모드로 동작합니다.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  Locale
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">ko-KR</div>
              </div>
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  Sync
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">Remote Supabase</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="알림 및 작업" subtitle="자주 쓰는 설정은 토글로 즉시 전환할 수 있게 유지합니다.">
          <div className="grid gap-3">
            {toggles.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  setToggles((current) =>
                    current.map((entry) =>
                      entry.label === item.label ? { ...entry, enabled: !entry.enabled } : entry,
                    ),
                  )
                }
                className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-4 text-left transition hover:border-[var(--surface-border-strong)]"
              >
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[var(--text-body)]">{item.description}</div>
                </div>
                <span
                  className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                    item.enabled ? "bg-[var(--primary-400)]" : "bg-[var(--neutral-200)]"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      item.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="테마 스킨" subtitle="기본 앱은 Blossom, 조용한 설정은 Minimal, 이벤트는 Glass로 분리합니다.">
          <div className="grid gap-3 md:grid-cols-3">
            {themeOptions.map((theme) => (
              <article
                key={theme.key}
                className={`rounded-[24px] border p-4 ${
                  theme.selected
                    ? "border-[var(--surface-border-strong)] bg-[linear-gradient(135deg,#fff5f7,#ffffff)]"
                    : "border-[var(--surface-border)] bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{theme.title}</div>
                    <div className="mt-1 text-sm text-[var(--text-body)]">{theme.subtitle}</div>
                  </div>
                  {theme.selected ? <Chip tone="rose">Active</Chip> : <Chip tone="slate">Available</Chip>}
                </div>
                <div className="mt-4 h-24 rounded-[20px] bg-[linear-gradient(135deg,#fff1f2,#ffffff)] p-4">
                  <div className="h-3 w-20 rounded-full bg-[var(--primary-200)]" />
                  <div className="mt-3 h-10 rounded-[18px] bg-white shadow-[0_10px_24px_rgba(190,24,60,0.05)]" />
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="빠른 링크" subtitle="이동이 잦은 화면을 바로 열 수 있게 묶었습니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton kind="primary">프로필 편집</ActionButton>
              <ActionButton kind="secondary">알림 테스트</ActionButton>
              <ActionButton kind="ghost">혜택 비교</ActionButton>
              <ActionButton kind="ghost">바우처 관리</ActionButton>
            </div>
          </Panel>

          <Panel title="보안 및 데이터" subtitle="설정 화면은 민감한 작업을 최소한의 단계로 수행하도록 구성합니다.">
            <div className="grid gap-3">
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-3">
                <div className="text-sm font-semibold text-[var(--text-strong)]">로그인 기기</div>
                <div className="mt-1 text-sm text-[var(--text-body)]">현재 기기 1대, 최근 접속 2026-03-19</div>
              </div>
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-3">
                <div className="text-sm font-semibold text-[var(--text-strong)]">내보내기</div>
                <div className="mt-1 text-sm text-[var(--text-body)]">JSON / CSV / 스냅샷 백업</div>
              </div>
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-3">
                <div className="text-sm font-semibold text-[var(--text-strong)]">위험 작업</div>
                <div className="mt-1 text-sm text-[var(--text-body)]">조정, 해제, 삭제는 재확인 후 실행</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
