# Custom Design Order (Özel Tasarım)

## Business Purpose
Ziyaretçilerin kendi görselleriyle özel nakış siparişi verebilmesi; siparişin eksiksiz (ürün, renk, beden, görsel, iletişim) ve KVKK'ya uygun şekilde atölyeye ulaşması.

## Problem Statement
"Özel tasarım iste" butonu yalnızca genel iletişim formuna gidiyordu. Ürün tipi, renk, beden ve görsel serbest metinle isteniyor, görsel için açık rıza alınmıyordu.

## Scope
- Ayrı sayfa: `/ozel-tasarim/` (TR) ve `/en/custom-design/` (EN). Ana sayfadaki "Özel tasarım iste" butonu, header ve footer menüsü buraya gider.
- "Nasıl çalışıyoruz" biçiminde adım adım sihirbaz (4 adım):
  1. Ürün tipi: tişört, gömlek, hoodie, şort, şapka, buf, çorap.
  2. Renk (12 renk), beden (giyimde XS–XXL, çorapta 35-38 / 39-42 / 43-46, şapka ve bufta standart) ve **baskı ebatı** ile **baskı yeri** (ikisi de ürüne bağlı, aşağıdaki tabloya bakın). Ebat hazır seçeneklerden (Orta varsayılan) ya da özel ölçüyle (genişlik × yükseklik, cm) seçilir; yer, ürün resmine tıklayarak veya hazır noktalardan seçilir.
  3. Görsel yükleme. Önce zorunlu KVKK açık rıza kutusu; işaretlenmeden dosya seçilemez. Kurallar sayfada gösterilir.
  4. Önizleme (seçilen renkte ürün üzerinde görsel), sipariş özeti, isteğe bağlı not, ad ve e-posta, "Siparişi onayla".
- Onay sonrası "Siparişiniz bize ulaştı" ekranı.
- Sipariş gönderim sözleşmesi (aşağıda). Sunucu tarafı bu kapsamda **yoktur**.

## Out of Scope
- Sipariş e-postasını gönderen sunucu (Cloudflare Worker + e-posta servisi). Ayrı iş; `siteConfig.customOrderEndpoint` boş olduğu sürece sayfa "önizleme modunda" çalışır.
- Ödeme, fiyat, sipariş takibi, birden fazla ürün/görsel, görsel düzenleme (kırpma, konum).
- Seçimlerin tarayıcıda saklanması (gizlilik gereği hiçbir şey saklanmaz).

## Business Requirements
- Sipariş dört adımda tamamlanabilmeli; her adımda geri dönülebilmeli.
- Görsel yüklemeden önce açık rıza zorunlu olmalı; rıza geri alınırsa yüklenen görsel temizlenmeli.
- Sipariş, ziyaretçiye dönülebilmesi için ad ve e-posta içermeli.
- Sunucu hazır olana kadar ziyaretçi, siparişinin iletilmediği konusunda yanıltılmamalı.

## Functional Requirements
- Adım ilerlemesi: geçerli olmayan adımdan ileri gidilemez; hata mesajı sayfanın dilinde gösterilir. Tamamlanan adımlara üstteki adım göstergesinden dönülebilir.
- Ürün değişince beden seçimi sıfırlanır ve yalnızca ürüne uygun bedenler gösterilir.
- Görsel kuralları: JPG, PNG veya WEBP; en fazla 8 MB; kısa kenar en az 800 px; uzun kenar en fazla 6000 px. SVG ve diğer biçimler reddedilir.
- Önizleme temsilidir; ürün silüeti seçilen renkle boyanır, görsel ürüne özgü bir alana yerleşir.
- Baskı ebatı **ürüne bağlıdır**; azami ölçü (genişlik × yükseklik, cm) ve hazır ebatlar:

| Ürün | Azami | Hazır ebatlar |
|---|---|---|
| Tişört, Hoodie | 36 × 20 | 8×8, **15×12**, 25×18, 36×20 |
| Gömlek | 12 × 10 | 5×5, **9×8**, 12×10 |
| Şort | 12 × 10 | 5×5, **8×7**, 12×10 |
| Şapka | 10 × 6 | 4×3, **7×5**, 10×6 |
| Buf | 14 × 8 | 6×4, **10×6**, 14×8 |
| Çorap | 6 × 8 | 3×3, **4×5**, 6×8 |

  Kalın olan ebat varsayılandır (ürün seçilince otomatik gelir). Özel ölçü en az 2 × 2 cm, ürünün azamisini aşamaz (0,5 cm adım). Eksik, aşan veya çok küçük ölçü reddedilir ve hata mesajı ürünün kendi azamisini yazar.
