# Ascend Lojistik — Codex geliştirme bağlamı

- Aktif geliştirme ortamı yerel Codex ve bu Git deposudur. Kullanıcının tercihi gereği şimdilik Lovable kullanılmaz; orada değişiklik veya senkronizasyon başlatma.
- Bu depo Lovable'a otomatik bağlı değildir. Lovable yalnız geçmiş kaynak referansıdır. Yayımlanmış Git geçmişini yeniden yazma; force push kullanma.

- Kaynak Lovable proje: `e6fc177a-239f-49ea-9b87-a6f1080236c4`.
- Aktarım tabanı: `a6c64fcf61a97c14ea80e0bae1311c419cfd1fb5` (10 Eylül 2026 son tamamlanmış sürüm).
- GitHub hedefi: `https://github.com/erdemergand/ascend-lojistik`.
- Stack: TanStack Start, React, TypeScript, Tailwind CSS. Paket yöneticisi mevcut `bun.lock` ve `bunfig.toml` nedeniyle Bun'dır. Lockfile'ı gerekmedikçe değiştirme; `bun install --frozen-lockfile` kullan.
- Değişikliklerden sonra `bun run typecheck` ve `bun run build` çalıştır. Build yayınlama değildir; açık talimat olmadan deploy/publish yapma.
- Lovable ve GitHub içeriklerini eşitlemeden önce her iki tarafın güncel sürümünü ve yerel değişiklikleri incele. Dolu depoyu körlemesine overwrite etme; force push ve yayımlanmış geçmişi yeniden yazma.

## Korunacak ürün ve marka kuralları

- GA4 Measurement ID: `G-47EHL67FSH`. Tek script ve sayfa geçişi/event davranışını koru; çift ölçüm oluşturma.
- Light/dark theme, mobil görünüm ve resmî Ascend logo varyantlarını koru. Logoları yeniden çizme, oranlarını bozma veya placeholder ile değiştirme.
- Header CTA tam metni: `Dijital Portal — Yakında`; portalı çalışan bir ürün gibi sunma.
- İletişim ve teklif formları şu an `mailto:info@ascendlojistik.com` ile kullanıcının e-posta uygulamasını açar. Backend gönderimi yoktur; sahte başarı/teslim edildi mesajı gösterme.
- Production canonical domain: `https://www.ascendlojistik.com`. Sitemap, robots ve Organization/ContactPage/Service structured data'yı koru; tüm canonical adresleri absolute tut.
- Hizmetler arasında **Gemi Acenteliği** bulunur.
- Türkçe içerik, mevcut marka renkleri ve doğrulanmış kurumsal bilgiler korunmalıdır. Global ağ metinleri yalnızca doğrulanmış coğrafi kapsam ile acente/iş ortaklığı ağına dayanır; ofis, sayı, sertifika, servis sıklığı veya sahip olunan tesis uydurma.
- Gelecekteki portalda müşteri **Profit / Share / Share TL** alanlarını göremez. **NCTS finans yalnız admin** erişimine açıktır. Sadece arayüzde gizlemek yeterli değildir: sunucu/API, veri sorgusu, export ve rol/tenant yetkilendirmesinde de bu sınırlar uygulanmalıdır. Gerçek müşteri veya finans verisini tanıtım arayüzüne koyma.

## Varlıklar ve yerel çalışma

- Portal Acente/Taşıyıcı bilgileri yalnız şirket personeline açıktır. Müşteri ekranı, API, sorgu, arama, export, e-posta ve PDF çıktılarında ad, kimlik ve iletişim bilgileri açığa çıkarılmaz; yalnız arayüzde gizlemek yeterli değildir.

- `src/assets/*.asset.json` Lovable varlık kimliklerini saklar. Gerçek logo ve hero dosyaları aynı URL yolunda `public/__l5e/assets-v1/` altında yerel olarak bulunur; dış Lovable varlık servisine bağımlılık gerektirmez.
- `public/brand/world-map.svg` özgün haritadır. Varlık değişikliklerinde dark/light ve mobil görünümü kontrol et.
- `@lovable.dev/vite-tanstack-config` mevcut eklentileri sağlar; aynı TanStack/React/Tailwind eklentilerini ikinci kez ekleme.
- `DEVELOPMENT.md` kurulum ve doğrulama adımlarını içerir.

- Kullanıcı tercihi (15 Eylül 2026): Tamamlanan güncellemeleri kontrollerden sonra commit ve push yap. Force push ve deploy yapma; yerel çalışma verilerini veya sırları Git’e ekleme.
