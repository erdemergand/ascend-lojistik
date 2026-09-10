import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Container, Plane, Ship, Truck } from "lucide-react";
import heroAsset from "@/assets/hero-port.jpg.asset.json";
import { SiteLayout } from "@/components/site/site-layout";
import { Section, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { WorldMap } from "@/components/site/world-map";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { trackLead } from "@/lib/analytics";

const title = "Ascend Lojistik | Global Uluslararası Taşımacılık Çözümleri";
const description =
  "Ascend Lojistik; Avrupa, Amerika, Uzak Doğu, Orta Doğu ve Afrika’da karayolu, denizyolu, havayolu ve multimodal taşımacılık çözümleri sunar.";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.ascendlojistik.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ASCEND LOJİSTİK VE GEMİ ACENTE HİZ. DIŞ TİC. LTD. ŞTİ.",
          url: "https://www.ascendlojistik.com/",
          telephone: "+90 212 963 05 53",
          email: "info@ascendlojistik.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Ataköy 7-8-9-10.Kısım Mah. Çobançeşme E-5 Yanyol Cad. No:20/1 Ataköy Towers A Blok Kat:6 İç Kapı No:109",
            postalCode: "34158",
            addressLocality: "Bakırköy",
            addressRegion: "İstanbul",
            addressCountry: "TR",
          },
          foundingDate: "2022",
          description,
          areaServed: ["Avrupa", "Kuzey Amerika", "Güney Amerika", "Uzak Doğu", "Orta Doğu", "Afrika"],
        }),
      },
    ],
    links: [{ rel: "canonical", href: "https://www.ascendlojistik.com/" }],
  }),
});

function HomePage() {
  const { c } = useI18n();
  const h = c.home;
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  return (
    <SiteLayout>
      {/* 1 — Hero */}
      <section className="relative isolate flex min-h-[min(92vh,56rem)] items-center overflow-hidden surface-navy">
        <img
          src={heroAsset.url}
          alt="Gece vakti konteyner limanında yükleme yapan gemi ve vinçler"
          width={1920}
          height={1088}
          fetchPriority="high"
          sizes="100vw"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          className="hero-overlay absolute inset-0"
          aria-hidden="true"
        />
        <div className="grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-8 hidden justify-end lg:flex" aria-hidden="true">
          <div className="flex items-center gap-5 text-navy-foreground/55">
            <Truck className="h-5 w-5" />
            <span className="h-px w-14 bg-navy-border" />
            <Container className="h-5 w-5" />
            <span className="h-px w-14 bg-navy-border" />
            <Ship className="h-5 w-5" />
            <span className="h-px w-14 bg-navy-border" />
            <Plane className="h-5 w-5" />
          </div>
        </div>

        <div className="container-page relative py-32 sm:py-36 lg:py-40">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow text-navy-foreground">{h.hero.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.03] text-navy-foreground [text-shadow:0_2px_24px_var(--navy-deep)] sm:text-6xl lg:text-7xl">
              {h.hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-relaxed text-navy-foreground/90 [text-shadow:0_1px_12px_var(--navy-deep)] sm:text-lg lg:text-xl">
              {h.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/iletisim" onClick={() => trackLead("home_hero_quote")}>{h.hero.primaryCta}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-navy-border bg-transparent px-7 text-base text-navy-foreground hover:bg-navy-card hover:text-navy-foreground"
              >
                <Link to="/hizmetlerimiz">{h.hero.secondaryCta}</Link>
              </Button>
            </div>
            <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
              {h.hero.badges.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-semibold text-navy-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-foreground" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2 — Hizmetler */}
      <Section tone="muted">
        <SectionHeading eyebrow={h.services.eyebrow} title={h.services.title} subtitle={h.services.subtitle} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {c.services.items.map((s) => (
            <Link
              key={s.id}
              to="/hizmetlerimiz"
              hash={s.id}
              className="group rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 card-elevated"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/12">
                <ServiceIcon name={s.icon} className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-6 font-display text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Detay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <Button asChild size="lg" variant="secondary">
            <Link to="/hizmetlerimiz">{h.services.cta}</Link>
          </Button>
        </div>
      </Section>

      {/* 3 — Neden Ascend */}
      <Section>
        <SectionHeading eyebrow={h.why.eyebrow} title={h.why.title} />
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {h.why.items.map((item) => (
            <div key={item.title} className="bg-card p-8">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/12">
                <Check className="h-4.5 w-4.5 text-primary" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <Button asChild variant="link" className="mt-8 h-auto p-0 text-base">
          <Link to="/hakkimizda">2022’den bugüne kurumsal profilimiz <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </Section>

      {/* 4 — Global erişim */}
      <Section tone="navy">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading
              tone="navy"
              eyebrow={h.network.eyebrow}
              title={h.network.title}
              subtitle={h.network.subtitle}
            />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {c.network.regions.map((r) => (
                <li
                  key={r.id}
                  onMouseEnter={() => setActiveRegion(r.id)}
                  onMouseLeave={() => setActiveRegion(null)}
                   onFocus={() => setActiveRegion(r.id)}
                   onBlur={() => setActiveRegion(null)}
                   onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)}
                   onKeyDown={(event) => {
                     if (event.key === "Enter" || event.key === " ") {
                       event.preventDefault();
                       setActiveRegion(activeRegion === r.id ? null : r.id);
                     }
                   }}
                   role="button"
                   aria-pressed={activeRegion === r.id}
                   aria-label={`${r.name} bölgesini haritada vurgula`}
                   tabIndex={0}
                   className="rounded-lg border border-navy-border bg-navy-deep/25 px-4 py-3 text-sm font-semibold text-navy-foreground/90 outline-none transition-colors hover:border-navy-foreground/40 hover:bg-navy-card hover:text-navy-foreground focus-visible:ring-2 focus-visible:ring-navy-foreground"
                >
                  {r.name}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-10">
              <Link to="/global-ag">{h.network.cta}</Link>
            </Button>
          </div>
          <WorldMap activeRegion={activeRegion} onRegionHover={setActiveRegion} />
        </div>
      </Section>

      {/* 5 — Dijital çözümler */}
      <Section tone="navy">
        <SectionHeading
          tone="navy"
          eyebrow={h.digital.eyebrow}
          title={h.digital.title}
          subtitle={h.digital.subtitle}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.digital.modules.map((m) => (
            <article
              key={m.id}
              className="rounded-xl border border-navy-border bg-navy-card/50 p-7 backdrop-blur transition-colors hover:border-primary/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15">
                <ServiceIcon name={m.icon} className="h-5 w-5 text-navy-foreground" />
              </span>
              <h3 className="mt-6 font-display text-base font-bold text-navy-foreground">{m.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-foreground/85">{m.text}</p>
            </article>
          ))}
        </div>
        <Button asChild size="lg" variant="outline" className="mt-12 border-navy-border bg-transparent text-navy-foreground hover:bg-navy-card hover:text-navy-foreground">
          <Link to="/dijital-cozumler">{h.digital.cta}</Link>
        </Button>
      </Section>

      {/* 6 — Teklif çağrısı */}
      <Section>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 card-elevated sm:p-10 lg:p-16">
          <div className="relative max-w-3xl">
            <p className="eyebrow text-primary">{h.quote.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {h.quote.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground lg:text-lg">
              {h.quote.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/iletisim" onClick={() => trackLead("home_final_quote")}>{h.quote.primaryCta}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <Link to="/iletisim" onClick={() => trackLead("home_final_contact")}>{h.quote.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}
