"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { formatDateTime, type NotificationSettingsResponse } from "@/lib/cardwise-api";

type NotificationSettings = NotificationSettingsResponse["data"];

const toggleMeta: Array<{
  key: keyof Pick<
    NotificationSettings,
    "voucherExpiryAlert" | "performanceReminder" | "paymentConfirmAlert" | "groupInviteAlert" | "groupActivityAlert" | "emailNotification" | "pushNotification"
  >;
  label: string;
  description: string;
}> = [
  {
    key: "voucherExpiryAlert",
    label: "바우처 만료 알림",
    description: "D-7, D-3, D-1 기준으로 만료를 미리 알려줍니다.",
  },
  {
    key: "performanceReminder",
    label: "실적 리마인더",
    description: "구간 달성 전 필요한 실적을 정리해서 보여줍니다.",
  },
  {
    key: "paymentConfirmAlert",
    label: "결제 확인 알림",
    description: "확인 필요 결제나 보정 작업이 생기면 알려줍니다.",
  },
  {
    key: "groupInviteAlert",
    label: "그룹 초대 알림",
    description: "새로운 그룹 초대를 받을 시 알려줍니다.",
  },
  {
    key: "groupActivityAlert",
    label: "그룹 활동 알림",
    description: "그룹 결제 내역 등록 및 멤버 상태 변경을 알려줍니다.",
  },
  {
    key: "emailNotification",
    label: "이메일 알림",
    description: "중요 공지와 주간 요약을 이메일로 받습니다.",
  },
  {
    key: "pushNotification",
    label: "푸시 알림",
    description: "앱 내 빠른 경고와 즉시 알림을 푸시로 전달합니다.",
  },
];

const defaultSettings: NotificationSettings = {
  notificationSettingId: 0,
  accountId: "",
  voucherExpiryAlert: true,
  performanceReminder: true,
  paymentConfirmAlert: true,
  groupInviteAlert: true,
  groupActivityAlert: true,
  emailNotification: false,
  pushNotification: true,
  updatedAt: "",
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [initialSettings, setInitialSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/notifications/settings", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("notification-settings");
        }

        const payload = (await response.json()) as NotificationSettingsResponse;
        setSettings(payload.data);
        setInitialSettings(payload.data);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        setLoadError("알림 설정을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSettings();
    return () => controller.abort();
  }, []);

  const enabledCount = useMemo(
    () =>
      toggleMeta.reduce(
        (sum, item) => sum + (settings[item.key] ? 1 : 0),
        0,
      ),
    [settings],
  );

  const hasChanges = useMemo(() => {
    return toggleMeta.some((item) => settings[item.key] !== initialSettings[item.key]);
  }, [initialSettings, settings]);

  async function saveSettings() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          voucherExpiryAlert: settings.voucherExpiryAlert,
          performanceReminder: settings.performanceReminder,
          paymentConfirmAlert: settings.paymentConfirmAlert,
          groupInviteAlert: settings.groupInviteAlert,
          groupActivityAlert: settings.groupActivityAlert,
          emailNotification: settings.emailNotification,
          pushNotification: settings.pushNotification,
        }),
      });

      if (!response.ok) {
        throw new Error("save");
      }

      const payload = (await response.json()) as NotificationSettingsResponse;
      setSettings(payload.data);
      setInitialSettings(payload.data);
    } catch {
      setSaveError("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell
      active="settings"
      theme="minimal"
      eyebrow="알림 설정"
      title="실적, 바우처, 결제를 실제 스키마 기준으로 제어합니다"
      description="이 화면은 `notification_setting` 단일 테이블을 직접 읽고 씁니다. 문서상 이전 명칭과는 분리해서 현재 스키마에 맞춘 최소 구현입니다."
      actions={
        <>
          <Link
            href="/settings"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            설정 홈
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            대시보드
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="활성 설정" value={String(enabledCount)} helper="켜진 알림 수" />
        <MetricCard label="채널" value={settings.pushNotification ? "푸시" : "비활성"} helper="앱 채널 기준" />
        <MetricCard label="최근 저장" value={settings.updatedAt ? formatDateTime(settings.updatedAt) : "불러오는 중"} helper="서버 반영 시각" />
        <MetricCard label="스킨" value="로즈 미니멀" helper="설정 전용" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <Panel title="알림 토글" subtitle="서버에 저장되는 5개 항목만 노출합니다.">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="h-4 w-36 rounded-full bg-[var(--surface-soft)]" />
                  <div className="mt-3 h-4 w-full rounded-full bg-[var(--surface-soft)]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {toggleMeta.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSettings((current) => ({ ...current, [item.key]: !current[item.key] }))}
                  className="cw-interactive-card flex items-center justify-between gap-4 rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-4 text-left transition hover:border-[var(--surface-border-strong)]"
                >
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--text-strong)]">{item.label}</div>
                    <div className="mt-1 text-sm leading-6 text-[var(--text-body)]">{item.description}</div>
                  </div>
                  <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${settings[item.key] ? "bg-[var(--primary-400)]" : "bg-[var(--neutral-200)]"}`}>
                    <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${settings[item.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </span>
                </button>
              ))}
            </div>
          )}

          {loadError ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</div> : null}
          {saveError ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{saveError}</div> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton kind="primary" onClick={saveSettings} disabled={isLoading || isSaving || !hasChanges}>
              {isSaving ? "저장 중..." : "저장"}
            </ActionButton>
            <ActionButton
              kind="secondary"
              onClick={() => setSettings(initialSettings)}
              disabled={isLoading || isSaving || !hasChanges}
            >
              되돌리기
            </ActionButton>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="채널 요약" subtitle="현재 스키마에 있는 채널만 정리했습니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <Chip tone={settings.voucherExpiryAlert ? "rose" : "slate"}>바우처</Chip>
                <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">{settings.voucherExpiryAlert ? "만료 알림 사용" : "만료 알림 꺼짐"}</div>
              </article>
              <article className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <Chip tone={settings.performanceReminder ? "rose" : "slate"}>실적</Chip>
                <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">{settings.performanceReminder ? "리마인더 사용" : "리마인더 꺼짐"}</div>
              </article>
              <article className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <Chip tone={settings.paymentConfirmAlert ? "rose" : "slate"}>결제</Chip>
                <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">{settings.paymentConfirmAlert ? "결제 확인 사용" : "결제 확인 꺼짐"}</div>
              </article>
              <article className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <Chip tone={settings.pushNotification ? "rose" : "slate"}>푸시</Chip>
                <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">{settings.pushNotification ? "푸시 사용" : "푸시 꺼짐"}</div>
              </article>
            </div>
          </Panel>

          <Panel title="바로가기" subtitle="설정 홈과 다른 화면으로 빠르게 이동합니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/settings" className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]">
                설정 홈
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]">
                대시보드
              </Link>
              <Link href="/benefits" className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]">
                혜택 검색
              </Link>
              <Link href="/vouchers" className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]">
                바우처
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
