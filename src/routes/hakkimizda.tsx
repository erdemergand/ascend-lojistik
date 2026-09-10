import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Compass, Target } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { trackLead } from "@/lib/analytics";

const siteUrl = "https://www.ascendlojistik.com/hakkimizda";

export const Route = createFileRoute("/hakkimizda")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: tr.about.meta.title },
      { name: "description", content: tr.about.meta.description },
      { property: "og:title", content: tr.about.meta.title },
      { property: "og:description", content: tr.about.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
});

function AboutPage() {
  const { c } = useI18n();
  const a = c.about;

  return (
    <SiteLayout>
      <PageHero eyebrow={a.hero.eyebrow} title={a.hero.title} subtitle={a.hero.subtitle} />

      <section className="border-b border-border bg-muted py-8">
        <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-3xl font-bold text-primary">2022</p>
          <p className="max-w-2xl text-sm font-semibold text-foreground sm:text-right">Türkiye’den Avrupa, Amerika, Uzak Doğu, Orta Doğu ve Afrika’ya uzanan global erişim.</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <article>
            <SectionHeading eyebrow={a.story.eyebrow} title={a.story.title} />
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
              {a.story.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </article>

          <aside className="rounded-xl border border-border bg-card p-8 card-elevated">
            <h3 className="font-display text-xl font-bold text-foreground">{a.story.pillarsTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.story.pillarsIntro}</p>
            <ul className="mt-6 space-y-4">
              {a.story.pillars.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            { icon: Target, label: a.mission.label, text: a.mission.text },
            { icon: Compass, label: a.vision.label, text: a.vision.text },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-navy-border bg-navy-card/60 p-8 backdrop-blur lg:p-10"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <item.icon className="h-6 w-6 text-navy-foreground" />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-navy-foreground">{item.label}</h2>
              <p className="mt-4 text-base leading-relaxed text-navy-foreground/85">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-card p-10 card-elevated md:flex-row md:items-center">
          <p className="max-w-2xl font-display text-2xl font-bold leading-snug text-foreground">
            {c.home.about.quote}
          </p>
          <Button asChild size="lg">
            <Link to="/iletisim" onClick={() => trackLead("about_quote")}>{c.nav.cta}</Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
