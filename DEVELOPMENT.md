# Yerel geliştirme

Kaynak: Lovable `e6fc177a-239f-49ea-9b87-a6f1080236c4`, commit `a6c64fcf61a97c14ea80e0bae1311c419cfd1fb5`.
Hedef: https://github.com/erdemergand/ascend-lojistik (`main`).

Node.js 22.12+ ve Bun kullanın. Aktarım Bun 1.4.2 ile doğrulanmıştır. Mevcut `bun.lock` korunur; npm/yarn lockfile eklemeyin.

```sh
git clone https://github.com/erdemergand/ascend-lojistik.git
cd ascend-lojistik
bun install --frozen-lockfile
bun run dev --host 127.0.0.1
```

Codex'te bu depo klasörünü proje olarak açın. Terminalin gösterdiği yerel adresten siteye erişin.

```sh
bun run typecheck
bun run build
```

Build mevcut Cloudflare hedefi için yalnız yerel `.output/` çıktısı üretir; deploy/publish çalıştırmayın. `bun run lint` ayrıca mevcut ESLint kurallarını çalıştırır.

Sayfalar `src/routes/`, Türkçe içerik `src/content/tr.ts`, header/logo `src/components/site/`, tema `src/components/theme/` altındadır. Resmî görseller `public/__l5e/assets-v1/` altında tutulur; varlık metadata dosyalarının URL'leri değişmeden yerelde çözülür.

GA4 `G-47EHL67FSH`, light/dark tema, resmî logolar, `Dijital Portal — Yakında`, Gemi Acenteliği ve `https://www.ascendlojistik.com` canonical/SEO yapısı korunmalıdır. Formlar yalnız `info@ascendlojistik.com` için mailto açar; gönderim başarısı iddia etmez. Global ağ hakkında doğrulanmamış iddia eklemeyin. Gelecekte müşteri Profit/Share/Share TL göremez, NCTS finans yalnız admin'dir; ayrıntılı kurallar `AGENTS.md` içindedir.

Lovable'ın kalıcı GitHub bağlantısı, dosyaların GitHub'a aktarılmasından ayrı bir ayardır. Bağlantı doğrulanmadan çift yönlü otomatik senkronizasyon varsaymayın. Her aktarım öncesi Lovable güncel commit'ini, GitHub HEAD'i ve yerel değişiklikleri karşılaştırın; force push kullanmayın.
