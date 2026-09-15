# Site ve portal bağlantısı — yayın hazırlığı

Durum: yerel hazırlık. Yayın yapılmadı. Testlerin geçmesi gerçek ortam kabulü anlamına gelmez.

## Hedef bağlantı

Önerilen adres: https://portal.ascendlojistik.com (henüz DNS/hosting üzerinde kurulmadı).
Ana site https://www.ascendlojistik.com olarak kalır. Site menüsünden portala bağlantı verilir; portal aynı marka ile ayrı çalışma alanında açılır. Mevcut portal iframe içine alınmayı engeller (X-Frame-Options DENY, frame-ancestors none). Bu koruma korunmuştur; iframe yerleştirmesi yapılmadı.

Mevcut “Dijital Portal — Yakında” CTA ve yayınlanmış site değiştirilmedi. Yayın onayında CTA hedefi portal adresine bağlanacak, metin değişikliği ayrıca onaylanan ürün metnine göre yapılacak.

## Kurulum sırası

1. Natro destek yanıtını alın: Node.js 24 sürekli süreç, HTTPS reverse proxy, kalıcı disk, SMTP çıkışı. Paket adı bunları kanıtlamaz. Destek yoksa portal uygulaması için ayrı sunucu gerekir.
2. Aşağıdaki değişkenleri sunucu gizli ayarlarında tanımlayın; .env, veritabanı ve .key Git'e veya public klasörüne girmez.
3. Portalı kısıtlı erişimde kurun. Basic önizleme katmanı bu sürümde korunur; müşterilere genel açılış öncesinde üretim erişim geçişi ayrıca yapılmalıdır.
4. Gerçek yönetici hesabını kullanıcı etkinleştirsin, TOTP'yi bağlasın; demo hesapları kapansın. Yerel demo veritabanını üretime kopyalamayın. Gerekli firma kayıtlarını ayrı onaylı aktarım planıyla taşıyın.
5. SSL ve yeniden başlatma sonrası kayıt kalıcılığını doğrulayın. Yedeği başka sunucuya alın ve geri yükleme testi yapın.
6. Önce kontrollü test talebi: site formu → fiyatsız talep → acente taslağı → yönetici onayı → gerçek SMTP teslimi. Sonra gelen fiyat → müşteri navlun maili.
7. Lojistik çıkış/varış maillerinde doğru tarihler, orijinal evrak işaretleri ve doğru PDF ekiyle test gönderimi yapın. NCTS PDF ve dosya kalemlerini kontrol edin.
8. İki farklı müşteri hesabıyla diğer firmanın API/dosya/PDF erişiminin engellendiğini doğrulayın. Personelde NCTS finans ve özel finans alanları kapalı kalmalı.
9. Kabul kaydı tamamlandıktan ve kullanıcı yayın onayı verdikten sonra site portal bağlantısını etkinleştirin. Önceki site sürümünü geri dönüş için saklayın.

## Ortam eşleştirmesi

Portal sunucusu:
- PORTAL_PUBLIC_ORIGIN=https://portal.ascendlojistik.com
- PORTAL_QUOTE_ORIGIN=https://www.ascendlojistik.com
- PORTAL_PUBLIC_QUOTES=true (yalnız test kabulünden sonra)
- PORTAL_DATA_FILE: kalıcı diskte özel veri yolu
- SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / SMTP_FROM: Natro'nun doğruladığı bilgiler
- PORTAL_MAIL_ENABLED=true: yalnız kontrollü teslim testi sırasında/sonrasında
- PORTAL_PREVIEW_ENABLED / USER / PASSWORD: kısıtlı kabul ortamı için mevcut erişim katmanı

Site derlemesi:
- VITE_PORTAL_QUOTE_URL=https://portal.ascendlojistik.com/api/quote-request

Bu VITE değeri yoksa form e-posta uygulamasına yönlenir. Canlı siteden talebin gerçekten kaydolduğu ayrıca kanıtlanmalıdır. Site kodunun değişkeni desteklemesi, canlı bağlantının etkin olduğunun kanıtı değildir.

## Kontrol komutları

Depo kökünde: bun run typecheck; bun run build; node --test portal/test/*.test.mjs
Portal klasöründe: node --env-file=.env preflight.mjs
Preflight salt okunurdur; sır değerlerini yazdırmaz ve eksiklerde sıfırdan farklı çıkış kodu döndürür.

## Geri dönüş

Site teklif bağlantısını önceki mailto sürümüne döndürün. Yeni gönderimleri durdurmak için PORTAL_MAIL_ENABLED=false ile sunucuyu yeniden başlatın. Gönderilmiş mailler geri alınamaz; kuyruktaki onaylı iletileri yeniden açmadan önce inceleyin. Veritabanını eski dosyayla ezmeyin; yedeği yeni bir yola geri yükleyip doğrulayın ve veri yolunu kontrollü değiştirin.

## Kullanıcıdan beklenen bilgiler

Natro teknik yanıtı; portal alt alan adı tercihi; SMTP sunucu/port/TLS ve limitler; DNS/SSL yönetim yöntemi; bağımsız yedek hedefi. Şifreleri sohbetten paylaşmayın. Gerçek teslim/rol/PDF kabulü tamamlanmadan “hatasız” veya “canlıya hazır” olarak işaretlenmez.
