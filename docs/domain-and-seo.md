# Production Domain and Search Visibility (nodiwears.com)

## Business Purpose
Siteyi `www.nodiwears.com` adresinde yayınlamak ve arama motorlarının/sosyal ağların siteyi, iki dil sürümüyle birlikte doğru tanımasını sağlamak.

## Problem Statement
Site alan adı bilmediği için mutlak adres gerektiren özellikler (canonical, hreflang, sitemap, paylaşım görseli, özel alan adı) yoktu.

## Scope
- Ana adres (canonical): `https://www.nodiwears.com`. Site yalnızca bu adreste sunulur; `nodiwears.com` (apex) panelden tanımlanan bir yönlendirme kuralıyla `www`'ye 301 yönlenir. Kullanıcılar `www` ile aradığı için ana adres `www`'dir.
- `site` ayarı (`astro.config.mjs`) ve `siteConfig.url`; bunlar test ile senkron tutulur.
- Her sayfada canonical, dil karşılığı için `hreflang` (tr, en, x-default), Open Graph (`og:url`, `og:image` ve boyutları) ve Twitter kartı.
- `/sitemap.xml`: tüm sayfalar iki dilde, karşılıklı `hreflang` bağlantılarıyla. `/robots.txt`: tüm tarayıcılara izin + sitemap adresi.
- `wrangler.jsonc`: `www.nodiwears.com` (ana adres) ve `nodiwears.com` (yönlendirme için DNS kaydı ve sertifika sağlamak üzere) Cloudflare özel alan adı olarak bağlanır.
- 404 sayfası `noindex` alır, canonical içermez, sitemap'te yer almaz.
- Sayfa başına anahtar kelimeli başlık ve açıklama: ana sayfa "nodiwears | Özgün nakış tasarımları ve özel nakış işleme" (EN karşılığı), desen sayfaları "<Desen> nakış tasarımı | nodiwears" ve desene özel açıklama. Başlık ≤ 62, açıklama 70–165 karakter.
- Yapılandırılmış veri (JSON-LD): ana sayfalarda `Organization` (logo, e-posta) ve `WebSite` (dil); desen sayfalarında `BreadcrumbList` (Ana sayfa > Katalog > Desen). Telefon ve adres yer tutucu olduğu için yayınlanmaz.
- Desen sayfalarında "Bu koleksiyondan diğerleri" bağlantıları (iç bağlantı, en fazla 5 desen).
- Hero görseli `fetchpriority="high"` ile yüklenir (LCP).

## Out of Scope
- Alan adının Cloudflare'e taşınması ve DNS bölgesinin aktifleştirilmesi (panel işi). apex → `www` yönlendirme kuralı panelden tanımlanır (aşağıya bakın).
- E-posta altyapısı (`merhaba@nodiwears.com` kutusu/yönlendirmesi).
- Arama motoru hesapları (Search Console/Bing) ve yapılandırılmış veri (JSON-LD).

## Business Requirements
- Aynı içerik tek adreste görünmeli; arama motorları TR ve EN sürümleri birbirinin karşılığı olarak bilmeli.
- Bağlantı paylaşıldığında önizleme (başlık, açıklama, logo görseli) doğru çıkmalı.

## Functional Requirements
- `<link rel="canonical">` sayfanın kendi mutlak adresini verir (404 hariç).
- Dil karşılığı olan her sayfada `hreflang` ikilisi ve `x-default` (Türkçe) bulunur.
- Sitemap, ana sayfa + 18 desen + 3 politika sayfasını her iki dilde (44 adres) listeler.

