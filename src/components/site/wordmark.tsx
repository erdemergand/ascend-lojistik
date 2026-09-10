import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";
import lightLogo from "@/assets/ascend-logo-light.svg.asset.json";
import darkLogo from "@/assets/ascend-logo-dark.svg.asset.json";
import neutralLogo from "@/assets/ascend-logo-neutral.svg.asset.json";

const sources = {
  light: lightLogo.url,
  dark: darkLogo.url,
  neutral: neutralLogo.url,
} as const;

export function Wordmark({
  className,
  variant,
}: {
  className?: string;
  tone?: "light" | "dark";
  variant?: "light" | "dark" | "neutral";
}) {
  const { c } = useI18n();
  const { resolvedTheme } = useTheme();
  const selected = variant ?? (resolvedTheme === "dark" ? "dark" : "light");
  const label = `${c.brand.name} ${c.brand.suffix}`;

  return (
    <Link
      to="/"
      aria-label={label}
      className={cn("block h-14 w-auto shrink-0 overflow-visible sm:h-16", className)}
    >
      <img
        src={sources[selected]}
        alt={label}
        loading="eager"
        decoding="async"
        className="h-full w-auto object-contain object-left"
        width={300}
        height={200}
      />
    </Link>
  );
}

export function HeaderLogo({ className }: { className?: string }) {
  return <Wordmark {...(className ? { className } : {})} />;
}

export function FooterLogo() {
  return <Wordmark variant="dark" className="h-20 sm:h-24" />;
}
