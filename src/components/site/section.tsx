import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "light" | "muted" | "navy";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 lg:py-28",
        tone === "muted" && "bg-muted",
        tone === "navy" && "surface-navy",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "navy";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn("eyebrow", tone === "navy" ? "text-navy-foreground" : "text-primary")}>{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "mt-3 text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-[2.75rem]",
          tone === "navy" ? "text-navy-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "navy" ? "font-medium text-navy-foreground/90" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="surface-navy relative overflow-hidden">
      <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-page relative py-24 lg:py-32">
        <div className="max-w-3xl animate-rise">
          <p className="eyebrow text-navy-foreground">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] text-navy-foreground [text-shadow:0_2px_20px_var(--navy-deep)] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-navy-foreground/90">{subtitle}</p>
          ) : null}
          {children}
        </div>
      </div>
    </header>
  );
}
