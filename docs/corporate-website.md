# Corporate Website (nodiwears)

## Business Purpose
nodiwears'ın kendi nakış tasarımlarını (katalog) ve isteğe özel tasarım hizmetini tanıtan, sipariş/özel tasarım talebi toplayan minimalist tek sayfalık site. nodiwears müşteri logosu/markası basmaz.

## Problem Statement
Firmanın web üzerinde tasarımlarını gösteren ve talep toplayan bir varlığı yok.

## Scope
- Statik Türkçe/İngilizce site (Astro; dil desteği için `i18n.md`): ana sayfa (Header, Hero, Katalog, İletişim, Footer) ve her desen için ayrı sayfa (`/katalog/<desen-id>/`).
- Katalog: solda açılır koleksiyon menüsü (Mitoloji, Bitkiler, Hayvanlar; her birinde desen sayısı), sağda seçili desenin önizleme paneli: desenin görselleri sırayla (yaklaşık 2,6 sn'de bir, noktalarla elle de) gösterilir; üzerinde koleksiyon adı, desen adı ve "İncele" bağlantısı vardır. Menüde aynı anda tek koleksiyon açık kalır; ilk koleksiyon açık başlar. Veri iç içe derinliği destekler (alt koleksiyonların desenleri ilgili üst koleksiyonun altında listelenir). Telefonda panel menünün üstünde görünür; bir koleksiyon açılınca ilk desenini gösterir.
- Katalogdaki her desen kendi sayfasını açar: koleksiyon adı, desen adı, "Görsel yakında" alanı ve o desenle önceden doldurulmuş iletişim formu.
- İletişim formu: istemci tarafı doğrulama + `mailto:` ile e-posta uygulamasını açma.
- Minimalist, genç (Gen Z) görsel dil: büyük küçük harfli başlıklar, pastel renk blokları (lila, nane, pembe, sarı), kalın çerçeve ve sert gölge, siyah kullanılmaz (en koyu renk koyu mor). Duyarlı tasarım.
- Hero'da marka logosu daire çıkartma (sticker) olarak, renkli şekiller üzerinde; fare hareketiyle katmanlar hafifçe kayar (hareket azaltma tercihine saygı duyulur). Hero altında koleksiyon adlarının kayan şeridi (hover'da durur). Sekme ikonu marka ikonundan.

## Out of Scope
Backend, sunucuda form işleme, e-ticaret, çoklu dil, desen görselleri, uzun açıklama metinleri, analitik.

## Business Requirements
- Ziyaretçi ilk ekranda firmanın ne yaptığını anlamalı.
- Ziyaretçi kataloğu gezip bir desen seçerek tek tıkla talep oluşturabilmeli.

## Functional Requirements
- Menü bağlantıları (Katalog, İletişim) ana sayfadaki bölüme gider (desen sayfasından da); mobilde menü aç/kapa çalışır.
- Menüdeki bir koleksiyon başlığı açılıp kapanır (yerel `<details name="collection">`, klavye ve ekran okuyucuyla çalışır). Desen bağlantısının üzerine gelince veya odaklanınca ya da bir koleksiyon açılınca önizleme paneli o desenin görsellerini gösterir; fare panelin üzerindeyken geçiş durur, panele tıklamak desen sayfasını açar. "Hareketi azalt" tercihinde otomatik geçiş yoktur, noktalarla gezilir.
- Desen sayfasında mesaj alanı `Merhaba, <Koleksiyon> koleksiyonundan "<Desen>" tasarımıyla ilgileniyorum.` ile dolu gelir; kullanıcı düzenleyebilir.
- Form: ad, e-posta, mesaj zorunlu; hatalar tek mesajda gösterilir; geçerliyse mailto açılır.
- Tüm içerik `src/data/site.ts` ve `src/i18n/ui.ts` içinden yönetilir; yeni koleksiyon/alt koleksiyon/desen tek kayıt ekleyerek gelir.

## Technical Overview
Astro 7 statik çıktı. `Catalog.astro` (açılır koleksiyon menüsü + önizleme paneli), `src/pages/katalog/[id].astro` (her desen için statik sayfa), içerik `site.ts` (`catalogTree`), form ve mesaj mantığı `src/lib/contact.ts`, stil `src/styles/global.css`. Ek bağımlılık: `vitest` (dev).

