# Legal Policies and Cookie Notice

## Business Purpose
Siteyi ziyaret eden ve iletişim formunu kullanan kişilere, kişisel verilerinin nasıl ele alındığını (KVKK, gizlilik, çerez) açıkça göstermek ve çerez kullanımı hakkında bilgilendirmek.

## Problem Statement
Site kişisel veri (ad, e-posta, mesaj) alan bir form içeriyor ve tarayıcıda küçük bir kayıt tutacak; ancak ziyaretçiye yönelik aydınlatma metni, gizlilik/çerez politikası ve bildirim yok.

## Scope
- Üç politika sayfası: KVKK Aydınlatma Metni, Gizlilik Politikası, Çerez Politikası (Türkçe `/politikalar/<slug>/`, İngilizce `/en/policies/<slug>/`; ayrıntı için `i18n.md`).
- Her sayfada çerez bildirimi (alt köşede kart) ve kapatma.
- Footer'da üç politikaya bağlantı; iletişim formunda KVKK metnine bağlantılı kısa not.

## Out of Scope
- Analitik/pazarlama çerezleri ve çerez tercih paneli (kullanılmıyor; eklenirse izin mekanizması ve politika güncellemesi gerekir).
- Hukuki inceleme ve VERBİS kaydı, mesafeli satış/iade metinleri (sitede satış yok).

## Business Requirements
- Ziyaretçi, politikalara her sayfadan (footer) ulaşabilmeli.
- Çerez/yerel depolama kullanımı hakkında ilk ziyarette bilgilendirilmeli.
- Metinler sitenin gerçek davranışıyla çelişmemeli.

## Functional Requirements
- İlk ziyarette bildirim görünür; "Tamam" ile kapanır ve tarayıcıda hatırlanır, sonraki ziyaretlerde görünmez.
- Depolama engelliyse bildirim her ziyarette görünür; hata oluşmaz.
- Politika içeriği dil başına tek kaynaktan (`src/data/policies/tr.ts`, `en.ts`) üretilir; yeni politika her iki dosyaya birer kayıt eklemektir.
- Çerez politikasındaki tablo, gerçekte yazılan kayıt anahtarını (`nodiwears-cookie-consent`) listeler.

## Technical Overview
`src/data/policies/{tr,en,index,types}.ts` (içerik), `src/views/PolicyPage.astro` + `src/pages/**/[slug].astro` (statik sayfa), `src/components/CookieBanner.astro` (Layout içinde her sayfada), `src/lib/cookie-consent.ts` (okuma/yazma mantığı), Footer ve Contact bağlantıları.

## Architecture / Flow
Sayfa yüklenir → script `localStorage`'ı dener → kayıt yoksa bildirim `hidden` kalkar → "Tamam" → kayıt yazılır, bildirim gizlenir.

## Data Changes
Tarayıcıda tek kayıt: `nodiwears-cookie-consent = acknowledged` (zorunlu, birinci taraf, yerel depolama). Sunucuya veri gitmez.

## API / Integration Changes
Yok.

## Business Rules
- Analitik/reklam/takip aracı yüklenmez; yüklenirse önce açık izin akışı ve politika güncellemesi yapılır.
- Politika metinlerindeki "son güncelleme" tarihi içerik değiştiğinde güncellenir.

## Error Scenarios
Depolama erişimi hata verirse (gizli mod vb.) hata fırlatılmaz; bildirim her ziyarette gösterilir.

## Edge Cases
- Kayıt beklenmeyen bir değerse bildirim yeniden gösterilir.
- JS kapalıysa bildirim gizli kalır; politikalar yine footer'dan erişilebilir.

## Security Considerations
Politika metni kod içindeki sabit veridir, kullanıcı girdisi değildir. Yeni üçüncü taraf script yok. Yerel depolamaya kişisel veri yazılmaz.

## Unit Test Coverage
- `src/lib/cookie-consent.test.ts`: ilk ziyaret, hatırlama, beklenmeyen değer, engelli depolama.
- `src/data/policies/policies.test.ts`: her iki dilde üç belge, benzersiz/URL-güvenli slug, dolu başlık/içerik, tablo satır genişliği, 9 KVKK m.11 hakkı, çerez anahtarı tutarlılığı, diller arası yapı eşliği.

## E2E Test Coverage
Yok (tarayıcı test altyapısı yok). Eklenirse: bildirim görünür/kapanır/hatırlanır, footer bağlantıları, politika sayfaları.

## QA Scenarios
1. Yeni tarayıcıda siteyi aç → alt köşede çerez bildirimi görünür.
2. "Tamam"a bas → kapanır; sayfayı yenile → görünmez.
3. Bildirimdeki "Çerez politikası" bağlantısı politika sayfasını açar.
4. Footer'dan üç politikaya git; her sayfada başlık, güncelleme tarihi ve içerik görünür.
5. Çerez politikasındaki tabloda `nodiwears-cookie-consent` kaydı yer alır.
6. İletişim formunun altında KVKK metnine bağlantı vardır.
7. Telefon genişliğinde bildirim ve tablo taşmaz.

## Acceptance Criteria
Build ve testler başarılı; QA senaryoları geçer; metinler sitenin gerçek davranışını doğru anlatır.

## Deployment / Migration Considerations
Yayın öncesi: `siteConfig` içindeki ticari unvan/adres/telefon/e-posta gerçek değerlerle doldurulmalı ve metinler bir hukukçu tarafından gözden geçirilmeli.

## Known Limitations
- Metinler genel şablondur; hukuki danışmanlık yerine geçmez.
- Veri sorumlusu bilgileri yer tutucudur.
- Hosting/e-posta sağlayıcıları ve saklama süreleri genel ifadeyle yazıldı.

## Change History
| Tarih | Değişiklik |
| --- | --- |
| 2026-10-13 | İlk sürüm: üç politika sayfası, çerez bildirimi, footer ve form bağlantıları. |
| 2026-10-13 | Politikalar, bildirim ve ilgili arayüz Türkçe/İngilizce yapıldı (bkz. `i18n.md`). |
