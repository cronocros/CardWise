import Link from "next/link";
import { AppShell, ActionButton, Chip, MetricCard, Panel } from "@/components/app-shell";

const themeOptions = [
  {
    key: "blossom",
    title: "로즈 블로섬",
    subtitle: "기본 앱 화면",
    selected: true,
  },
  {
    key: "minimal",
    title: "로즈 미니멀",
    subtitle: "리스트와 설정",
    selected: false,
  },
  {
    key: "glass",
    title: "로즈 글라스",
    subtitle: "특별 순간",
    selected: false,
  },
] as const;

export default function SettingsPage() {
  const enabledCount = 4;

  return (
    <AppShell
      active="settings"
      theme="minimal"
      eyebrow="환경 설정"
      title="앱 환경과 알림을 조용하고 밀도 있게 정리하는 화면"
      description="설정은 로즈 미니멀 톤으로 정리하되, 실제 알림 토글은 별도 서버 연동 화면으로 분리했습니다."
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
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="활성 설정" value={String(enabledCount)} helper="켜진 항목 수" />
        <MetricCard label="알림 채널" value="3" helper="앱 / 이메일 / 배지" />
        <MetricCard label="연동 카드" value="4" helper="기준 카드 샘플" />
        <MetricCard label="스킨" value="로즈 미니멀" helper="설정 화면 전용" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="계정" subtitle="프로필과 앱 사용 상태를 한 번에 확인할 수 있게 정리했습니다.">
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--primary-50)] text-xl font-semibold text-[var(--accent-strong)]">
                  CW
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="rose">활성</Chip>
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
                  언어
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">ko-KR</div>
              </div>
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  동기화
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">원격 Supabase</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="알림 설정" subtitle="실제 토글은 서버 연동 페이지에서 관리합니다.">
          <div className="grid gap-3">
            <Link
              href="/settings/notifications"
              className="cw-interactive-card rounded-[22px] border border-[var(--surface-border)] bg-white p-4 transition hover:border-[var(--surface-border-strong)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
                    알림 설정 관리
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[var(--text-body)]">
                    바우처 만료, 실적 리마인더, 결제 확인, 이메일, 푸시 알림을 서버와 동기화합니다.
                  </div>
                </div>
                <Chip tone="rose">열기</Chip>
              </div>
            </Link>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4">
              <div className="text-sm font-semibold text-[var(--text-strong)]">알림 저장소</div>
              <div className="mt-1 text-sm text-[var(--text-body)]">`notification_setting` 단일 테이블을 사용합니다.</div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="테마 스킨" subtitle="기본 앱은 로즈 블로섬, 조용한 설정은 로즈 미니멀, 이벤트는 로즈 글라스로 분리합니다.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {themeOptions.map((theme) => (
              <article
                key={theme.key}
                className={`cw-interactive-card rounded-[24px] border p-4 ${
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
                  {theme.selected ? <Chip tone="rose">사용 중</Chip> : <Chip tone="slate">사용 가능</Chip>}
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
              <Link
                href="/settings/notifications"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,var(--accent-strong),#fb923c)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(244,63,94,0.22)] transition hover:translate-y-[-1px]"
              >
                알림 설정
              </Link>
              <ActionButton kind="secondary">프로필 편집</ActionButton>
              <Link
                href="/benefits"
                className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]"
              >
                혜택 비교
              </Link>
              <Link
                href="/vouchers"
                className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]"
              >
                바우처 관리
              </Link>
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
