# Ascend Portal — Railway hazırlığı

Finans erişim kuralı: Alış, Kazanç, Pay (1/3), Kur ve Pay TL yalnız Yönetici içindir; Operasyon, Finans ve Görüntüleme dahil personel rollerine kapalıdır. Kalan finans alanları şirket kapsamı içinde personel ve müşteriye açılabilir. Acente/Taşıyıcı yalnız personel içindir. `shipmentFinanceView` okuma/export alan listesini testlerle uygular, fakat henüz API'ye bağlı değildir. localStorage prototipi rol bazında güvenli veri saklamaz; gerçek erişim için oturum, sorgu ve API entegrasyonu zorunludur.

Geliştirme sırası ve kabul ölçütleri: [Portal hazırlığı](PREPARATION.md).
`access-policy.mjs`, gelecekteki sunucu oturumları için varsayılan ret yaklaşımıyla rol/şirket kontrolü ve sınırlı müşteri kayıt görünümü sağlar. `test/access-policy.test.mjs` NCTS finans, şirket ayrımı ve müşteri export alanlarını doğrular. Bu modül önizleme sunucusuna bağlı değildir; gerçek kimlik doğrulama, veritabanı sorgu kapsamı ve API entegrasyonu henüz yoktur. Müşteri görünümündeki kimlik, referans ve durum alanları başlangıç sözleşmesidir; ürün kararıyla genişletilebilir.

Bu servis aynı Git deposunda kurumsal siteden bağımsızdır. Mevcut TanStack sitesi kökte; portal `portal/` altında çalışır. Portalın bağımlılık gerektirmeyen Node.js sunucusu, Docker imajı, Railway yapılandırması ve GitHub CI kontrolleri hazırdır. Site için mevcut yayın hedefi değiştirilmemiştir.

## Bu sürümün sınırı

`prototype/` kullanıcının gönderdiği ilk çalışmanın değiştirilmemiş kopyasıdır. Kaynak ZIP SHA-256: `8BA619C672D4A975DA8D611088A01290DFC53FF08F1BAE628418426E4F40E2B5`.

Modüller: portal girişi, NCTS/T1 ve finans, lojistik operasyonları, kullanıcı yönetimi. Veriler localStorage/sessionStorage içindedir; farklı cihazlara aktarılmaz ve Railway'e kaydedilmez. Mevcut kullanıcı parolaları tarayıcıda düz metindir. HTML içindeki roller güvenlik sınırı değildir.

Bu nedenle servis yalnız iç ekip prototip incelemesi içindir. Gerçek müşteri/finans verisi ve başka sistemlerde kullanılan parolalar girilmez. Önizleme erişimi olan kişi tüm prototip kodunu alabilir; bu kişi müşteri rolüyle sınırlandırılmış sayılmaz. Sunucudaki ortak önizleme parolası, gelecekteki müşteri kimlik doğrulaması yerine geçmez. Müşteri erişimi ve üretim verisi aşağıdaki backend geçişinden sonra açılır.

## Yerelde çalıştırma

Node.js 24.19.0 kullanın. Ek paket kurulumu ve ayrı lockfile gerekmez.

```powershell
cd portal
Copy-Item .env.example .env
# .env içinde PORTAL_PREVIEW_ENABLED=true, kullanıcı ve rastgele en az 24 karakter parola ayarlayın.
bun run dev
```

Adres: `http://localhost:3001`. Tarayıcı önce sunucunun önizleme parolasını sorar; içerideki eski portal girişi yalnız prototip davranışıdır. `.env` Git tarafından dışlanır. Railway'de HTTPS adresi kullanılır. Kapatmak için `PORTAL_PREVIEW_ENABLED=false`; tüm prototip yolları 503 döner. `/healthz` çalışan süreci bildirir, müşteri portalının hazır olduğunu iddia etmez.

## GitHub → Railway bağlantısı (yayın zamanında)

1. Bu değişiklikleri gözden geçirip GitHub'a gönderin. Bu hazırlık sırasında push/deploy yapılmadı.
2. Railway'de bir staging ortamı ve `ascend-portal` servisi oluşturun; kaynak olarak `erdemergand/ascend-lojistik`, branch olarak `main` seçin.
3. Service Root Directory: `/portal`. Config File: `/portal/railway.json`. Dockerfile bu servis kökünde `Dockerfile`; Start Command override boş kalır, imajın CMD komutu kullanılır.
4. Variables: `PORTAL_PREVIEW_ENABLED=true`, `PORTAL_PREVIEW_USER` ve en az 24 karakter rastgele `PORTAL_PREVIEW_PASSWORD`. Değerleri Railway'de saklayın; GitHub'a veya Docker build argümanlarına koymayın. Railway'in verdiği `PORT` kullanılır; sunucu `0.0.0.0` üzerinde dinler.
5. GitHub autodeploy ve **Wait for CI** açın. GitHub Actions etkin olmalıdır. `CI` iş akışı push/PR üzerinde siteyi doğrular ve portalın erişim testleriyle Docker build'ini çalıştırır. Başarılı CI sonrası Railway kendi GitHub bağlantısıyla dağıtır; Railway token'ı GitHub'a eklemek gerekmez.
6. İsteğe bağlı Watch Paths: `/portal/**`. CI iş akışı değişince yeniden doğrulanmış dağıtım istiyorsanız `/.github/workflows/ci.yml` yolunu da ekleyin. İlk bağlantıda otomatik dağıtım tetiklenebileceği için gerçek yayın kararı verildiğinde bu adımları uygulayın.
7. Railway HTTPS alan adı oluşturun. `/healthz` 200, parolasız `/` ve doğrudan NCTS dosyası 401, doğru önizleme parolasıyla modüller 200 olmalıdır. Sahte örneklerle giriş, modüller, baskı ve export akışını staging üzerinde gözden geçirin.

