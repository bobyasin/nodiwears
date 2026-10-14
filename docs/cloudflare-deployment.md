# Cloudflare Deployment

## Business Purpose
Siteyi Cloudflare üzerinde hızlı, güvenli ve düşük maliyetle yayınlamak.

## Problem Statement
Proje yalnızca yerelde çalışıyordu; yayın için yapılandırma, güvenlik başlıkları, önbellek kuralları ve 404 sayfası yoktu.

## Scope
- Cloudflare Workers Static Assets ile yayın (`wrangler.jsonc`); aynı `dist/` çıktısı Cloudflare Pages ile de yayınlanabilir.
- Güvenlik ve önbellek başlıkları (`public/_headers`), özel 404 sayfası, Node sürümü sabitleme, `deploy` ve `cf:dev` komutları.

## Out of Scope
- Alan adının Cloudflare'e eklenmesi, `www` yönlendirmesi, Cloudflare hesabı ve Git entegrasyonunun kurulumu (panelden yapılır; adımlar `domain-and-seo.md` içinde).
- Özel alan adı (`nodiwears.com`), sitemap ve `hreflang` ayrıntıları `domain-and-seo.md` dosyasındadır.
- Sunucu tarafı (Worker kodu, KV/D1); site tamamen statiktir.

## Business Requirements
- Site tek komutla veya Git push ile yayınlanabilmeli.
- Ziyaretçiler HTTPS üzerinden güvenli başlıklarla sunulmalı; bulunamayan adreslerde anlamlı bir sayfa görmeli.

## Functional Requirements
- `dist/` içeriği statik varlık olarak sunulur; `/en` → `/en/` gibi sonda eğik çizgi yönlendirmesi otomatiktir.
- Bilinmeyen adresler `404` durum koduyla `404.html` (TR/EN) gösterir.
- Her yanıtta güvenlik başlıkları vardır; `/_astro/*` dosyaları bir yıl önbelleklenir (`immutable`).

## Technical Overview
- `wrangler.jsonc`: ad `nodiwears`, `routes` ile `nodiwears.com` ve `www.nodiwears.com` özel alan adları, `assets.directory: ./dist`, `not_found_handling: 404-page`, `html_handling: auto-trailing-slash`, `compatibility_date`.
- `public/_headers`: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security` (6 ay, preload yok), CSP; `/_astro/*` için `Cache-Control`.
- CSP: `default-src 'self'`, `script-src 'self' 'unsafe-inline'` (Astro küçük modül script'lerini sayfaya gömer), `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`. Üçüncü taraf kaynak yok.
- `src/pages/404.astro`, `.node-version` (22), `package.json` komutları: `deploy` (`astro build && wrangler deploy`), `cf:dev` (yerelde Cloudflare çalışma zamanı), `wrangler` (devDependency).

## Architecture / Flow
`astro build` → `dist/` (+ `_headers`, `404.html`) → `wrangler deploy` varlıkları Cloudflare ağına yükler → istekler kenarda doğrudan statik varlıktan yanıtlanır.

## Data Changes / API Changes
Yok.

## Business Rules
- Yeni üçüncü taraf script/stil/font/görsel eklenirse CSP aynı değişiklikte güncellenir (aksi halde tarayıcı engeller).
- Gizli bilgiler (`.dev.vars`, `.env`) git'e girmez.

## Error Scenarios
- CSP bir kaynağı engellerse tarayıcı konsolunda ihlal görünür; ilgili kaynak `_headers` içinde izinlenmeli veya kaldırılmalı.
- `not_found_handling` yanlışsa bilinmeyen adresler 200 ile ana sayfaya düşer; testle korunur.

## Edge Cases
- `_headers` dosyası kendisi sunulmaz (404 döner).
- Doğrudan tarayıcı dışı isteklerde (curl) 404 gövdesi `404.html` ile gelir; durum kodu 404'tür.

## Security Considerations
Güvenlik başlıkları ve CSP varsayılan olarak eklenir; sitede kullanıcı girdisi sunucuya gitmez. `npm audit`: 0 açık. Wrangler yalnızca dev bağımlılığıdır. HSTS yalnızca HTTPS'te etkilidir; `preload` bilerek eklenmedi (alan adı hazır olunca değerlendirilir).

## Unit Test Coverage
`src/deploy.test.ts`: wrangler ayarları (dizin, 404, tarih, ad), gerekli başlıkların varlığı, CSP'de uzak kaynak olmaması, `/_astro/*` immutable önbellek, Node sürümü, `.wrangler/` ignore.

## E2E Test Coverage
Gerçek Cloudflare çalışma zamanı (`wrangler dev`) ile elle doğrulandı: başlıklar, `/_astro/*` önbelleği, `/en` → `/en/` (307), 404 sayfası, `_headers` dosyasının sunulmaması, CSP altında konsol hatası olmaması. Otomatik E2E altyapısı yoktur.

## QA Scenarios
1. `npm run cf:dev` → `http://localhost:8787/` ve `/en/` açılır.
2. Yanıt başlıklarında CSP, `X-Frame-Options`, `Strict-Transport-Security` görünür.
3. `/yok-boyle-sayfa` → 404 durum kodu ve "Sayfa bulunamadı / Page not found" sayfası.
4. `/_astro/...css` yanıtında `Cache-Control: public, max-age=31536000, immutable`.
5. Yayın sonrası aynı kontroller canlı adreste tekrarlanır; tarayıcı konsolunda CSP hatası yoktur.

## Acceptance Criteria
`npm run build` ve `npm test` başarılı; `wrangler deploy --dry-run` başarılı; QA senaryoları geçer.

## Deployment / Migration Considerations
**Git entegrasyonu (önerilen):** Cloudflare panelinde Workers & Pages → Create → Import a repository. Build komutu `npm run build`, deploy komutu `npx wrangler deploy`. Node sürümü `.node-version` dosyasından okunur.
**Komut satırı:** `npx wrangler login` sonra `npm run deploy`.
**Pages ile:** build komutu `npm run build`, çıktı dizini `dist`.
**Alan adı:** Panelden özel alan adı ekleyin; `www` → ana alan yönlendirmesini panelden tanımlayın. Alan adı belli olunca `astro.config.mjs` içine `site` ekleyip sitemap/`hreflang` eklenmeli.

## Known Limitations
- CSP `'unsafe-inline'` içerir (satır içi modül script'leri ve stiller nedeniyle); hash/nonce tabanlı sıkı CSP ayrı bir iyileştirmedir.
- Alan adı Cloudflare hesabında aktif olmadan özel alan adı bağlanamaz; `*.workers.dev` adresi de açık kalır (canonical `nodiwears.com`'u gösterir).

## Change History
| Tarih | Değişiklik |
| --- | --- |
| 2026-10-13 | İlk sürüm: Cloudflare yapılandırması, güvenlik/önbellek başlıkları, 404 sayfası, deploy komutları, testler. |
| 2026-10-13 | Özel alan adı rotası eklendi (`nodiwears.com`); ayrıntılar `domain-and-seo.md`. |
| 2026-10-14 | `www.nodiwears.com` rotası eklendi (canlıda 522 veriyordu). |