- **Baskı yeri**: her ürünün bir baskı bölgesi vardır (resimde kesikli çerçeve). Ziyaretçi resme tıklayarak, ok tuşlarıyla (Shift ile 4 kat hızlı) ya da hazır noktalarla (ör. Tişört: Ortada, Sol/Sağ göğüs; Şapka: Önde, Sol/Sağ yan; Çorap/Buf: Üstte, Ortada, Altta) yeri seçer. Baskının kutusu seçilen ebatla gösterilir ve bölgenin dışına taşamaz; ebat büyüyünce kutu bölgenin içine geri çekilir.
- Önizleme (4. adım) görseli seçilen yerde ve ebatla gösterir; boyut ürüne göre gerçekçi ölçeklenir (1 cm'nin resimdeki karşılığı ürüne özeldir).
- Not en fazla 500, ad en fazla 100 karakter.
- Gönderim canlıdayken onay düğmesi görseli ve alanları `multipart/form-data` ile gönderir; başarıda teşekkür ekranı, hatada tekrar deneme mesajı gösterilir.
- Gönderim canlı değilken (`customOrderEndpoint` boş) onay düğmesi pasif ("Sipariş gönderimi çok yakında") ve adımda açıklama notu görünür.

## Technical Overview
- `src/data/custom-order.ts`: ürünler, bedenler, renkler ve ürün başına `printSpecs` (azami ölçü, hazır ebatlar, baskı bölgesi, hazır noktalar, cm→% ölçeği; iki dilli).
- `src/lib/custom-order.ts`: saf iş mantığı — adım doğrulama, görsel doğrulama, `findIncompleteStep`, `buildOrderFormData`.
- `src/lib/custom-order-wizard.ts`: sihirbazın tarayıcı tarafı (DOM, adım gezinmesi, görsel okuma, önizleme, gönderim).
- `src/components/CustomOrder.astro`: sayfa gövdesi ve stiller; `src/views/CustomDesignPage.astro` + `src/pages/ozel-tasarim.astro`, `src/pages/en/custom-design.astro`.
- Metinler `src/i18n/ui.ts` altında `customDesign`; yol `getCustomDesignPath`; sitemap'e iki dilli çift olarak eklenir.

## Architecture / Flow
Ürün → Renk/Beden → (Rıza → Görsel) → Önizleme + Not + İletişim → Onay → `POST customOrderEndpoint` → Teşekkür.
Tarayıcı görseli ancak onayda gönderir; seçim sırasında yalnızca yerel `blob:` adresiyle önizlenir ve hiçbir yere yüklenmez.

## Data Changes
Yok. Tarayıcıda kalıcı kayıt tutulmaz. Sunucu tarafı eklendiğinde görselin saklama/silme süresi KVKK metninde tanımlanmalıdır.

## Entry from the products page
`/ozel-tasarim/?product=<tip>` geçerli bir ürün kimliğiyse (ör. `hoodie`) sihirbaz o ürün seçili ve 2. adımdan açılır; geçersiz değer yok sayılır. Ürünler sayfasındaki "Özel tasarım iste" kartları bunu kullanır (bkz. `navigation-and-pages.md`).

## API / Integration Changes
Beklenen uç nokta sözleşmesi (henüz uygulanmadı): `POST {customOrderEndpoint}`, `multipart/form-data`.

| Alan | Açıklama |
|---|---|
| `locale` | `tr` veya `en` |
| `product` | `tshirt, shirt, hoodie, shorts, cap, scarf, socks` |
| `color` | renk kimliği (`black`, `navy` …) |
| `size` | beden kimliği (`M`, `one-size`, `39-42` …) |
| `printPreset` | `small, medium, large, max` veya `custom` |
| `printWidthCm`, `printHeightCm` | baskı ebatı (cm); ürünün azamisini aşamaz, en az 2 × 2 |
| `placementPreset` | hazır nokta kimliği (`center`, `left-chest` …) veya `custom` |
| `placementX`, `placementY` | baskı merkezinin ürün resmindeki konumu (% olarak, 0–100) |
| `name`, `email` | iletişim |
| `note` | isteğe bağlı, en fazla 500 karakter |
| `consent` | `yes` olmak zorunda |
| `image` | dosya |

Başarı `2xx`; diğer her durum istemcide hata olarak gösterilir. Sunucu tüm alanları (ürüne göre baskı ebadı sınırları ve baskı yerinin bölge içinde olması dahil) ve görseli (gerçek içerik türü, boyut, piksel ölçüsü) yeniden doğrulamalı, `consent=yes` olmadan reddetmeli, hız sınırı uygulamalı ve görseli e-postaya ekleyip yalnızca gereken süre saklamalıdır.

## Business Rules
- Açık rıza işaretlenmeden görsel seçilemez; rıza kaldırılırsa görsel silinir.
- Ürün başına geçerli bedenler dışında beden kabul edilmez.
- Baskı ebadı ürünün azami ölçüsünü aşamaz (tişört/hoodie 36 × 20 cm; şapka, çorap vb. çok daha küçük); sınırlar `src/data/custom-order.ts` içindeki `printSpecs` tablosunda tutulur.
- Baskı, ürünün baskı bölgesinin dışına yerleştirilemez.
- Önizleme bağlayıcı değildir; ölçü ve yerleşim sipariş sonrası netleştirilir.

## Error Scenarios
Ürün/renk/beden seçilmedi, baskı ebadı boş / ürünün azamisini aşıyor / 2×2 cm'den küçük, baskı yeri bölge dışında, rıza yok, görsel yok, geçersiz biçim, büyük dosya, küçük veya aşırı büyük çözünürlük, okunamayan görsel, ad/e-posta eksik veya hatalı, not çok uzun, gönderim hatası (sunucu 2xx dönmedi / ağ yok). Hepsi sayfa dilinde, ilgili adımda gösterilir.

## Edge Cases
- Görsel seçildikten sonra rıza kaldırılırsa görsel silinir ve adım tekrar kilitlenir.
- Uzun dosya adları kırılır, taşmaz.
- Çok büyük dosya çözülmeden (decode edilmeden) reddedilir.
- Önceki adıma dönüp ürünü değiştirmek bedeni sıfırlar; ileri giderken yeniden seçtirilir.
- JavaScript kapalıysa sihirbaz çalışmaz (form yalnızca istemcide işlenir).

## Security Considerations
- İstemci doğrulaması yalnızca kullanıcı deneyimi içindir; sunucu her şeyi yeniden doğrulamalıdır.
- SVG kabul edilmez (script içerebilir). Görsel yalnızca `blob:` URL ile gösterilir; kullanıcı metinleri `textContent` ile yazılır.
- Dosya adı yalnızca gösterim ve ek adı içindir; sunucu adı temizlemelidir.
- Kişisel veri (ad, e-posta, görsel) yalnızca onayda gönderilir; kalıcı kayıt yoktur.
- Sunucu tarafı eklenirken: hız sınırı, bot koruması (ör. Turnstile), boyut sınırı ve e-posta başlık enjeksiyonuna karşı alan temizliği gerekir.

## Unit Test Coverage
`src/lib/custom-order.test.ts` (adım, ürüne göre baskı ebadı, baskı yeri ve görsel doğrulama sınırları, ilk eksik adım, form verisi, iki dilde hata metinleri), `src/data/custom-order.test.ts` (her ürün için sınır, hazır ebat, bölge ve nokta bütünlüğü), `src/i18n/*.test.ts` (yol, sitemap, SEO sınırları, anahtar eşitliği).

## E2E Test Coverage
Projede tarayıcı tabanlı E2E altyapısı yoktur. Sihirbaz, derlenmiş sayfa üzerinde jsdom ile elle (tek seferlik betikle) doğrulanmıştır: adım gezinmesi, hata mesajları, rıza kilidi, her görsel kuralı, önizleme, gönderim başarı/hata yolları, iki dil. Bu betik depoya eklenmemiştir. Sunucu tarafı eklendiğinde gerçek uçtan uca test yazılmalıdır.

## QA Scenarios
Bkz. `custom-design.html`.

## Acceptance Criteria
- `/ozel-tasarim/` ve `/en/custom-design/` açılır, menüden ve ana sayfa butonundan ulaşılır.
- Dört adım sırayla tamamlanır; eksik adımda ilerlenemez.
- Rıza olmadan görsel seçilemez; geçersiz görseller doğru mesajla reddedilir.
- Baskı ebadı ürüne göre sınırlanır (şapkaya tişört boyu baskı verilemez); hazır ve özel ölçü çalışır.
- Baskı yeri resme tıklayarak, ok tuşlarıyla veya hazır noktalarla seçilir ve bölge dışına çıkamaz.
- Önizleme seçilen rengi, görseli, ebadı ve yeri gösterir.
- Gönderim canlı değilken onay pasiftir ve bunun nedeni görünür.
- Testler ve derleme başarılıdır.

## Deployment / Migration Considerations
Statik site; ek yapılandırma yok. Sunucu hazır olduğunda `siteConfig.customOrderEndpoint` doldurulur (aynı alan adı altındaki göreli yol önerilir, ör. `/api/custom-order`) ve CORS/`Content-Security-Policy` ihtiyacı değerlendirilir.

## Known Limitations
- Sipariş şu an e-postaya ulaşmaz (sunucu yok).
- Önizleme görseli kırpmaz/konumlandırmaz; baskı alanı ürün başına sabittir.
- Ürün silüetleri basit çizimlerdir, gerçek ürün fotoğrafı değildir.
- Görsel görünümü gerçek tarayıcıda gözle doğrulanmamıştır (bu ortamda tarayıcı yoktu).

## Change History
- 2026-10-15: Baskı ebadı ürüne bağlandı (ürün başına azami ölçü ve hazır ebat); baskı yeri seçimi (resme tıklama, ok tuşları, hazır noktalar) ve önizlemede yeri gösterme eklendi; gönderim sözleşmesine `placementPreset/X/Y` eklendi.
- 2026-10-15: `?product=` ile ürün ön seçimi eklendi.
- 2026-10-15: Baskı ebatı eklendi (hazır ebatlar + özel ölçü, en fazla 36 × 20 cm); önizleme ebada göre ölçeklenir; gönderim sözleşmesine `printPreset`, `printWidthCm`, `printHeightCm` eklendi.
- 2026-10-15: İlk sürüm. Sihirbaz arayüzü, doğrulamalar ve iki dil eklendi; sunucu tarafı kapsam dışı bırakıldı.
