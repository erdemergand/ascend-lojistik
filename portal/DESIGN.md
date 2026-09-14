# Portal tasarım bağlamı
Yerel, yalnız iç kullanım prototipi. Üretim yetkilendirmesi değildir.
Mor #302080, vurgu #6350b7, yeşil #168477, zemin #f2f4fa, metin #17243b.
Resmî Ascend logo oranları korunur. Dünya haritası public/brand/world-map.svg kaynaklıdır.
Manrope arayüz, Space Grotesk başlık, DM Sans menü; Arial belge; tabular numerals finans. Ortak görünüm portal-design.css ve site renklerini uyarlayan portal-theme.css.
Raporlar yalnız Yönetici: iki modülde tarih/döviz filtreleri ve firma bazında yatay grafikler.
Alıcı firma gruplaması; dövizler ayrı. Lojistikte eksik maliyetler kazanç hesabına girmez. NCTS maliyet içermez; nakliye ve teminat ücretleri toplamı raporlanır.
Dar ekranda tek kolon; görünür odak; reduced-motion; yazdırmada rapor arayüzü gizli.

Ana sayfa haritası yalnız ayrı dekoratif alanda; modül kartlarının arkasında görsel bulunmaz. NCTS firma kartları menüsü kaldırıldı. Dar ekranda tablolar kendi alanında kayar.

- Lojistik finans: müşteri toplamı Toplam Navlun olarak görür; Görüntüle yük bilgi formunu yazdırma/PDF önizlemesinde açar. Personel finans düzenlemesinde yalnız varış ve ödeme tarihlerini kaydedebilir; diğer mali alanlar değişmez.

## Website-aligned theme
Runtime source: src/styles.css color and typography tokens, adapted by portal-theme.css. Manrope body, Space Grotesk headings, DM Sans navigation; fonts served locally. Official light/dark SVG logo variants are copied without modification. portal-theme.js owns persisted theme and shared labels. Native selects and dates preserve platform interaction. User-management company selection uses the existing local company cards; a registered company is required for Görüntüleme on create and edit. Customer account company linkage is prototype metadata, not deployed tenant authorization.

## Canonical UI Map
| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native HTML select | Existing portal forms | Native OS popup | Company selection browser check and user-company tests |
| Date | Native date input | Existing shipment forms | Native OS date picker | Shipment tests |
| Form | User management saveUser and shared theme field labels | Company card records | Create and edit | user-company tests |
| Theme | portal-theme.js and portal-theme.css | src/styles.css | Light and dark | Browser screenshots |