## Architecture / Flow
`index.astro` → bileşenler → `site.ts`. Desen bağlantısı → `/katalog/<id>/` (`getStaticPaths` ile `collectDesigns` üzerinden üretilir) → `Contact` bileşeni `buildDesignInquiry` ile hazır mesajla açılır. Desen id'leri `slugify` ile ASCII/URL-güvenli üretilir. Form submit → `validateContact` → hata mesajı ya da `buildMailtoUrl`.

## Data Changes / API Changes
Yok. Dış servis çağrısı yapılmaz.

## Business Rules
Ad ≤ 100, mesaj ≤ 2000 karakter; e-posta `x@y.z` biçiminde olmalı.

## Error Scenarios
- Boş/geçersiz alan: Türkçe hata metni, e-posta uygulaması açılmaz.
- E-posta uygulaması yoksa tarayıcı bir şey açmaz; adres sayfada görünür.

## Edge Cases
- Ad alanındaki satır sonları mailto konusuna taşınmaz (header injection önlemi); özel karakterler kodlanır.
- JS kapalıysa form çalışmaz; tüm koleksiyonlar menüde listelenir, desen sayfaları çalışır (önizleme paneli görünmez; ilk koleksiyon açık, diğerleri tarayıcının yerel `<details>` davranışıyla açılır); e-posta ve telefon görünür.
- Türkçe karakterli desen adları (ör. "Anka kuşu") URL'de ASCII olur (`anka-kusu`).

## Security Considerations
Sunucuya veri gitmez. Hata metinleri `textContent` ile basılır; katalog metni `site.ts`'den gelir, kullanıcı girdisi değildir. Mailto içeriği `encodeURIComponent` ile kodlanır. `npm audit`: 0 açık.

## Unit Test Coverage
- `src/lib/contact.test.ts`: doğrulama, mailto kodlama, header injection, desen mesajı.
- `src/data/site.test.ts`: üst koleksiyon etiketi (`rootId`), ağaç düğümlerinin benzersiz id'si, başlıkları, her koleksiyonda en az bir desen, iç içe düzleştirme, yaprak (desen) listesi ve koleksiyon yolu, URL-güvenli id, desen sayfa yolu, navigasyon, e-posta.
- `src/lib/slug.test.ts`: Türkçe karakter çevirisi, ayraç birleştirme, kırpma.

## E2E Test Coverage
Yok: projede tarayıcı test altyapısı bulunmuyor. Eklenirse: katalog menüsünün açılıp kapanması ve önizleme paneli, desene tıklayınca desen sayfası ve hazır dolu form, form hata/başarı, mobil menü.

## QA Scenarios
1. Sayfa açılır; "iğne iğne işlenir." başlığı, logo çıkartması ve iki buton görünür; sekmede marka ikonu çıkar. Fareyi hero üzerinde gezdirince şekiller ve logo hafifçe kayar. Hero altında koleksiyon adları şerit halinde akar, fareyle üzerine gelince durur.
2. Katalogda "Mitoloji" açık gelir ve desenleri listelenir. "Bitkiler"e basınca o açılır, Mitoloji kapanır; sağdaki panel bitki desenini gösterir. Bir desenin üzerine gelince panel o deseni gösterir.
3. Bir desene (ör. Medusa) tıkla → `/katalog/mitoloji-medusa/` sayfası açılır; koleksiyon ve desen adı görünür, mesaj alanı hazır cümleyle dolu gelir. "← Katalog" ana sayfadaki kataloğa döner.
4. Boş formu gönder → 3 hata, mail açılmaz.
5. Geçerli formu gönder → e-posta uygulaması konu/gövde dolu açılır.
6. 760px altında menü düğmesi menüyü açıp kapatır.
7. Klavyeyle gezinirken odak halkası görünür; koleksiyon başlıkları Enter/Space ile açılır.

## Acceptance Criteria
`npm run build` ve `npm test` başarılı; QA senaryoları geçer; yatay kaydırma olmaz.

