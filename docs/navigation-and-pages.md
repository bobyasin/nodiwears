# Navigation, Products and Corporate Pages

## Business Purpose
Ziyaretçilerin ürün tiplerine kategoriden ulaşabilmesi, markayı tanıyabilmesi (Hakkımızda, Biz kimiz, Belgelerimiz) ve iletişime kolayca geçebilmesi.

## Problem Statement
Menü yalnızca Katalog, Özel tasarım ve İletişim bağlantılarından oluşuyordu; ürünler kategoriye göre gezilemiyor, kurumsal bilgi sayfaları yoktu.

## Scope
- Header menü sırası: **Kurumsal** (açılır menü), **Katalog**, **Ürünler** (açılır menü), **İletişim**; sonra "Sipariş ver" düğmesi, dil değiştirici, "Giriş yap" bağlantısı. Özel tasarım sayfasına menüden değil; ana sayfadaki "Özel tasarım iste", ürün kartları ve footer üzerinden ulaşılır.
- **Ürünler menüsü** (mega menü): Erkek, Kadın, Unisex, Aksesuar. Bir kategoriye gelince/odaklanınca sağda o kategorinin ürün tipleri ve "Hepsini gör" çıkar. Kategoriye, bir tipe veya "Hepsini gör"e tıklamak `/urunler/` (EN `/en/products/`) sayfasını ilgili filtreyle açar.
- Kategori → tipler: Erkek ve Kadın: tişört, gömlek, hoodie, şort; Unisex: tişört, hoodie; Aksesuar: şapka, buf, çorap.
- **Ürünler sayfası**: kategori ve tip çipleriyle süzme, ürün kartları (silüet, ad, kategori), sonuç sayısı, boş durum. Karttaki "Özel tasarım iste" özel tasarım sayfasını o ürün seçili açar (`?product=`).
- **Kurumsal menüsü**: Hakkımızda (`/kurumsal/hakkimizda/`), Biz kimiz (`/kurumsal/biz-kimiz/`), Belgelerimiz (`/kurumsal/belgelerimiz/`). **İletişim** menüde ayrı bir bağlantıdır; ana sayfadaki iletişim bölümüne (`/#iletisim`) gider. Kurumsal sekmelerdeki İletişim sekmesi ise sekmeler görünür kalacak şekilde `/iletisim/` sayfasını açar. EN: `/en/corporate/about-us/`, `who-we-are`, `certificates`, `/en/contact/`.
- Kurumsal sayfalarda ve İletişim sayfasında üstte aynı kardeş sayfa sekmeleri (Hakkımızda, Biz kimiz, Belgelerimiz, İletişim) görünür; İletişim'e geçince sekmeler kaybolmaz (`CorporateTabs.astro`). Footer menüsü de bu sayfaları listeler.
- "Sipariş ver" düğmesi Ürünler sayfasına gider (önce ürün tipi seçilir, karttaki "Özel tasarım iste" siparişi başlatır).

