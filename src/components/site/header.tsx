import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MonitorUp, X } from "lucide-react";
import { HeaderLogo } from "./wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackLead } from "@/lib/analytics";

export function Header() {
  const { c } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;
    const update = () => {
      setScrolled((current) => {
        const next = current ? window.scrollY > 24 : window.scrollY > 72;
        return current === next ? current : next;
      });
      frameId = null;
    };
    const onScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const links = [
    { to: "/", label: c.nav.home },
    { to: "/hakkimizda", label: c.nav.about },
    { to: "/hizmetlerimiz", label: c.nav.services },
    { to: "/global-ag", label: c.nav.network },
    { to: "/dijital-cozumler", label: c.nav.digital },
    { to: "/iletisim", label: c.nav.contact },
  ] as const;

  return (
    <header
      data-compact={scrolled ? "true" : "false"}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-header-border bg-header/95 font-nav backdrop-blur-xl transition-shadow duration-300",
        scrolled || open ? "shadow-[var(--shadow-header)]" : "shadow-none",
      )}
    >
      <div
        className={cn(
          "container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-3 transition-[padding] duration-500 ease-out lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5",
          scrolled ? "lg:py-2" : "lg:py-4",
        )}
      >
        <HeaderLogo
          className={cn(
            "h-[4.5rem] transition-[height] duration-500 ease-out sm:h-20",
            scrolled ? "lg:h-14" : "lg:h-24",
          )}
        />

        <nav className="hidden min-w-0 lg:block" aria-label="Ana menü">
          <ul className="flex min-w-0 items-center justify-center gap-0.5">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  className="group relative block whitespace-nowrap px-2 py-3 text-xs font-semibold text-header-muted transition-colors hover:text-header-foreground data-[status=active]:text-header-foreground xl:px-3 xl:text-[0.8125rem]"
                >
                  {link.label}
                  <span className="absolute inset-x-2 bottom-1 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2.5">
          <Button
            asChild
            className="h-9 gap-1.5 px-3 text-xs font-semibold shadow-[var(--shadow-portal)] sm:h-10 sm:px-4 sm:text-sm lg:h-11 lg:px-4"
          >
            <Link to="/dijital-cozumler" onClick={() => setOpen(false)}>
              <MonitorUp className="h-4 w-4" />
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">Dijital Portal — Yakında</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hidden h-11 border-header-border bg-transparent px-4 text-header-foreground hover:bg-header-accent hover:text-header-foreground xl:inline-flex"
          >
            <Link to="/iletisim" onClick={() => trackLead("header_quote")}>
              {c.nav.cta}
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            className="h-9 w-9 text-header-foreground hover:bg-header-accent sm:h-10 sm:w-10 lg:hidden"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-header-border bg-header shadow-[var(--shadow-header)] lg:hidden"
        >
          <ul className="container-page flex flex-col py-4">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: link.to === "/" }}
                  className="block border-b border-header-border py-3.5 text-sm font-semibold text-header-muted transition-colors hover:text-header-foreground data-[status=active]:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full border-header-border bg-transparent text-header-foreground hover:bg-header-accent hover:text-header-foreground"
              >
                <Link
                  to="/iletisim"
                  onClick={() => {
                    setOpen(false);
                    trackLead("mobile_menu_quote");
                  }}
                >
                  {c.nav.cta}
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
