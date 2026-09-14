# Portal geliştirme hazırlığı

11 Eylül 2026 — mevcut kaynak incelemesine dayalı çalışma planı. Bu belge uygulanmış backend veya üretime hazır portal anlamına gelmez.

## Mevcut durum

- `prototype/index.html`: tarayıcıda ilk yönetici oluşturma ve giriş.
- `prototype/01_NCTS_BRANDED_v15.html`: NCTS kayıtları ve yöneticiye gösterilen finans alanı.
- `prototype/02_LOJISTIK_PORTAL_BRANDED_v14.html`: operasyonlar, firma rehberi, finans ve raporlama.
- `prototype/03_KULLANICI_YONETIMI.html`: Yönetici, Operasyon, Finans ve Görüntüleme rolleri.
- Kayıtlar localStorage, oturum sessionStorage içinde. Parolalar düz metin. Sunucu yalnız ortak parola ile iç ekip önizlemesi sunuyor; API, kalıcı veritabanı ve şirketler arası veri ayrımı yok.

## Değişmez erişim kuralları

| Kapsam | Kural | Doğrulama |
| --- | --- | --- |
| Müşteri verisi | Yalnız doğrulanmış üyeliğin şirketine ait ve müşteriye açılmış kayıtlar | Başka şirketin kimliğiyle liste, detay, düzenleme, dosya ve export denemeleri reddedilir |
| Profit / Share / Share TL | Müşteri sorgularına ve yanıtlarına dahil edilmez | API, export, toplamlar ve hata yanıtlarında alan veya türetilmiş tutar bulunmaz |
| NCTS finans | Yalnız Yönetici; Finans rolü dahil diğer roller erişemez | Okuma, yazma, toplam ve export istekleri sunucuda reddedilir |
| Kullanıcı yönetimi | Yönetici işlemleri sunucuda denetlenir | İstemciden rol/şirket değiştirmek yetki kazandırmaz; pasif hesabın oturumları iptal edilir |
| Tanımsız yetki | Varsayılan olarak reddedilir | Eksik üyelik, bilinmeyen rol ve iptal edilmiş oturum veri döndürmez |

Görüntüleme rolü otomatik olarak müşteri rolüne dönüştürülmez. Personel yetkileri ile müşteri şirket üyelikleri ayrı modellenir. Personelin erişebileceği şirketler açıkça atanır; Yönetici olmak kendiliğinden tüm şirketlerin verisine erişim sağlamaz. Bunlar yeni uygulama için önerilen varsayılanlardır; mevcut prototipte uygulanmış değildir.

## Uygulama sırası ve kabul ölçütleri

1. **İş akışını kesinleştir:** NCTS ve lojistik kayıt alanları, zorunlu alanlar, durum geçişleri, şirket ilişkileri ve finans hesapları için veri sözlüğü çıkar. Müşteriye açılacak alanları tek tek işaretle. Kabul: örnek bir operasyonun açılıştan kapanışa kadar akışı ve rol matrisi yazılıdır.
2. **Kalıcı veri ve oturum:** sürümlü PostgreSQL migrationları; şirket, kullanıcı, üyelik, oturum, operasyon, NCTS, ayrı finans ve audit kayıtları. Parola hash'i, güvenli cookie, giriş sınırlaması, CSRF ve oturum iptali. Kabul: yeniden başlatmada veri korunur; yedek geri yükleme denenir; geçersiz oturum veri alamaz.
3. **Yetkili API:** şirket kapsamını her sorgu/yazma için doğrulanmış oturumdan üret; müşteri yanıtlarını izin verilen alanlarla oluştur. Aynı kuralları export ve dosyalara uygula. Kabul: iki şirket ve tüm rollerle erişim testleri geçer; NCTS finans yalnız Yönetici tarafından alınabilir.
4. **Ekranları bağla:** önce personel giriş ve kullanıcı yönetimi, ardından firma rehberi, lojistik operasyonları, NCTS, finans ve export. Kabul: yükleniyor, boş, hata, yetkisiz ve kaydedilmemiş değişiklik durumları çalışır; mobil ve açık/koyu tema kontrol edilir. Kayıt başarısı yalnız sunucu onayıyla gösterilir.
5. **Müşteri pilotu:** yalnız belirlenmiş müşteri alanları ve şirket kapsamıyla ayrı müşteri deneyimi. Kabul: gerçek veri öncesinde sentetik kayıtlarla uçtan uca test; prototip HTML dosyaları müşteri dağıtımından çıkarılmıştır.

## Karar bekleyen ürün ayrıntıları

- İlk sürüm yalnız iç ekip için mi, müşteri erişimi de olacak mı?
- Operasyon, Finans ve Görüntüleme rollerinin düzenleme/silme/export kapsamı.
- Müşterinin görebileceği operasyon, belge ve ücret alanları.
- NCTS numarası benzersizliği, zorunlu bilgiler ve izin verilen durum geçişleri.
- Kur tarihi/kaynağı, yuvarlama ve Profit/Share hesap kuralları.

Bu kararlar verilene kadar tanımsız erişim açılmaz ve mevcut hesaplama davranışı yeni iş kuralı olarak kabul edilmez.

## Veri geçişi ve sürüm sınırı

Tarayıcı verisi otomatik içeri alınmaz. Geçiş yapılacaksa şema doğrulama, şirket eşleştirme, önizleme ve tekrar içe aktarma kontrolü gerekir. Eski parolalar taşınmaz; yeni hesaplar güvenli parola belirleme akışını kullanır. Gerçek müşteri ve finans kayıtları demo verisi yapılmaz.

Kurumsal sitedeki `Dijital Portal — Yakında` metni korunur. Bu plan domain/DNS değişikliği, push veya deploy başlatmaz. Yerel doğrulama: kökte `bun run typecheck` ve `bun run build`; portalda `bun run check` ve `bun run test`.
