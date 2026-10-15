# Cloudflare Deployment

## Business Purpose
Siteyi Cloudflare üzerinde hızlı, güvenli ve düşük maliyetle yayınlamak.

## Problem Statement
Proje yalnızca yerelde çalışıyordu; yayın için yapılandırma, güvenlik başlıkları, önbellek kuralları ve 404 sayfası yoktu.

## Scope
- Cloudflare Workers Static Assets ile yayın (`wrangler.jsonc`); aynı `dist/` çıktısı Cloudflare Pages ile de yayınlanabilir.
- Güvenlik ve önbellek başlıkları (`public/_headers`), özel 404 sayfası, Node sürümü sabitleme, `deploy` ve `cf:dev` komutları.
- Otomatik yayın: `main` dalına push gelince GitHub Actions testleri çalıştırır ve siteyi yayınlar (`.github/workflows/deploy.yml`).

## Out of Scope
- Alan adının Cloudflare'e eklenmesi, `www` yönlendirmesi, Cloudflare hesabı ve Git entegrasyonunun kurulumu (panelden yapılır; adımlar `domain-and-seo.md` içinde).
- Özel alan adı (`www.nodiwears.com`), sitemap ve `hreflang` ayrıntıları `domain-and-seo.md` dosyasındadır.
- Sunucu tarafı (Worker kodu, KV/D1); site tamamen statiktir.

## Business Requirements
- Site tek komutla veya `main`'e push ile yayınlanabilmeli; testler geçmeden yayın yapılmamalı.
- Ziyaretçiler HTTPS üzerinden güvenli başlıklarla sunulmalı; bulunamayan adreslerde anlamlı bir sayfa görmeli.

## Functional Requirements
- `dist/` içeriği statik varlık olarak sunulur; `/en` → `/en/` gibi sonda eğik çizgi yönlendirmesi otomatiktir.
- Bilinmeyen adresler `404` durum koduyla `404.html` (TR/EN) gösterir.
- Her yanıtta güvenlik başlıkları vardır; `/_astro/*` dosyaları bir yıl önbelleklenir (`immutable`).

