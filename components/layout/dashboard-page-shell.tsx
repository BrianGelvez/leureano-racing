import Link from "next/link";
import { type ReactNode, Fragment } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardBreadcrumbItem = { href?: string; label: string };

export function DashboardPage({
  children,
  className,
  narrow,
}: {
  children: ReactNode;
  className?: string;
  /** Formularios y vistas de una columna (misma sensación que /productos/nuevo) */
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-8 pb-4 md:pb-8",
        narrow && "mx-auto max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashboardBreadcrumb({ items }: { items: DashboardBreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-sm text-white/45"
      aria-label="Migas de pan"
    >
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && (
            <ChevronRight
              className="h-4 w-4 shrink-0 text-white/25"
              aria-hidden
            />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-white/80"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white/70">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

const backButtonClass =
  "mt-0.5 shrink-0 rounded-xl border border-white/10 bg-black/20 hover:bg-white/10";

export function DashboardHeroBadge({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E01010]/35 bg-[#E01010]/10 px-2.5 py-0.5 text-xs font-medium text-[#ff6b6b]">
      {icon}
      {children}
    </span>
  );
}

export type DashboardHeroStep = {
  step: number;
  title: string;
  subtitle: string;
  tone?: "active" | "muted";
};

export function DashboardHero({
  backHref,
  backLabel,
  badge,
  title,
  description,
  icon,
  actions,
  steps,
}: {
  backHref?: string;
  backLabel?: string;
  badge?: ReactNode;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  steps?: DashboardHeroStep[];
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-transparent to-[#E01010]/[0.12] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E01010]/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          {backHref ? (
            <Button
              variant="ghost"
              size="icon"
              className={backButtonClass}
              asChild
            >
              <Link href={backHref} aria-label={backLabel ?? "Volver"}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <div className="min-w-0 space-y-2">
            {badge}
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <div className="max-w-2xl text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          {icon ? (
            <div
              className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#E01010]/15 sm:flex"
              aria-hidden
            >
              {icon}
            </div>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div>
          ) : null}
        </div>
      </div>
      {steps && steps.length > 0 ? (
        <ol className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
          {steps.map((s) => (
            <li
              key={s.step}
              className={cn(
                "flex flex-1 items-start gap-3 rounded-xl px-4 py-3",
                s.tone === "muted"
                  ? "border border-dashed border-white/15 bg-white/[0.02]"
                  : "border border-white/10 bg-black/25"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  s.tone === "muted"
                    ? "border border-white/20 bg-white/5 text-white/70"
                    : "bg-[#E01010] text-white"
                )}
              >
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{s.title}</p>
                <p className="text-xs text-white/45">{s.subtitle}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </header>
  );
}

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-white/25">{icon}</div> : null}
      <p className="text-base font-medium text-white/85">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-white/50">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function DashboardCallout({
  variant = "warning",
  title,
  description,
  action,
}: {
  variant?: "warning" | "info";
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 text-center",
        variant === "warning" &&
          "border-amber-500/30 bg-amber-500/[0.06]",
        variant === "info" && "border-sky-500/25 bg-sky-500/[0.06]"
      )}
    >
      <p
        className={cn(
          "text-sm font-medium",
          variant === "warning" && "text-amber-100/95",
          variant === "info" && "text-sky-100/90"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-white/50">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
