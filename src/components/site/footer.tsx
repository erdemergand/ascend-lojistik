import { Link } from "@tanstack/react-router";
import { FooterLogo } from "./wordmark";
import { useI18n } from "@/i18n";
import { trackLead } from "@/lib/analytics";

export function Footer() {
  const { c } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="surface-navy border-t border-navy-border">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2 lg:pr-12">
            <FooterLogo />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-navy-foreground/85">{c.footer.about}</p>
            <p className="mt-6 font-display text-base font-semibold text-navy-foreground">
              {c.footer.slogan}
            </p>
          </div>

          <div>
            <h3 className="eyebrow text-navy-foreground">{c.footer.columns.pages}</h3>
            <ul className="mt-5 space-y-3 text-sm text-navy-foreground/85">
              <li><Link to="/" className="transition-colors hover:text-navy-foreground">{c.nav.home}</Link></li>
              <li><Link to="/hakkimizda" className="transition-colors hover:text-navy-foreground">{c.nav.about}</Link></li>
              <li><Link to="/hizmetlerimiz" className="transition-colors hover:text-navy-foreground">{c.nav.services}</Link></li>
              <li><Link to="/global-ag" className="transition-colors hover:text-navy-foreground">{c.nav.network}</Link></li>
              <li><Link to="/dijital-cozumler" className="transition-colors hover:text-navy-foreground">{c.nav.digital}</Link></li>
              <li><Link to="/iletisim" className="transition-colors hover:text-navy-foreground">{c.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-navy-foreground">{c.footer.columns.services}</h3>
            <ul className="mt-5 space-y-3 text-sm text-navy-foreground/85">
              {c.services.items.map((s) => (
                <li key={s.id}>
                  <Link to="/hizmetlerimiz" hash={s.id} className="transition-colors hover:text-navy-foreground">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-8 text-navy-foreground">{c.footer.columns.contact}</h3>
            <address className="mt-4 space-y-2 text-sm not-italic text-navy-foreground/85">
              <p><a href="tel:+902129630553" onClick={() => trackLead("footer_phone")} className="hover:text-navy-foreground">0212 963 0553</a></p>
              <p><a href="mailto:info@ascendlojistik.com" onClick={() => trackLead("footer_email")} className="hover:text-navy-foreground">info@ascendlojistik.com</a></p>
              <p>Ataköy 7-8-9-10.Kısım Mah. Çobançeşme E-5 Yanyol Cad. No:20/1 Ataköy Towers A Blok Kat:6 İç Kapı No:109, 34158 Bakırköy/İstanbul</p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-navy-border pt-8 text-xs text-navy-foreground/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {c.brand.name} {c.brand.suffix}. {c.footer.rights}
          </p>
          <p className="font-display tracking-[0.2em] uppercase">{c.brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
