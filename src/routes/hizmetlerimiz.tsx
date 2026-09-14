import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { trackLead } from "@/lib/analytics";

const siteUrl = "https://www.ascendlojistik.com/hizmetlerimiz";

export const Route = createFileRoute("/hizmetlerimiz")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: tr.services.meta.title },
      { name: "description", content: tr.services.meta.description },
      { property: "og:title", content: tr.services.meta.title },
      { property: "og:description", content: tr.services.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": tr.services.items.map((item) => ({
            "@type": "Service",
            name: item.title,
            description: item.short,
            provider: { "@type": "Organization", name: "Ascend Lojistik" },
          })),
        }),
      },
    ],
  }),
});

function ServicesPage() {
  const { c } = useI18n();
  const s = c.services;

  return (
    <SiteLayout>
      <PageHero eyebrow={s.hero.eyebrow} title={s.hero.title} subtitle={s.hero.subtitle} />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 card-elevated"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                <ServiceIcon name={item.icon} className="h-6 w-6 text-primary" />
              </span>
              <span className="min-w-0 flex-1 font-display text-base font-bold text-foreground">
                {item.title}
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                İncele
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="muted" className="pt-0">
        <div className="space-y-6">
          {s.items.map((item, i) => (
            <article
              key={item.id}
              id={item.id}
              className="scroll-mt-28 grid gap-8 rounded-xl border border-border bg-card p-8 card-elevated lg:grid-cols-[0.9fr_1.1fr] lg:p-12"
            >
              <div>
                <p className="eyebrow text-primary">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-4 text-2xl font-bold text-foreground lg:text-3xl">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
              <ul className="grid content-start gap-4 border-border lg:border-l lg:pl-10">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <SectionHeading tone="navy" title={s.cta.title} subtitle={s.cta.subtitle} />
          <Button asChild size="lg" className="shrink-0">
            <Link to="/iletisim" onClick={() => trackLead("services_quote")}>
              {s.cta.button}
            </Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