## Out of Scope
- Gerçek ürün/stok/fiyat verisi: ürünler sayfası ürün **tiplerini** listeler, ürün kataloğu değildir.
- Belge dosyalarının yüklenmesi (Belgelerimiz'de "Yakında yüklenecek" yer tutucuları var).
- Ekip: Biz kimiz'de beş kişi, nakışla işlenmiş sembolik portreleri, adları, çalışma alanı başlıkları ve kısa tanıtım yazılarıyla alt alta kartlar olarak gösterilir (sıra: Ayça, Çağla, Selçuk, Burak, Yasin).

## Business Requirements
- Ürün tipine en çok iki tıkla ulaşılabilmeli.
- Menü fare, dokunmatik ve klavye ile kullanılabilmeli; mobilde açılır menüler hamburger içinde çalışmalı.
- Sayfa metinleri iki dilde olmalı.

## Functional Requirements
- Masaüstünde menüye gelince açılır, çıkınca kısa gecikmeyle kapanır; tıklamayla da açılıp kapanır. Esc, dışarı tıklama ve odağın menüden çıkması kapatır. Başka menü açılınca öncekini kapatır.
- Mega menüde kategoriye gelince/odaklanınca o kategorinin tipleri görünür; varsayılan ilk kategoridir.
- Mobilde (≤760 px) menü hamburger paneli içinde, kategoriler ve tipleri alt alta gösterilir.
- Ürünler sayfasında `?category=` ve `?type=` okunur; bilinmeyen kategori/tip yok sayılır ve tüm ürünler gösterilir; kategoride olmayan tip yok sayılır. Çipe tıklamak sayfayı yeniden yüklemeden süzer ve adresi günceller; geri/ileri düğmesi çalışır.
- JavaScript kapalıyken ürünler sayfası tüm kartları gösterir; menüler masaüstünde üzerine gelince açılır.
- Sitemap'e Özel tasarım, Ürünler, Hakkımızda, Biz kimiz, Belgelerimiz, İletişim (iki dilde) eklenir.

## Technical Overview
- `src/i18n/paths.ts`: `PAGE_SLUGS` + `getPagePath` (tüm bağımsız sayfaların iki dilli adresi).
- `src/data/products.ts`: kategoriler, kategori→tip eşlemesi, `parseProductFilter`, `buildProductsQuery`.
- `src/components/Header.astro` + `src/lib/header-menus.ts`: menüler ve etkileşim. `ProductSprite.astro`: ortak ürün silüetleri.
- `src/components/ProductList.astro` + `src/lib/products-filter.ts`, `src/views/ProductsPage.astro`.
- `src/views/CorporatePage.astro` (üç kurumsal sayfa), `src/components/StitchPortraits.astro` (Biz kimiz'deki 5 kişilik kart listesi; portreler `src/assets/team/` altındaki hazır nakış görselleridir), `src/views/ContactPage.astro` (mevcut İletişim bileşeni).
- Metinler `ui.ts`: `nav` (+`categories`), `productsPage`, `about`, `whoWeAre`, `certificates`, `contactPage`.

## Architecture / Flow
Menü → `/urunler/?category=&type=` → filtre → kart → `/ozel-tasarim/?product=<tip>` → 2. adım.

## Data Changes
Yok.

## API / Integration Changes
Yok. Özel tasarım sayfası `?product=` okur (geçerli ürün kimliği değilse yok sayılır).

## Business Rules
- Aksesuar kategorisi: şapka, buf, çorap. Giyim tipleri aksesuarda gösterilmez.
- Ürün kartı bir stok ürünü değil, nakışa hazır ürün tipidir.

## Error Scenarios
Bilinmeyen kategori/tip: tüm ürünler gösterilir. Süzüm boşsa "Bu seçimde ürün bulunamadı." gösterilir (şu anki veriyle oluşmaz).

## Edge Cases
- Hover ile menüden çıkarken çapraz hareket: kapanma gecikmesi menünün titremesini önler.
- Dokunmatik cihazda hover yoktur; tıklama kullanılır.
- Çok dar ekranda mega menü hamburger içinde alt alta açılır, taşmaz.

## Security Considerations
Adres parametreleri yalnızca bilinen kimliklerle eşleştirilir; ham değer DOM'a yazılmaz veya seçiciye konmaz. Belgeler/ekip metinleri sabit çeviridir.

## Unit Test Coverage
`src/data/products.test.ts` (kategoriler, tip bütünlüğü, süzgeç okuma/üretme), `src/i18n/i18n.test.ts` (yollar, benzersizlik), `src/i18n/sitemap-pages.test.ts`, `src/i18n/seo.test.ts` (başlık/açıklama sınırları).

## E2E Test Coverage
Tarayıcı tabanlı E2E altyapısı yok. Menüler (hover/tık/Esc/dışarı tıklama/kategori değişimi), ürün süzgeci (adres, geri/ileri öncesi durum, bilinmeyen değer), özel tasarıma yönlendirme jsdom ile derlenmiş sayfalar üzerinde elle doğrulandı; betik depoya eklenmedi.

## QA Scenarios
Bkz. `navigation-and-pages.html`.

## Acceptance Criteria
- Header'da Ürünler ve Kurumsal açılır menüleri çalışır; Ürünler → kategori → tip veya "Hepsini gör" ürünler sayfasını süzülmüş açar.
- Kurumsal sayfaları ve İletişim sayfası iki dilde açılır.
- Karttaki düğme özel tasarımı o ürünle başlatır.
- Testler ve derleme başarılı.

## Deployment / Migration Considerations
Statik; ek yapılandırma yok. Eski `/#iletisim` bağlantıları çalışmaya devam eder (ana sayfada bölüm hâlâ var).

## Known Limitations
- Menülerin ve sayfaların görünümü gerçek tarayıcıda gözle doğrulanmadı (bu ortamda tarayıcı yoktu).
- Beş portre de hazır nakış görselleridir (`src/assets/team/*.jpeg`); değiştirmek için dosyayı aynı adla değiştirmek yeterlidir. Görsellerin dışındaki beyaz köşeler kırpılır.
- Hakkımızda / Biz kimiz metinleri taslaktır; marka ve gerçek ekip bilgisiyle güncellenmelidir. Belgeler yer tutucudur.

## Change History
- 2026-10-15: Mobilde açılan menü ekrandan uzunsa kendi içinde kaydırılır (yükseklik ekranla sınırlı); önceden alt kısım (Unisex'ten sonrası) ekran dışında kalıyor ve menü kaydırılamıyordu.
- 2026-10-15: Çifut Serisi kartları artık hazır ürün fotoğraflarını kullanır (`src/assets/series/cifut/*.png`: tişört, gömlek, kapüşonlu, şapka, çorap); büyük görsel ürün fotoğrafı, köşedeki küçük yuvarlak görsel aynı fotoğrafın nakış üzerine yakınlaştırılmış hali. Önceki silüet üstü rozet gösterimi kaldırıldı.
- 2026-10-15: Çifut Serisi kartlarında tasarım artık ürün silueti üzerinde gösterilir (konum ve boyut ürünün baskı kurallarından: ilk konum, "büyük" ya da "orta" ebat); düz görsel köşede küçük rozet olarak kalır.
- 2026-10-15: Çifut Serisi ürün tipleri tişört, gömlek, kapüşonlu, şapka ve çorap oldu; her birinin nakış görseli `src/assets/series/cifut/` altından Ürünler sayfasındaki seri kartında gösterilir.
- 2026-10-15: Çifut Serisi, Ürünler mega menüsüne kategorilerin altına eklendi; "Seriyi gör" bağlantısı Ürünler sayfasını `?series=cifut` ile açar.
- 2026-10-15: Biz kimiz'e Çifut eklendi; yazısındaki "buradan" bağlantısı Ürünler sayfasındaki Çifut Serisi'ni (`?series=cifut`) açar. Ürünler sayfasına "Özel seriler" filtresi eklendi (şimdilik tişört, kapüşonlu, şapka; gerçek ürünler gelince güncellenecek).
- 2026-10-15: Burak ve Selçuk'un saçı kısaltıldı ve dalgalı kenarlı yapıldı; Ayça'nın saçı kıvırcık yapıldı (omuz hizası, kıvırcık kakül).
- 2026-10-15: Çağla'nın saçının tepesi inceltildi (kabarık görünmüyor).
- 2026-10-15: Çağla'nın saçı tek parça, düz ve salma yapıldı (ek katman yok); Ayça'nın saçı hafif dalgalı yapıldı.
- 2026-10-15: Çağla'nın saçı başörtüsü gibi görünmesin diye yeniden çizildi (yandan taranmış kakül, omuzlara dökülen uzun lüleler).
- 2026-10-15: Ekibin grup görseli (`all.jpeg`) Biz kimiz sayfasından kaldırıldı.
- 2026-10-15: Biz kimiz'deki giriş paragraflarının genişliği sınırsız bırakıldı (kartlarla aynı genişlik), böylece sağ kenarları kartlarla hizalanır ve yazı "yarıda kesilmiş" görünmez; ikinci paragrafın yazı boyutu birinciyle eşitlendi.
- 2026-10-15: Biz kimiz'deki iki giriş paragrafının da (üstteki ve alttaki) iki yana yaslı olması garantiye alındı: yaslama kuralı pekiştirildi, "güzel satır kırma" (text-wrap: pretty) bu paragraflarda kapatıldı.
- 2026-10-15: Biz kimiz kartlarının arka planı, her kişinin portredeki tişört renginin yumuşak (%14) tonu yapıldı (Ayça mor, Çağla yeşil, Selçuk bordo, Burak antrasit, Yasin hardal); kenarlık aynı rengin biraz koyu (%28) tonu.
- 2026-10-15: Selçuk'un görseli yeni sürümle (kaşlı) değiştirildi.
- 2026-10-15: Çağla'nın görseli yeni sürümle (kaşlı) değiştirildi.
- 2026-10-15: Burak için de hazır nakış görseli kullanıldı (`src/assets/team/burak.jpeg`); beş portrenin hepsi hazır görsel oldu, kodla çizilen portre kodu tamamen kaldırıldı.
- 2026-10-15: Yasin ve Selçuk için hazır nakış görselleri kullanıldı (`src/assets/team/yasin.jpeg`, `selcuk.jpeg`); kodla çizilen tek portre Burak'ta kaldı, kullanılmayan çizim kodu (kıvırcık saç, uzun/orta sakal) kaldırıldı.
- 2026-10-15: Biz kimiz sayfasındaki yazılar (giriş paragrafları ve kişi tanıtımları) iki yana yaslı (justify) yapıldı; satır boşluklarını dengelemek için otomatik tire (hyphenation) açıldı.
- 2026-10-15: Üst menüdeki "İletişim" artık ana sayfadaki iletişim bölümüne giden bir bağlantıdır (`/#iletisim`); kurumsal sekmelerdeki "İletişim" sekmeli iletişim sayfasını açmaya devam eder. Ekip sırası Ayça, Çağla, Selçuk, Burak, Yasin oldu.
- 2026-10-15: Biz kimiz içeriği güncellendi: "Biz Kimiz?" başlığı, iki giriş paragrafı (15 yılı aşkın dostluk, beş arkadaş, Nodi ekosistemi) ve her kişi için resim solda / yazı sağda (mobilde üstte/altta), alt alta beş kart: Ayça (Güven, Uyum & Müşteri Deneyimi), Çağla (Tedarik & İş Geliştirme), Selçuk (Üretim & Sipariş Yönetimi), Burak (Stok, Kalite & Lojistik), Yasin (Dijital Deneyim & Yazılım). "Değerlerimiz" bölümü kaldırıldı. İngilizce çeviri eklendi.
- 2026-10-15: Selçuk, Burak ve Yasin'in portreleri kızlarınkine benzer canlı nakış görünümüyle yeniden tasarlandı: SVG ışık filtresiyle kabartmalı ip dokusu, tek tek ip çizgilerinden saç ve sakal, yumuşak ip kenarlı konturlar.
- 2026-10-15: İletişim sayfasına da kurumsal sekmeler eklendi; sekmelerden İletişim'e geçince menü kaybolmuyor.
- 2026-10-15: Çağla'nın portresi için hazır nakış görseli kullanıldı (`src/assets/team/cagla.jpeg`); kodla çizilen portre sayısı üçe indi (Selçuk, Burak, Yasin); kırpma altın halkaya göre sıkılaştırıldı.
- 2026-10-15: Kodla çizilen dört portre (Çağla, Selçuk, Burak, Yasin) Ayça'nın görseline yaklaşacak şekilde yeniden çizildi: keten dokulu zemin, satin dikişli altın halka, ip yönünde saç/sakal, kulak, kaş, yanak, gözde ışık.
- 2026-10-15: Ayça'nın portresi için hazır nakış görseli kullanıldı (`src/assets/team/ayca.jpeg`); diğer dört portre kodla çizilen SVG olarak kaldı.
- 2026-10-15: "Sipariş ver" düğmesi Ürünler sayfasına yönlendirilir.
- 2026-10-15: Menü sırası Kurumsal, Katalog, Ürünler, İletişim yapıldı; İletişim kurumsal altından çıkıp üst düzey oldu; menüden Özel tasarım bağlantısı kaldırıldı.
- 2026-10-15: Portreler iki satıra bölündü (üstte kızlar, altta erkekler); Selçuk ve Burak'ın saçı hafif yukarı dalgalı; header arka planı "işlenir" altındaki sarıyla (`--color-sun-soft`) aynı yapıldı.
- 2026-10-15: Biz kimiz sayfasına 5 sembolik nakış portresi eklendi.
- 2026-10-15: İlk sürüm (menüler, ürünler sayfası, kurumsal sayfalar, iletişim sayfası).
