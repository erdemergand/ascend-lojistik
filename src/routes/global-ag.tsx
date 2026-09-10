import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { WorldMap } from "@/components/site/world-map";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";
import { trackLead } from "@/lib/analytics";

const siteUrl = "https://www.ascendlojistik.com/global-ag";

export const Route = createFileRoute("/global-ag")({
  component: NetworkPage,
  head: () => ({
    meta: [
      { title: tr.network.meta.title },
      { name: "description", content: tr.network.meta.description },
      { property: "og:title", content: tr.network.meta.title },
      { property: "og:description", content: tr.network.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
});

function NetworkPage() {
  const { c } = useI18n();
  const n = c.network;
  const [active, setActive] = useState<string | null>(null);

  return (
    <SiteLayout>
      <PageHero eyebrow={n.hero.eyebrow} title={n.hero.title} subtitle={n.hero.subtitle} />

      <section className="surface-navy pb-20 lg:pb-28">
        <div className="container-page">
          <div className="rounded-xl border border-navy-border bg-navy-deep/50 p-4 sm:p-8">
            <WorldMap activeRegion={active} onRegionHover={setActive} />
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow={n.hero.eyebrow} title={n.regionsTitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {n.regions.map((r) => (
            <article
              key={r.id}
              onMouseEnter={() => setActive(r.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(r.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === r.id ? null : r.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActive(active === r.id ? null : r.id);
                }
              }}
              role="button"
              aria-pressed={active === r.id}
              aria-label={`${r.name} bölgesini haritada vurgula`}
              tabIndex={0}
              className={cn(
                "rounded-xl border border-border bg-card p-7 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring card-elevated",
                active === r.id ? "-translate-y-1 border-primary/50" : "",
              )}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12">
                <Globe2 className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{r.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={n.strengthsTitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {n.strengths.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-8 card-elevated">
              <p className="font-display text-3xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Button asChild size="lg">
            <Link to="/iletisim" onClick={() => trackLead("network_quote")}>{c.nav.cta}</Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
