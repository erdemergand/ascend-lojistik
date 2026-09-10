# Harita, İletişim Kartı ve Küçülen Header Revizyonu

## Yapılacaklar
- Mevcut blok biçimli dünya çizimini, kıta sınırları okunabilen gerçekçi bir dünya haritası siluetiyle değiştirmek; mevcut bölge noktaları ve hareketli rota bağlantılarını korumak.
- İletişim sayfasındaki sağ kartın sticky konumunu header yüksekliğine göre ayarlamak; scroll sırasında üst kısmının header altında kalmasını önlemek.
- Masaüstünde scroll sonrası header'ı tek satıra dönüştürmek: küçülen logo Ana Sayfa bağlantısının önüne gelecek, navigasyon aynı satırda kalacak, portal/teklif/tema kontrolleri dil seçicinin yanında toplanacak.
- Scroll yapılmamış büyük header görünümünü ve mobil menü davranışını korumak.
- Light/dark, masaüstü/mobil ve altı route üzerinde taşma, kırık görsel ve çalışma hatası kontrolü yapmak.

## Teknik Detaylar
- Harita için projeye yerel bir SVG dünya silueti eklenecek; dış kaynağa çalışma zamanında bağlantı kurulmayacak.
- Header geçişi mevcut scroll state ile yönetilecek; masaüstü düzenleri arasında CSS görünürlük/geçiş sınıfları kullanılacak.
- İletişim kartının sticky offset'i, açık ve kompakt header yükseklikleriyle çakışmayacak güvenli bir değere çıkarılacak.