Kurumsal sitenin domain/DNS/CTA ayarları korunur. Production portal için ayrı ortam ve daha sonra kararlaştırılacak domain kullanılır. Sorunlu sürümde Railway'den önceki başarılı deployment'a geri dönün; Git geçmişini force push ile değiştirmeyin. `PORTAL_PREVIEW_ENABLED=false` önizlemeyi kapatır ancak kullanıcıların daha önce tarayıcılarına kaydettiği veriyi silmez.

## Gerçek portal için sonraki geliştirme sınırları

Bu hazırlık veritabanı, müşteri API'si veya gerçek hesap sistemi kurmaz. Üretim geçişi şu sırayla yapılır:

1. Railway PostgreSQL: şirket/tenant, kullanıcı, üyelik, oturum, operasyon, NCTS, ayrı finans kayıtları ve audit log tabloları; sürümlü migration ve geri yüklemesi denenmiş yedekler. API servisinde `DATABASE_URL` Railway private bağlantısından alınır; istemciye veya `VITE_*` değişkenlerine konmaz.
2. Sunucuda kimlik doğrulama: güçlü parola hash'i, HttpOnly/Secure oturum, CSRF koruması, giriş denemesi sınırlaması, oturum iptali ve güvenli yönetici oluşturma. Tarayıcıdaki rol veya şirket kimliği yetki kaynağı kabul edilmez.
3. Her sorgu ve yazmada doğrulanmış oturumdan tenant kapsamı; başka şirketin kaydına erişim testleri. İstemcinin gönderdiği tenant/role alanına güvenilmez.
4. Müşteri sorguları/DTO'ları ve exportları Profit, Share, Share TL alanlarını hiç seçmez/döndürmez. NCTS finans sorgu, kayıt, toplamlama ve exportları yalnız admin yetkisiyle sunucuda çalışır; genel Finans rolü NCTS finans izni vermez. Finans tablolarını genel operasyon endpointlerine bağlayan otomatik serialization kullanılmaz.
5. Rol × tenant × endpoint/export testleri geçmeden müşteri erişimi açılmaz. localStorage içeriği güvenilmeyen import olarak doğrulanır; eski düz metin parolalar aktarılmaz, kullanıcılar yeni parola belirler.
6. Dosya ekleri için özel nesne depolaması ve yetki kontrolünden sonra kısa süreli indirme bağlantıları; container dosya sistemi kalıcı veri deposu olarak kullanılmaz.

Bu adımlar tamamlanınca prototip dosyaları müşteri imajından çıkarılır ve önizleme sunucusu gerçek uygulama ile değiştirilir. PostgreSQL henüz kullanılmadığından bu sürümde bağlantı değişkeni veya migration çalıştırma iddiası yoktur.

## Doğrulama

```powershell
# Depo kökünde
bun run typecheck
bun run build
# portal klasöründe
bun run check
bun run test
docker build -t ascend-portal .
docker run --rm -p 3001:3001 --env-file .env ascend-portal
```

Docker yalnız sunucu ve prototip dosyalarını alır; `.env`, site dosyaları ve testler imaja girmez. Uygulama root olmayan kullanıcıyla çalışır ve SIGTERM'de bağlantıları kapatır.

Resmî kaynaklar: [GitHub autodeploy / Wait for CI](https://docs.railway.com/deployments/github-autodeploys), [monorepo](https://docs.railway.com/deployments/monorepo), [config as code](https://docs.railway.com/config-as-code/reference), [healthcheck ve PORT](https://docs.railway.com/deployments/healthchecks).

## Sunucu oturumu ve firma ayrımı (15 Eylül 2026)

Yerel önizleme artık HttpOnly, SameSite=Strict oturum çereziyle giriş yapar. Kullanıcı rolü ve firma bağlantısı sunucuda tutulur; tarayıcı sorgu parametreleri yetki vermez. Görüntüleme hesaplarına yalnız bağlı firmanın gönderici/alıcı olduğu kayıtlar ve açıkça izinli alanlar gönderilir. Acente ve iç mali alanlar müşteri veri yanıtlarında bulunmaz. Belge sorgusu aynı firma filtresinden geçer; başka firmanın dosya numarası 404 döndürür. PDF önizlemesi yalnız bu süzülmüş kayıtlardan hazırlanır.

Kalıcı yerel kayıt için PORTAL_DATA_FILE=portal/.data/portal.json kullanılır. Dosya ve oturum bilgileri Git'e alınmaz. Oturumlar sunucu yeniden başlatılınca kapanır. İlk yönetici girişi eski yerel şirket ve dosya kayıtlarını sunucuya aktarır. Bu, yalnız Basic Auth arkasındaki yerel denetim ortamıdır; başlangıç demo hesapları gerçek üretim hesabı değildir. HTTPS, üretim kullanıcı kurulumu, yedekleme, gönderim servisi ve dağıtım bu değişiklik kapsamında yapılmaz.
