# Çıkış ve varış bildirimleri

Acente/Taşıyıcı adı, kimliği ve firma/iletişim bilgileri yalnız personel içindir. Müşteri ekranı, API yanıtı, arama, export, e-posta ve PDF bu bilgileri içeremez. `customerShipmentView` izinli alan listesi ve bildirim şablonu bu alanları dışarıda bırakır; testler bu sınırı doğrular. Mevcut HTML önizlemesi yalnız iç personel içindir: gerçek müşteri oturumu/API kurulmadan müşteriye erişim açılmaz. Bu bir müşteri yetkilendirmesinin tamamlandığı iddiası değildir.

Durum: içerik şablonları ve prototipte taslak/PDF yazdırma akışı hazır. E-posta sağlayıcısı henüz belirlenmedi; otomatik gönderim etkin değildir. Örnek PDF'ler `output/pdf/` altındadır. Gerçek PDF eki oluşturma/ekleme bir sunucu işçisi gerektirir; tarayıcı yazdırması otomatik ek değildir.

Tek içerik kaynağı: `prototype/notification-templates.js`. Tam unvanlar ve açıkça seçilmiş operasyon alanları kullanılır; alış, satış, kâr ve pay alanları seçilmez. Örnekleri yenilemek için `node portal/notifications/generate_samples.mjs`, ardından ReportLab bulunan Python ile `portal/notifications/render_samples.py` çalıştırılır.

Mevcut alıcı davranışı korunur: sevkiyatın alıcı firmasındaki ilgili çıkış/varış bildirim tercihi işaretli yetkililer; ilk kişi To, diğerleri CC. Tercih yoksa kimseye otomatik gönderim yapılmaz. Gönderici/taşıyıcıya ek dağıtım bu sürümde varsayılmaz.

Sağlayıcı seçilince tamamlanacak sunucu akışı:

1. Yetkili kullanıcı ve şirket kapsamını sunucuda doğrula; çıkış için en az bir taşıma kimliği, varış için çıkış kaydı şartını uygula.
2. Olay kaydı ve kalıcı outbox işini aynı veritabanı işlemiyle oluştur. Şirket + sevkiyat + olay türü + sürüm için benzersizlik kuralıyla çift tıklamayı tek işe indir.
3. Doğrulanmış kayıt anlık görüntüsünden PDF üret; gerçek PDF baytlarını `application/pdf` eki olarak ekle. Başarısız PDF üretiminde eksiz gönderme.
4. Gönderici hesabı, sağlayıcı kimliği ve sırlarını yalnız sunucuda tut. Onaylı alıcı tercihlerini uygula; adres yoksa `alıcı bekleniyor` durumunda kal.
5. Sağlayıcı kabulü, teslim, kalıcı hata ve belirsiz zaman aşımını ayrı durumlarla kaydet. Belirsiz sonucu doğrudan yeniden göndermeden sağlayıcı kimliğiyle uzlaştır. Kontrollü tekrar deneme ve yönetici yeniden gönderim akışı ekle.
6. E-posta/PDF finans sızıntısı, rol/şirket sınırları, mükerrer gönderim, eksik ek, sağlayıcı hatası ve teslim olayları için entegrasyon testlerini tamamla.

Tarayıcıdaki taslak geçmişi bu outbox'ın yerine geçmez. Bu sürüm hiç e-posta göndermemiştir.
