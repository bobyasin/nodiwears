# Corporate Website (nodiwears)

## Business Purpose
nodiwears'ın kendi nakış tasarımlarını (katalog) ve isteğe özel tasarım hizmetini tanıtan, sipariş/özel tasarım talebi toplayan minimalist tek sayfalık site. nodiwears müşteri logosu/markası basmaz.

## Problem Statement
Firmanın web üzerinde tasarımlarını gösteren ve talep toplayan bir varlığı yok.

## Scope
- Statik Türkçe/İngilizce site (Astro; dil desteği için `i18n.md`): ana sayfa (Header, Hero, Katalog, İletişim, Footer) ve her desen için ayrı sayfa (`/katalog/<desen-id>/`).
- Katalog: tüm desenler tek kart ızgarasında; üstte koleksiyon filtre butonları (Tümü, Mitoloji, Bitkiler, Hayvanlar). Her kart koleksiyon rengindedir, koleksiyon adı ve desen adını gösterir. Veri iç içe derinliği destekler (alt koleksiyonlar da ilgili üst koleksiyonun filtresi altında görünür).
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
- Filtre butonu seçili koleksiyonun desenlerini gösterir, "Tümü" hepsini gösterir; aktif filtre vurgulanır (`aria-pressed`).
- Desen sayfasında mesaj alanı `Merhaba, <Koleksiyon> koleksiyonundan "<Desen>" tasarımıyla ilgileniyorum.` ile dolu gelir; kullanıcı düzenleyebilir.
- Form: ad, e-posta, mesaj zorunlu; hatalar tek mesajda gösterilir; geçerliyse mailto açılır.
- Tüm içerik `src/data/site.ts` ve `src/i18n/ui.ts` içinden yönetilir; yeni koleksiyon/alt koleksiyon/desen tek kayıt ekleyerek gelir.

## Technical Overview
Astro 7 statik çıktı. `Catalog.astro` (filtre + kart ızgarası; filtre mantığı `src/lib/catalog-filter.ts`), `src/pages/katalog/[id].astro` (her desen için statik sayfa), içerik `site.ts` (`catalogTree`), form ve mesaj mantığı `src/lib/contact.ts`, stil `src/styles/global.css`. Ek bağımlılık: `vitest` (dev).

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
- JS kapalıysa form çalışmaz; tüm desenler görünür ve desen sayfaları çalışır (filtre çalışmaz); e-posta ve telefon görünür.
- Türkçe karakterli desen adları (ör. "Anka kuşu") URL'de ASCII olur (`anka-kusu`).

## Security Considerations
Sunucuya veri gitmez. Hata metinleri `textContent` ile basılır; katalog metni `site.ts`'den gelir, kullanıcı girdisi değildir. Mailto içeriği `encodeURIComponent` ile kodlanır. `npm audit`: 0 açık.

## Unit Test Coverage
- `src/lib/contact.test.ts`: doğrulama, mailto kodlama, header injection, desen mesajı.
- `src/lib/catalog-filter.test.ts`: filtre eşleşme kuralları.
- `src/data/site.test.ts`: üst koleksiyon etiketi (`rootId`), ağaç düğümlerinin benzersiz id'si, başlıkları, her koleksiyonda en az bir desen, iç içe düzleştirme, yaprak (desen) listesi ve koleksiyon yolu, URL-güvenli id, desen sayfa yolu, navigasyon, e-posta.
- `src/lib/slug.test.ts`: Türkçe karakter çevirisi, ayraç birleştirme, kırpma.

## E2E Test Coverage
Yok: projede tarayıcı test altyapısı bulunmuyor. Eklenirse: katalog filtresi, desen kartına tıklayınca desen sayfası ve hazır dolu form, form hata/başarı, mobil menü.

## QA Scenarios
1. Sayfa açılır; "iğne iğne işlenir." başlığı, logo çıkartması ve iki buton görünür; sekmede marka ikonu çıkar. Fareyi hero üzerinde gezdirince şekiller ve logo hafifçe kayar. Hero altında koleksiyon adları şerit halinde akar, fareyle üzerine gelince durur.
2. Katalogda tüm desenler görünür. "Bitkiler" filtresine basınca yalnızca bitki desenleri kalır; "Tümü" hepsini geri getirir.
3. Bir desene (ör. Medusa) tıkla → `/katalog/mitoloji-medusa/` sayfası açılır; koleksiyon ve desen adı görünür, mesaj alanı hazır cümleyle dolu gelir. "← Katalog" ana sayfadaki kataloğa döner.
4. Boş formu gönder → 3 hata, mail açılmaz.
5. Geçerli formu gönder → e-posta uygulaması konu/gövde dolu açılır.
6. 760px altında menü düğmesi menüyü açıp kapatır.
7. Klavyeyle gezinirken odak halkası görünür; filtre butonları Enter/Space ile çalışır.

## Acceptance Criteria
`npm run build` ve `npm test` başarılı; QA senaryoları geçer; yatay kaydırma olmaz.

## Deployment / Migration Considerations
Statik `dist/` herhangi bir statik barındırmaya yüklenebilir. Yayın öncesi `site.ts` içindeki e-posta/telefon gerçek değerlerle değiştirilmeli.

## Known Limitations
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