## Technical Overview
`src/data/site.ts` (`siteConfig.url`), `src/layouts/Layout.astro` (meta/link etiketleri; `alternatePath`, `noindex` prop'ları), `src/lib/structured-data.ts` (JSON-LD üreticileri ve güvenli serileştirme), `src/lib/sitemap.ts` (saf XML üretici), `src/i18n/sitemap-pages.ts` (sayfa listesi), `src/pages/sitemap.xml.ts` (derleme anında `dist/sitemap.xml`), `public/robots.txt`, `wrangler.jsonc` (`routes`).

## Architecture / Flow
Derleme → sayfalar canonical/hreflang ile üretilir; `sitemap.xml` aynı yol yardımcılarından (`paths.ts`) üretilir, böylece dile göre değişen adresler doğru eşleşir.

## Data Changes / API Changes
Yok.

## Business Rules
- Canonical ana adres `www.nodiwears.com`'dur; yeni sayfa eklendiğinde `getSitemapPages` kapsamına girdiği testle doğrulanır.
- Alan adı değişirse `siteConfig.url`, `astro.config.mjs` `site`, `public/robots.txt` ve `wrangler.jsonc` birlikte güncellenir (test, uyumsuzluğu yakalar).

## Error Scenarios
- `site` ve `siteConfig.url` farklıysa test kırılır.
- Özel alan adı, bölge Cloudflare hesabında aktif değilse `wrangler deploy` özel alan adını bağlayamaz.

## Edge Cases
- XML'de özel karakterler (`&`, `<`, `"`) kaçışlanır.
- `*.workers.dev` adresi de açıktır; canonical her zaman `www.nodiwears.com`'u gösterir.
- Yönlendirme kuralı tanımlanana kadar apex de siteyi sunar; canonical `www`'yi gösterdiği için arama motorları için sorun olmaz.
- Ziyaretçi apex'e girip `www`'ye yönlendirilirse çerez bildirimi tarayıcı deposu `www` için ayrı olduğundan yeniden gösterilebilir.

## Security Considerations
Sitemap/robots yalnızca herkese açık sayfaları içerir. Paylaşım görseli yalnızca logodur. Yeni dış kaynak yok (CSP değişmedi).

## Unit Test Coverage
- `src/lib/sitemap.test.ts`: her dil için giriş, hreflang/x-default, mutlak adres, XML kaçışı, belge yapısı.
- `src/i18n/sitemap-pages.test.ts`: sayfa sayısı, TR↔EN eşleşmesi, 404 yok, tekrar yok.
- `src/deploy.test.ts`: özel alan adı rotası, `site` senkronu, robots içeriği.
- `src/i18n/seo.test.ts`: iki dilde başlık/açıklama uzunlukları, desen başlıklarının ve açıklamalarının benzersizliği, ana başlıkta ürün anahtar kelimesi.
- `src/lib/structured-data.test.ts`: şema alanları, breadcrumb sırası, `</script>` kaçışı.
- `src/data/site.test.ts`: ilgili desenler (aynı koleksiyon, limit, yerelleştirme).

## E2E Test Coverage
Yok. Derleme çıktısı elle denetlendi (canonical, hreflang, og etiketleri, `noindex`, sitemap içeriği). Yayın sonrası canlı doğrulama için QA senaryolarına bakın.

## QA Scenarios
1. `https://www.nodiwears.com/` açılır; kaynakta canonical `https://www.nodiwears.com/` ve `hreflang` etiketleri vardır.
2. `https://www.nodiwears.com/en/` canonical'ı kendi adresidir; `hreflang="tr"` Türkçe ana sayfayı gösterir.
3. `https://www.nodiwears.com/sitemap.xml` 44 adres içerir; `robots.txt` sitemap'i gösterir.
4. `https://nodiwears.com/...` → `https://www.nodiwears.com/...` (301, yol ve sorgu korunur). `www` 200 ile açılır (522/52x hatası yoktur).
5. Bir bağlantı sosyal ağda/mesajlaşmada paylaşılınca başlık, açıklama ve logo görseli görünür.
6. Var olmayan adres 404 verir ve sayfa kaynağında `noindex` vardır.
7. Search Console'a sitemap gönderilir; hreflang hatası raporlanmaz.
8. Google Rich Results Test'te ana sayfa Organization/WebSite, desen sayfası BreadcrumbList için hatasız geçer.
9. Bir desen sayfasında "Bu koleksiyondan diğerleri" bağlantıları aynı koleksiyonun diğer desenlerine gider.
10. PageSpeed Insights'ta ana sayfa mobil LCP iyi aralıktadır (hero görseli öncelikli yüklenir).

## Acceptance Criteria
Build ve testler başarılı; `wrangler deploy --dry-run` başarılı; QA senaryoları canlı adreste geçer.

## Deployment / Migration Considerations
1. Cloudflare'de "Add a domain" ile `nodiwears.com`'u ekleyin; kayıt şirketinde nameserver'ları Cloudflare'in verdiği ikiliyle değiştirin; bölge "Active" olana kadar bekleyin.
2. Önce panelde `www` için elle eklenmiş DNS kaydı varsa (ör. AAAA `100::`) silin; aksi halde Cloudflare özel alan adı bağlamayı reddeder (hata `100117`: "Hostname already has externally managed DNS records"). Ardından `npm run deploy` çalıştırın: `routes` ayarı `www.nodiwears.com` ve `nodiwears.com` için DNS kaydı ve sertifikayı kendiliğinden oluşturur.
3. apex adresini `www`'ye yönlendirin: Rules → Redirect Rules'ta ana makine adı `nodiwears.com` ise `concat("https://www.nodiwears.com", http.request.uri.path)` adresine 301 (sorgu dizesi korunarak). Kural Worker'dan önce çalışır.
4. SSL/TLS → Edge Certificates: "Always Use HTTPS" açık.
5. Google Search Console ve Bing Webmaster'da alan adını doğrulayıp `https://www.nodiwears.com/sitemap.xml` gönderin.
6. E-posta: iletişim formu `merhaba@nodiwears.com`'a yazdığı için bu adres bir kutuya ulaşmalı (ör. Cloudflare Email Routing ile kişisel kutuya yönlendirme).

## Known Limitations
- apex → `www` yönlendirmesi kod ile değil panelden tanımlanır (her istekte Worker çalıştırmamak ve host eşleşmesi yapabilmek için). Kural tanımlanana kadar apex de siteyi sunar.
- Sitemap'te `lastmod` yoktur; `Product`/`ImageObject` şemaları yoktur (desen görseli ve fiyat yok).
- Ana sayfa `h1` metni ("iğne iğne işlenir.") tasarım gereği kısadır; anahtar kelimeler başlık, açıklama ve yapılandırılmış veride taşınır.
- Paylaşım görseli logodur (1024×572); sayfa başına özel görsel yok.

## Change History
| Tarih | Değişiklik |
| --- | --- |
| 2026-10-13 | İlk sürüm: nodiwears.com için site ayarı, canonical/hreflang/OG, sitemap, robots, özel alan adı rotası. |
| 2026-10-13 | SEO: anahtar kelimeli başlık/açıklama, JSON-LD, ilgili desen bağlantıları, hero LCP önceliği. |
| 2026-10-14 | `www.nodiwears.com` özel alan adı olarak eklendi (canlıda 522 veriyordu: Worker'a bağlı değildi). |
| 2026-10-14 | Ana adres `www.nodiwears.com` yapıldı (canonical, sitemap, robots); apex panelden `www`'ye yönlendirilir. |
