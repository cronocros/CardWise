import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SVGProps,
  TextareaHTMLAttributes,
} from "react";

type NavKey =
  | "home"
  | "inbox"
  | "adjustments"
  | "vouchers"
  | "performance"
  | "dashboard"
  | "cards"
  | "ledger"
  | "benefits"
  | "settings";

type ThemeKey = "blossom" | "minimal" | "glass";

type NavItem = {
  href: string;
  label: string;
  key: NavKey;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

const navItems: NavItem[] = [
  { href: "/", label: "홈", key: "home", icon: HomeIcon },
  { href: "/inbox", label: "인박스", key: "inbox", icon: InboxIcon },
  { href: "/adjustments", label: "조정", key: "adjustments", icon: LedgerIcon },
  { href: "/vouchers", label: "바우처", key: "vouchers", icon: TicketIcon },
  { href: "/performance/1", label: "실적", key: "performance", icon: SparkIcon },
];

export function AppShell({
  title,
  eyebrow,
  description,
  children,
  actions,
  active,
  theme = "blossom",
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  active: NavKey;
  theme?: ThemeKey;
}) {
  return (
    <div className="cw-page">
      <div
        data-cardwise-theme={theme}
        className="mx-auto flex min-h-screen w-full max-w-[1560px] gap-4 px-3 py-3 sm:px-4 lg:px-6 lg:py-5"
      >
        <aside className="cw-glass cw-card-gradient sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[252px] shrink-0 flex-col overflow-hidden rounded-[30px] px-4 py-5 lg:flex">
          <div className="flex items-center gap-3 px-2 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,var(--accent-strong),#f97316)] text-lg font-semibold tracking-[-0.06em] text-white shadow-[0_12px_28px_rgba(244,63,94,0.28)]">
              CW
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-soft)]">
                App First
              </p>
              <p className="text-[20px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                CardWise
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--text-soft)]">
              Current Surface
            </p>
            <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-[var(--text-body)]">{description}</p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const isActive = active === item.key;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[inset_0_0_0_1px_var(--surface-border-strong)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-strong)]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[14px] transition-colors ${
                      isActive
                        ? "bg-white/80 text-[var(--accent-strong)]"
                        : "bg-[var(--surface-soft)] text-[var(--text-muted)] group-hover:text-[var(--accent-strong)]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_6px_rgba(251,113,133,0.12)]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--text-soft)]">
              Theme Core
            </p>
            <div className="mt-3 flex items-center gap-2">
              <ThemeSwatch className="bg-[linear-gradient(135deg,#fff8fb,#ffe4e6)] ring-[var(--surface-border-strong)]" />
              <ThemeSwatch className="bg-[linear-gradient(135deg,#ffffff,#f8fafc)]" />
              <ThemeSwatch className="bg-[linear-gradient(135deg,#3b0b1d,#12010a)]" />
            </div>
            <p className="mt-3 text-[13px] leading-6 text-[var(--text-body)]">
              Blossom를 기본으로 두고 Minimal, Glass 스킨을 페이지 단위로 덮어쓸 수 있게 준비했습니다.
            </p>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col gap-4 pb-[calc(var(--bottom-nav-height)+1.25rem)] lg:pb-0">
          <header className="cw-glass cw-card-gradient sticky top-3 z-20 overflow-hidden rounded-[30px] px-5 py-5 sm:px-6 lg:top-5 lg:px-7 lg:py-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(140deg,var(--accent-strong),#fb923c)] text-white shadow-[0_18px_32px_rgba(244,63,94,0.22)]">
                  <SparkIcon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--text-soft)]">
                    {eyebrow}
                  </p>
                  <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.06em] text-[var(--text-strong)] sm:text-[34px]">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[var(--text-body)] sm:text-[15px]">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {navItems.map((item) => {
                    const isActive = active === item.key;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition ${
                          isActive
                            ? "bg-[var(--accent)] text-white shadow-[0_10px_24px_rgba(244,63,94,0.24)]"
                            : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {actions ? (
                  <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-[12px] font-medium text-[var(--accent-strong)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      Rose Blossom
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[12px] font-medium text-[var(--text-muted)]">
                      390px app baseline
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="grid gap-4 sm:gap-5">{children}</main>

          <nav className="cw-glass fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-[430px] items-center justify-between rounded-[26px] border border-[var(--surface-border)] bg-[var(--surface-card)] px-2 py-2 shadow-[0_20px_45px_rgba(190,24,60,0.14)] lg:hidden">
            {navItems.map((item) => {
              const isActive = active === item.key;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-center"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-[16px] transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-[0_14px_30px_rgba(244,63,94,0.22)]"
                        : "bg-transparent text-[var(--text-muted)] group-hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span
                    className={`truncate text-[11px] font-medium ${
                      isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  tone = "default",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "minimal" | "glass";
}) {
  const toneClass =
    tone === "soft"
      ? "bg-[var(--surface-soft)]"
      : tone === "minimal"
        ? "bg-[var(--surface-elevated)] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        : tone === "glass"
          ? "bg-[var(--surface-card)] backdrop-blur-xl"
          : "cw-card-gradient";

  return (
    <section
      className={`cw-glass overflow-hidden rounded-[26px] border border-[var(--surface-border)] p-5 shadow-[var(--surface-shadow)] sm:p-6 ${toneClass} ${className}`}
    >
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-[13px] leading-6 text-[var(--text-body)] sm:text-[14px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 shadow-[0_12px_24px_rgba(190,24,60,0.06)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
        {label}
      </div>
      <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
        {value}
      </div>
      {helper ? <div className="mt-2 text-[13px] leading-5 text-[var(--text-muted)]">{helper}</div> : null}
    </div>
  );
}

export function Chip({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "emerald" | "rose" | "amber" | "violet";
  children: ReactNode;
}) {
  const toneClass: Record<"slate" | "emerald" | "rose" | "amber" | "violet", string> = {
    slate: "border-[var(--surface-border)] bg-[var(--surface-soft)] text-[var(--text-muted)]",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-600",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.02em] ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function ActionButton({
  kind = "secondary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "primary" | "secondary" | "ghost";
}) {
  const kindClass =
    kind === "primary"
      ? "border-transparent bg-[linear-gradient(135deg,var(--accent-strong),#fb923c)] text-white shadow-[0_14px_30px_rgba(244,63,94,0.22)] hover:translate-y-[-1px]"
      : kind === "ghost"
        ? "border-[var(--surface-border)] bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
        : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]";

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${kindClass} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
        {label}
      </span>
      <input
        {...props}
        className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--surface-border-strong)] focus:ring-4 focus:ring-[rgba(251,113,133,0.12)]"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
        {label}
      </span>
      <textarea
        {...props}
        className="min-h-32 rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--surface-border-strong)] focus:ring-4 focus:ring-[rgba(251,113,133,0.12)]"
      />
    </label>
  );
}

function ThemeSwatch({ className }: { className: string }) {
  return <span className={`h-8 w-8 rounded-full ring-1 ring-black/5 ${className}`} />;
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function InboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 5.5h16v11H15l-3 3-3-3H4z" />
      <path d="M8 9h8" />
      <path d="M8 12.5h5" />
    </svg>
  );
}

function LedgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 4.5h14a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H19v4a2 2 0 0 0 0 4v4H7.5A2.5 2.5 0 0 1 5 18.5v-11Z" />
      <path d="M5 11.5a2 2 0 0 0 0 4v-8a2 2 0 0 1 0 4Z" />
      <path d="M12 8.5v7" strokeDasharray="2.4 2.4" />
    </svg>
  );
}

function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 3 1.7 4.8L18.5 9l-4.8 1.2L12 15l-1.7-4.8L5.5 9l4.8-1.2Z" />
      <path d="M18.5 15.5 19.4 18l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9Z" />
    </svg>
  );
}