## Technical Overview
- `wrangler.jsonc`: ad `nodiwears`, `routes` ile `www.nodiwears.com` (ana adres) ve `nodiwears.com` (yönlendirme için) özel alan adları, `assets.directory: ./dist`, `not_found_handling: 404-page`, `html_handling: auto-trailing-slash`, `compatibility_date`.
- `public/_headers`: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security` (6 ay, preload yok), CSP; `/_astro/*` için `Cache-Control`.
- CSP: `default-src 'self'`, `script-src 'self' 'unsafe-inline'` (Astro küçük modül script'lerini sayfaya gömer), `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`. Üçüncü taraf kaynak yok.
- `.github/workflows/deploy.yml`: `main`'e push ve elle başlatma (`workflow_dispatch`) ile çalışır; sırasıyla `npm ci`, `npm test`, `npm run deploy`. Aynı anda tek yayın (`concurrency`), `contents: read` izni, Node sürümü `.node-version`'dan. Cloudflare bilgileri repo secret'larından okunur (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- `src/pages/404.astro`, `.node-version` (22), `package.json` komutları: `deploy` (`astro build && wrangler deploy`), `cf:dev` (yerelde Cloudflare çalışma zamanı), `wrangler` (devDependency).

## Architecture / Flow
`astro build` → `dist/` (+ `_headers`, `404.html`) → `wrangler deploy` varlıkları Cloudflare ağına yükler → istekler kenarda doğrudan statik varlıktan yanıtlanır.

## Data Changes / API Changes
Yok.

## Business Rules
- Yeni üçüncü taraf script/stil/font/görsel eklenirse CSP aynı değişiklikte güncellenir (aksi halde tarayıcı engeller).
- Gizli bilgiler (`.dev.vars`, `.env`) git'e girmez; Cloudflare token'ı yalnızca GitHub secret'ında tutulur, koda veya loglara yazılmaz.
- Canlı site, `main` dalındaki koddur. Başka bir dalın içeriği `main`'e merge edilmeden yayınlanmaz.
- Cloudflare Git entegrasyonu ile GitHub Actions aynı anda açık olmaz (aksi halde her push iki kez yayınlanır).

## Error Scenarios
- CSP bir kaynağı engellerse tarayıcı konsolunda ihlal görünür; ilgili kaynak `_headers` içinde izinlenmeli veya kaldırılmalı.
- `not_found_handling` yanlışsa bilinmeyen adresler 200 ile ana sayfaya düşer; testle korunur.
- Testler kırılırsa workflow yayın adımına geçmez; canlı site önceki hâliyle kalır.
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` eksik veya yetkisizse deploy adımı kimlik doğrulama hatasıyla başarısız olur; secret'lar düzeltilip iş yeniden çalıştırılır.

## Edge Cases
- `_headers` dosyası kendisi sunulmaz (404 döner).
- Doğrudan tarayıcı dışı isteklerde (curl) 404 gövdesi `404.html` ile gelir; durum kodu 404'tür.

## Security Considerations
Güvenlik başlıkları ve CSP varsayılan olarak eklenir; sitede kullanıcı girdisi sunucuya gitmez. `npm audit`: 0 açık. Wrangler yalnızca dev bağımlılığıdır. HSTS yalnızca HTTPS'te etkilidir; `preload` bilerek eklenmedi (alan adı hazır olunca değerlendirilir).

## Unit Test Coverage
`src/deploy.test.ts`: wrangler ayarları (dizin, 404, tarih, ad), gerekli başlıkların varlığı, CSP'de uzak kaynak olmaması, `/_astro/*` immutable önbellek, Node sürümü, `.wrangler/` ignore; yayın workflow'u (yalnızca `main` push ve elle başlatma, testlerin deploy'dan önce çalışması, Cloudflare bilgilerinin secret'tan okunması, sabit Node sürümü ve salt okunur izin, eşzamanlı yayın koruması).

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
Yayın yolu: **GitHub Actions** (`main`'e push). Aşağıdaki adımlar bir kez yapılır.

### Tek seferlik kurulum
1. **Cloudflare API token:** Cloudflare panelinde My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" şablonu. Token yalnızca bu hesap/bölge ile sınırlandırılır.
2. **Account ID:** Workers & Pages sayfasının sağ tarafında görünür.
3. **GitHub secret'ları:** Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. **Cloudflare Git entegrasyonunu kapat:** Workers & Pages → `nodiwears` → Settings → Build → Disconnect. Açık kalırsa her push iki kez yayınlanır.
5. **Alan adı:** `www.nodiwears.com` ve `nodiwears.com` özel alan adları `wrangler.jsonc` içindedir; bölge Cloudflare'de "Active" olmalı. `www` / apex için elle eklenmiş DNS kaydı varsa silinir (yoksa `100117` hatası). Ayrıntılar `domain-and-seo.md` dosyasındadır.

### Günlük akış
1. Değişiklik bir dalda (örn. `feat/...`) yapılır, `npm test` ve `npm run build` yerelde geçer.
2. Dal `main`'e merge edilir (PR veya doğrudan).
3. `main`'e push gelince workflow çalışır: test → build → deploy. Sonuç GitHub'da Actions sekmesinde izlenir.
4. Yayın sonrası QA senaryoları canlı adreste kontrol edilir.

### Elle yayın ve geri alma
- **Elle başlatma:** GitHub → Actions → "Deploy to Cloudflare" → Run workflow (`main` dalından çalışır).
- **Geri alma (hızlı):** Cloudflare → Workers & Pages → `nodiwears` → Deployments → önceki sürümde Rollback.
- **Geri alma (kalıcı):** Sorunlu merge `git revert` ile geri alınır ve `main`'e push edilir; workflow önceki hâli yayınlar.
- **Bilgisayardan yayın (acil durum):** `npx wrangler login`, sonra `npm run deploy`. Bu, `main` dışındaki bir dalı da yayınlayabilir; kullanılırsa sonradan `main` ile eşitlenmelidir.

### Alternatifler
- **Cloudflare Git entegrasyonu:** Workers & Pages → Create → Import a repository. Build komutu `npm run build`, deploy komutu `npx wrangler deploy`. GitHub Actions yolu kullanılırken kapalı tutulur.
- **Pages ile:** build komutu `npm run build`, çıktı dizini `dist`.

## Known Limitations
- CSP `'unsafe-inline'` içerir (satır içi modül script'leri ve stiller nedeniyle); hash/nonce tabanlı sıkı CSP ayrı bir iyileştirmedir.
- Alan adı Cloudflare hesabında aktif olmadan özel alan adı bağlanamaz; `*.workers.dev` adresi de açık kalır (canonical `www.nodiwears.com`'u gösterir).

## Change History
| Tarih | Değişiklik |
| --- | --- |
| 2026-10-13 | İlk sürüm: Cloudflare yapılandırması, güvenlik/önbellek başlıkları, 404 sayfası, deploy komutları, testler. |
| 2026-10-13 | Özel alan adı rotası eklendi (`nodiwears.com`); ayrıntılar `domain-and-seo.md`. |
| 2026-10-14 | `www.nodiwears.com` rotası eklendi (canlıda 522 veriyordu); ana adres `www` yapıldı. |
| 2026-10-15 | Yayın GitHub Actions'a taşındı: `main`'e push'ta test + deploy workflow'u, kurulum ve geri alma adımları, workflow testleri. |