## Deployment / Migration Considerations
Statik `dist/` herhangi bir statik barındırmaya yüklenebilir. Yayın öncesi `site.ts` içindeki e-posta/telefon gerçek değerlerle değiştirilmeli.

## Known Limitations
- WhatsApp: `siteConfig.whatsappNumber` (`src/data/site.ts`) boş olduğu sürece her sayfada sağ altta pasif "WhatsApp · Yakında" düğmesi (telefonda yalnızca simge) ve iletişim bölümünde "Yakında" kartı görünür; hiçbir yere yönlendirmez. Numara girilince (`+90 532 123 45 67` gibi) aynı yerler gerçek bağlantıya dönüşür ve `wa.me` ile sohbeti açar. Desen sayfasında mesaj o desenle önceden doldurulur, diğer sayfalarda genel bir selamlama gelir. Numara geçersizse (boş, yer tutucu, çok kısa) düğme pasif kalır. WhatsApp kullanımı kişisel veriyi Meta'ya aktarır; yayına almadan önce gizlilik/KVKK metnine bir cümle eklenmesi önerilir.
- Desen görselleri şimdilik **örnek (dummy)** görsellerdir: her desen için `src/lib/dummy-image.ts` desen kimliğinden tohumlanan 3 çapraz dikiş SVG'si üretir (desen, yakın plan, tişört üzerinde) ve derleme sırasında `/dummy/<desen>/<1-3>.svg` adreslerine yazılır. Gerçek fotoğraflar `site.ts` içinde ilgili düğümün `images` listesine eklenince (`getDesignImages`) o desen için örnekler kullanılmaz; tüm desenlere gerçek görsel girince `src/pages/dummy/` ve `dummy-image.ts` silinebilir.
- İletişim bilgileri ve desen adları yer tutucudur.
- Desen sayfasında görsel yok ("Görsel yakında"); form `mailto` kullandığı için e-posta uygulaması gerekir.

## Change History
| Tarih | Değişiklik |
| --- | --- |
| 2026-10-13 | İlk sürüm: kurumsal tek sayfa, iletişim formu, testler. |
| 2026-10-13 | Marka logosu hero'ya, marka ikonu favicon olarak eklendi. |
| 2026-10-13 | İş modeli düzeltildi: müşteri logosu basımı değil, kendi katalog/özel tasarım. |
| 2026-10-13 | Minimalist sadeleştirme: Hizmetler/Süreç/Neden bölümleri kaldırıldı; katalog ağaç menü oldu. |
| 2026-10-13 | Ana sayfa yeniden tasarlandı: Gen Z / minimalist stil, logo sticker, kayan şerit, renkli katalog kartları, koyu öğeler (header monogramı, koyu footer) kaldırıldı. |
| 2026-10-13 | Türkçe/İngilizce dil desteği eklendi (bkz. `i18n.md`); sayfa gövdeleri `src/views/` altına taşındı. |
| 2026-10-13 | Katalog yapısı değişti: ağaç menü yerine koleksiyon filtreli renkli kart ızgarası. |
| 2026-10-13 | Sarı kayan şerit sonsuz döngü: her yarı ekrandan geniş olacak kadar tekrarlanır, boşluk oluşmaz; döndürülmüş şeridin kenar boşlukları kapatıldı. Politika/çerez özelliği ayrı spec'te (`legal-policies.md`). |
| 2026-10-13 | Her desen kendi sayfasını açar (`/katalog/<id>/`); form o desenle önceden dolu gelir; menü bağlantıları `/#...` oldu. |
| 2026-10-15 | Katalog solda açılır koleksiyon menüsüne ve sağda önizleme paneline dönüştü; renkli kart ızgarası ve filtre butonları (`catalog-filter`) kaldırıldı. |
| 2026-10-15 | Katalog önizleme paneli desen görsellerini sırayla gösteren slayt gösterisine dönüştü; örnek (dummy) görseller eklendi. |
| 2026-10-15 | WhatsApp desteği: yüzen düğme, iletişim bağlantısı ve desen sayfasında önceden doldurulmuş mesaj; numara girilene kadar pasif "Yakında" durumu. |
