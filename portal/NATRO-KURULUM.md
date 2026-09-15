# Natro hazırlığı ve gerekli bilgiler

Mevcut paket: Sınırsız Pro Hosting; 2 çekirdek, 2 GB RAM, MySQL ve 250 MB standart posta kutuları. Paket kaynakları Node.js uygulamasını çalıştırma yeteneğini tek başına doğrulamaz.

## Natro destek ekibine iletilecek soru

“Bu Sınırsız Pro paketinde Node.js 24 uygulamasını sürekli çalışan bir süreç olarak çalıştırabiliyor muyuz? SSH/komut satırı, otomatik yeniden başlatma, HTTPS reverse proxy, kalıcı yazılabilir disk ve zamanlanmış görev desteği var mı? Node 24 node:sqlite kullanılabiliyor mu? SMTP 465 veya 587 çıkışı ve e-posta başına ek/dakikalık gönderim limitleri nedir?”

Node süreci desteklenmiyorsa mevcut portal sunucusu bu pakete yalnız dosya yükleyerek kurulamaz. Önce Natro'nun yanıtı alınmalı; sunucu hizmeti veya ayrı uygulama sunucusu seçimi bundan sonra yapılmalı. Mevcut MySQL hizmetine geçiş ayrı bir veritabanı uyarlamasıdır; SQLite'ın MySQL'e bağlı olduğu iddia edilmez.

## Kullanıcıdan/panelden gerekenler

- Kullanılacak portal alt alan adı (örnek: portal.ascendlojistik.com) ve DNS/SSL yönetim yöntemi.
- Node.js desteği hakkında Natro'nun yanıtı, işletim sistemi ve uygulama çalıştırma yöntemi.
- info@ascendlojistik.com hesabının gerçek SMTP sunucu adı, portu, SSL/TLS türü, gönderim ve ek boyutu limitleri. Standart hosting e-postası mı XMail mi olduğu teyit edilmeli.
- SMTP şifresi yalnız sunucunun gizli ortam değişkenine girilmeli; sohbete veya GitHub'a yazılmamalı.
- SPF, DKIM ve DMARC kayıtlarının panelde durumu.
- Yedeklerin sunucudan bağımsız tutulacağı hedef ve saklama süresi. Mevcut otomatik yedek aynı yerel disktedir; felaket kurtarma için ayrı hedef gerekir.

Gerçek yönetici kullanıcı adı: ascend lojistik. E-posta: info@ascendlojistik.com. Şifre ve ikinci faktör kullanıcı tarafından Evrak ve Hesap Merkezi'nde etkinleştirilecektir. Etkinleştirmeden önce demo hesapları açık kalır.

## Yapılandırma

`portal/.env.example` sunucu ayarları için şablondur. `PORTAL_MAIL_ENABLED=false` iken hiçbir gerçek e-posta gönderilmez. SMTP ayarları girilip bu seçenek açılınca onaylı kuyruk işlenir. Belirsiz teslim sonucu otomatik tekrar gönderilmez; yönetici kontrolü bekler.

Web sitesine aktarım: `VITE_PORTAL_QUOTE_URL=https://portal-adresi/api/quote-request`; sunucuda `PORTAL_PUBLIC_QUOTES=true` ve `PORTAL_QUOTE_ORIGIN=https://www.ascendlojistik.com`. Bağlantı yapılandırılmazsa site mevcut mailto akışını sürdürür; portal aktarımı yapıldı mesajı göstermez. CORS/HTTPS, gerçek adrese geçince birlikte test edilmelidir.

Yedek geri dönüş: Sunucuyu durdurun. `node portal/restore-backup.mjs Yedek.sqlite YeniKayit.json` mevcut veritabanını ezmeden yeni bir kopya oluşturur ve doğrular. PORTAL_DATA_FILE değerini bu yeni .json yoluna değiştirin. İki aşamalı doğrulama kullanılan yedeklerde eşlik eden .key dosyasını da koruyun.

Kaynaklar: https://www.natro.com/hosting ; https://www.natro.com/sozlesmeler/tum-sozlesmeler?command=pdf&id=82 ; https://www.natro.com/hemendestek/bilgibankasi/epostalarima-nasil-ulasabilirim ; https://nodemailer.com/smtp
