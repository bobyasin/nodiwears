# nodiwears

nodiwears (kendi katalog ve özel tasarım nakışları) için kurumsal tanıtım sitesi (Astro, statik).

## Komutlar

| Komut             | İşlev                                  |
| :---------------- | :------------------------------------- |
| `npm install`     | Bağımlılıkları kurar                   |
| `npm run dev`     | Geliştirme sunucusu (`localhost:4321`) |
| `npm run build`   | Üretim çıktısını `./dist/` içine alır  |
| `npm run preview` | Üretim çıktısını yerelde önizler       |
| `npm test`        | Birim testlerini çalıştırır            |
| `npm run cf:dev`  | Siteyi yerelde Cloudflare çalışma zamanında açar |
| `npm run deploy`  | Siteyi derler ve Cloudflare'e yayınlar |

## Yapı

- `src/data/site.ts`: katalog ağacı (TR/EN adlar) ve iletişim bilgileri
- `src/i18n/`: diller, adres üretimi ve arayüz metinleri (`ui.ts`); yeni metin her iki dile eklenir
- `src/views/`: ortak sayfa gövdeleri; `src/pages/` altında `/` (TR) ve `/en/` (EN) için ince sarmalayıcılar
- `src/components/`: sayfa bölümleri
- `src/lib/contact.ts`: iletişim formu doğrulama ve `mailto` üretimi
- `src/styles/global.css`: renkler, tipografi ve ortak stiller
- `src/data/policies/`: KVKK, gizlilik ve çerez politikası metinleri (TR/EN)
- `wrangler.jsonc`, `public/_headers`, `src/pages/404.astro`: Cloudflare yayın yapılandırması
- `public/robots.txt`, `src/pages/sitemap.xml.ts`, `src/lib/sitemap.ts`, `src/lib/structured-data.ts`: arama motoru dosyaları ve JSON-LD
- `docs/`: özellik spesifikasyonları (teknik `.md` + iş/QA `.html`)

## Cloudflare'e yayın

Site statiktir; `wrangler.jsonc` ile Cloudflare Workers Static Assets olarak yayınlanır (`dist/` klasörü).

- **Git entegrasyonu (önerilen):** Cloudflare panelinde Workers & Pages → Create → Import a repository. Build komutu `npm run build`, deploy komutu `npx wrangler deploy`. Node sürümü `.node-version` dosyasından okunur.
- **Komut satırı:** `npx wrangler login`, sonra `npm run deploy`.
- **Cloudflare Pages ile:** build komutu `npm run build`, çıktı dizini `dist`.
- Güvenlik ve önbellek başlıkları `public/_headers` içindedir. Siteye yeni bir dış kaynak (script, font, görsel) eklerseniz buradaki CSP'yi de güncelleyin.
- Ana adres `https://www.nodiwears.com`: `wrangler.jsonc` içinde özel alan adı olarak tanımlı (apex `nodiwears.com` de yönlendirme için bağlı). Önce alan adını Cloudflare'e ekleyip nameserver'ları değiştirin (bölge "Active" olmalı). `www` veya apex için elle eklenmiş DNS kaydı varsa silin (yoksa Cloudflare `100117` hatası verir), sonra `npm run deploy`. E-posta (`merhaba@nodiwears.com`) ve apex → `www` yönlendirme kuralı panelden kurulur; adımlar için `docs/domain-and-seo.md`.

Yayın öncesi `src/data/site.ts` içindeki e-posta, telefon ve adresi gerçek değerlerle değiştirin.
