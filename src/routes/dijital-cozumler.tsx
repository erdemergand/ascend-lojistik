import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { trackLead } from "@/lib/analytics";

const siteUrl = "https://www.ascendlojistik.com/dijital-cozumler";

export const Route = createFileRoute("/dijital-cozumler")({
  component: DigitalPage,
  head: () => ({
    meta: [
      { title: tr.digital.meta.title },
      { name: "description", content: tr.digital.meta.description },
      { property: "og:title", content: tr.digital.meta.title },
      { property: "og:description", content: tr.digital.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
});

function DigitalPage() {
  const { c } = useI18n();
  const d = c.digital;

  return (
    <SiteLayout>
      <PageHero eyebrow={d.hero.eyebrow} title={d.hero.title} subtitle={d.hero.subtitle}>
        <p className="mt-6 inline-block rounded-full border border-navy-foreground/25 bg-navy-deep/30 px-4 py-1.5 text-xs font-semibold text-navy-foreground/90">
          {d.hero.note}
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {d.modules.map((m) => (
            <article key={m.id} className="rounded-xl border border-border bg-card p-8 card-elevated">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/12">
                  <ServiceIcon name={m.icon} className="h-6 w-6 text-primary" />
                </span>
                <h2 className="font-display text-xl font-bold text-foreground">{m.title}</h2>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <SectionHeading
          tone="navy"
          eyebrow={d.preview.eyebrow}
          title={d.preview.title}
          subtitle={d.preview.subtitle}
        />
        <div className="mt-12 overflow-hidden rounded-xl border border-navy-border bg-navy-card/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-navy-border px-5 py-4">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-navy-muted/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-navy-muted/40" />
            <span className="ml-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-navy-foreground/85">
              Ascend Portal — Demo
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-border text-xs uppercase tracking-widest text-navy-foreground/80">
                  {d.preview.columns.map((col) => (
                    <th key={col} scope="col" className="px-5 py-4 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.preview.rows.map((r) => (
                  <tr key={r.ref} className="border-b border-navy-border/60 last:border-0">
                    <td className="px-5 py-4 font-display font-semibold text-navy-foreground">{r.ref}</td>
                    <td className="px-5 py-4 text-navy-foreground/85">{r.route}</td>
                    <td className="px-5 py-4 text-navy-foreground/85">{r.mode}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-navy-foreground/12 px-3 py-1 text-xs font-semibold text-navy-foreground">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-12">
          <Button asChild size="lg">
            <Link to="/iletisim" onClick={() => trackLead("digital_contact")}>{c.nav.cta}</Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
