import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { tr } from "@/content/tr";
import { trackLead } from "@/lib/analytics";

const siteUrl = "https://www.ascendlojistik.com/iletisim";

export const Route = createFileRoute("/iletisim")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: tr.contact.meta.title },
      { name: "description", content: tr.contact.meta.description },
      { property: "og:title", content: tr.contact.meta.title },
      { property: "og:description", content: tr.contact.meta.description },
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
          "@type": "ContactPage",
          name: tr.contact.meta.title,
          url: siteUrl,
          mainEntity: {
            "@type": "Organization",
            name: "ASCEND LOJİSTİK VE GEMİ ACENTE HİZ. DIŞ TİC. LTD. ŞTİ.",
            telephone: "+90 212 963 05 53",
            email: "info@ascendlojistik.com",
            address:
              "Ataköy 7-8-9-10.Kısım Mah. Çobançeşme E-5 Yanyol Cad. No:20/1 Ataköy Towers A Blok Kat:6 İç Kapı No:109, 34158 Bakırköy/İstanbul",
          },
        }),
      },
    ],
  }),
});

const infoIcons = [Phone, Mail, MapPin];

function ContactPage() {
  const { c } = useI18n();
  const k = c.contact;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const lines = Array.from(form.entries())
      .filter(([, value]) => String(value).trim())
      .map(([key, value]) => `${key}: ${String(value).trim()}`);
    const formType =
      e.currentTarget.dataset["formType"] === "quote" ? "Teklif Talebi" : "İletişim Talebi";
    trackLead(e.currentTarget.dataset["formType"] === "quote" ? "quote_mailto" : "contact_mailto");
    window.location.href = `mailto:info@ascendlojistik.com?subject=${encodeURIComponent(`Ascend Lojistik — ${formType}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <SiteLayout>
      <PageHero eyebrow={k.hero.eyebrow} title={k.hero.title} subtitle={k.hero.subtitle} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-10">
            <form
              onSubmit={onSubmit}
              data-form-type="quote"
              className="rounded-xl border border-border bg-card p-8 card-elevated lg:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-foreground">
                {k.quoteForm.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{k.quoteForm.subtitle}</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="company" label={k.quoteForm.fields.company} />
                <Field id="person" label={k.quoteForm.fields.person} />
                <Field id="email" label={k.quoteForm.fields.email} type="email" required />
                <Field id="phone" label={k.quoteForm.fields.phone} type="tel" />
                <Field id="origin" label={k.quoteForm.fields.origin} />
                <Field id="destination" label={k.quoteForm.fields.destination} />
                <div className="grid gap-2">
                  <Label htmlFor="mode">{k.quoteForm.fields.mode}</Label>
                  <select
                    id="mode"
                    name="mode"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {k.quoteForm.modes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <Field id="cargo" label={k.quoteForm.fields.cargo} />
                <div className="sm:col-span-2 grid gap-2">
                  <Label htmlFor="quote-message">{k.quoteForm.fields.message}</Label>
                  <Textarea id="quote-message" name="message" rows={4} />
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto">
                {k.quoteForm.submit}
              </Button>
            </form>

            <form
              onSubmit={onSubmit}
              data-form-type="contact"
              className="rounded-xl border border-border bg-card p-8 card-elevated lg:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-foreground">
                {k.contactForm.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{k.contactForm.subtitle}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="name" label={k.contactForm.fields.name} required />
                <Field id="c-email" label={k.contactForm.fields.email} type="email" required />
                <div className="sm:col-span-2">
                  <Field id="subject" label={k.contactForm.fields.subject} />
                </div>
                <div className="sm:col-span-2 grid gap-2">
                  <Label htmlFor="c-message">{k.contactForm.fields.message}</Label>
                  <Textarea id="c-message" name="message" rows={5} required />
                </div>
              </div>
              <Button type="submit" size="lg" variant="secondary" className="mt-8 w-full sm:w-auto">
                {k.contactForm.submit}
              </Button>
            </form>
          </div>

          <aside className="h-fit rounded-xl border border-navy-border p-8 surface-navy lg:sticky lg:top-20">
            <h2 className="font-display text-xl font-bold text-navy-foreground">{k.info.title}</h2>
            <ul className="mt-8 space-y-7">
              {k.info.items.map((item, i) => {
                const Icon = infoIcons[i] ?? Mail;
                return (
                  <li key={item.label} className="flex gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Icon className="h-5 w-5 text-navy-foreground" />
                    </span>
                    <div>
                      <p className="eyebrow text-navy-foreground/75">{item.label}</p>
                      <p className="mt-1.5 break-words text-sm font-medium text-navy-foreground">
                        {item.label === "Telefon" ? (
                          <a href="tel:+902129630553" onClick={() => trackLead("contact_phone")}>
                            {item.value}
                          </a>
                        ) : null}
                        {item.label === "E-posta" ? (
                          <a
                            href="mailto:info@ascendlojistik.com"
                            onClick={() => trackLead("contact_email")}
                          >
                            {item.value}
                          </a>
                        ) : null}
                        {item.label === "Adres" ? item.value : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 border-t border-navy-border pt-6 text-xs leading-relaxed text-navy-foreground/80">
              {k.info.note}
            </p>
          </aside>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} />
    </div>
  );
}
