import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type NavKey = "home" | "inbox" | "adjustments" | "vouchers" | "performance";

const navItems: Array<{ href: string; label: string; key: NavKey }> = [
  { href: "/", label: "Home", key: "home" },
  { href: "/inbox", label: "Inbox", key: "inbox" },
  { href: "/adjustments", label: "Adjustments", key: "adjustments" },
  { href: "/vouchers", label: "Vouchers", key: "vouchers" },
  { href: "/performance/1", label: "Performance", key: "performance" },
];

export function AppShell({
  title,
  eyebrow,
  description,
  children,
  actions,
  active,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  active: NavKey;
}) {
  return (
    <div className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(16,185,129,0.16))] shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">
                  {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {description}
                </p>
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive =
                  active === item.key ||
                  (active === "performance" && item.key === "performance");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="grid gap-5">{children}</main>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.94))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.32)] ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </div>
      {helper ? <div className="mt-1 text-sm text-slate-400">{helper}</div> : null}
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
    slate: "border-white/10 bg-white/5 text-slate-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClass[tone]}`}
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
      ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50 hover:bg-emerald-300/25"
      : kind === "ghost"
        ? "border-white/10 bg-white/0 text-slate-200 hover:bg-white/10"
        : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10";

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${kindClass} ${className}`}
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
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <input
        {...props}
        className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/10"
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
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <textarea
        {...props}
        className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/10"
      />
    </label>
  );
}
