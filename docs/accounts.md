# Accounts: Login, Register, Profile (design only)

## Business Purpose
Ziyaretçilerin hesap açıp giriş yapabilmesi ve profillerinde bilgi/sipariş/adres yönetebilmesi için arayüzü hazırlamak. Arka uç servisi henüz yoktur.

## Problem Statement
Sitede hesap kavramı yoktu; siparişler her seferinde bilgi yeniden yazılarak veriliyordu.

## Scope
- Sayfalar (iki dilde): Giriş `/giris/` (EN `/en/login/`), Kayıt `/kayit/` (`/en/register/`), Profil `/profil/` (`/en/profile/`). Header'da "Giriş yap" bağlantısı.
- **Giriş**: e-posta, şifre (göster/gizle), "Beni hatırla", "Şifremi unuttum", kayıt sayfasına bağlantı.
- **Kayıt**: ad soyad, e-posta, telefon (isteğe bağlı), şifre + tekrar (göster/gizle), KVKK aydınlatma onayı (zorunlu), kampanya e-postası (isteğe bağlı), girişe bağlantı.
- **Profil**: avatar/ad/e-posta özeti ve "Çıkış yap" (pasif); sekmeler: Hesap bilgileri (ad, e-posta salt okunur, telefon, Kaydet), Siparişlerim (boş durum + "Özel tasarım iste"), Adreslerim (boş durum, "Adres ekle" pasif).
- İstemci doğrulaması ve hata mesajları.

## Out of Scope
- Kimlik doğrulama/oturum, şifre sıfırlama, e-posta doğrulama, gerçek profil/sipariş/adres verisi ve çıkış (hepsi arka uç ile).
- Üçüncü taraf girişi (Google vb.), iki adımlı doğrulama.
- Gerçek bir "giriş yapılmış" durumu: Header'da hesap bağlantısı şimdilik her zaman "Giriş yap"tır.

## Business Requirements
- Formlar net, erişilebilir ve iki dilli olmalı; hatalar alan bazlı metinle gösterilmeli.
- Hesap hizmeti hazır olana kadar ziyaretçi hiçbir verisinin gönderildiği izlenimine kapılmamalı.

## Functional Requirements
- Giriş: geçerli e-posta ve dolu şifre gerekir.
- Kayıt: ad (en fazla 100), geçerli e-posta, telefon boş olabilir ama doluysa 10–15 haneli geçerli biçimde olmalı, şifre 8–72 karakter, tekrar eşleşmeli, KVKK onayı işaretli olmalı.
- Profil: ad zorunlu, telefon kayıtla aynı kural.
- Geçerli bir form gönderilince "Hesap hizmeti henüz aktif değil … bilgileriniz hiçbir yere gönderilmez" notu gösterilir; hiçbir istek atılmaz.
- Şifre alanındaki "Göster/Gizle" düğmesi alanın türünü değiştirir.
- Profilde sekmeler fare ve ok tuşlarıyla (←/→) değişir.
- Giriş, kayıt ve profil sayfaları `noindex`'tir ve sitemap'te yoktur.

## Technical Overview
- `src/lib/account.ts`: saf doğrulama (`validateLogin/Register/Profile`).
- `src/lib/account-form.ts`: form ve sekme etkileşimi (`initAccountForm`, `initTabs`).
- `src/components/AccountForm.astro` (giriş/kayıt), `ProfilePanel.astro`; `src/views/AuthPage.astro`, `ProfilePage.astro`; sayfa sarmalayıcıları `src/pages/**`.
- Metinler `ui.ts` → `account`; adresler `PAGE_SLUGS`.

## Architecture / Flow
Form → istemci doğrulaması → hata veya "yakında" notu. Arka uç eklendiğinde `submit` işleyicisi gerçek isteğe bağlanacaktır.

## Data Changes
Yok (tarayıcıda kayıt tutulmaz).

## API / Integration Changes
Yok. Arka uç sözleşmesi (giriş, kayıt, profil, çıkış, oturum çerezi, CSRF) arka uç tasarlanırken ayrıca tanımlanacaktır.

## Business Rules
- Şifre en az 8, en çok 72 karakterdir.
- E-posta, hesaba giriş ve bildirimler için tek tanımlayıcıdır; profilde değiştirilemez.
- KVKK aydınlatma onayı olmadan kayıt tamamlanamaz.

## Error Scenarios
Geçersiz e-posta, boş/kısa/uzun şifre, eşleşmeyen şifre, boş/uzun ad, geçersiz telefon, onaysız KVKK. Hepsi sayfa dilinde, form üstünde gösterilir.

## Edge Cases
- Telefon boş bırakılabilir; `+90 (532) 123 45 67` gibi biçimler kabul edilir.
- Şifredeki baştaki/sondaki boşluklar korunur (kırpılmaz); e-posta ve ad kırpılır.
- Şifre göster/gizle, `aria-pressed` ile ekran okuyucuya bildirilir.

## Security Considerations
- Bu sürümde sunucuya hiçbir şey gönderilmez; şifre tarayıcıdan çıkmaz.
- Alanlar `autocomplete` öznitelikleriyle (`current-password`, `new-password`, `email`, `tel`) şifre yöneticileriyle uyumludur.
- Arka uç eklenirken: şifreler güçlü bir yavaş özetle (argon2id/bcrypt) saklanmalı, giriş/kayıt/sıfırlama uçlarına hız sınırı ve bot koruması konmalı, oturum çerezi `HttpOnly; Secure; SameSite`, CSRF koruması, hesap sayımını önlemek için genel hata mesajları kullanılmalıdır. İstemci doğrulaması yalnızca kullanım kolaylığıdır.

## Unit Test Coverage
`src/lib/account.test.ts`: giriş, kayıt (telefon biçimleri, şifre sınırları, eşleşme, KVKK, hepsi birden), profil ve iki dilde hata metinleri.

## E2E Test Coverage
Tarayıcı tabanlı E2E altyapısı yok. Giriş/kayıt/profil formları (hatalar, geçerli gönderim notu, şifre göster/gizle, TR/EN) ve profil sekmeleri (tıklama, ok tuşu) jsdom ile derlenmiş sayfalar üzerinde elle doğrulandı; betik depoya eklenmedi. Arka uç gelince gerçek E2E yazılmalıdır.

## QA Scenarios
Bkz. `accounts.html`.

## Acceptance Criteria
- Üç sayfa iki dilde açılır, Header'daki bağlantıyla girişe ulaşılır.
- Hatalı alanlar doğru mesajla reddedilir; geçerli formda "hizmet aktif değil" notu görünür.
- Profil sekmeleri çalışır; sayfalar sitemap'te yer almaz ve `noindex`'tir.

## Deployment / Migration Considerations
Statik; ek yapılandırma yok. Arka uç hazır olduğunda form işleyicileri, Header'daki hesap bağlantısı (giriş yapılmışsa "Profilim") ve profil verisi bağlanacaktır.

## Known Limitations
- Hiçbir hesap işlevi çalışmaz; yalnızca tasarım ve doğrulama vardır.
- Profil sayfasında yer tutucu ad/e-posta gösterilir.
- Görünüm gerçek tarayıcıda gözle doğrulanmadı.

## Change History
- 2026-10-15: İlk sürüm (giriş, kayıt, profil arayüzleri ve doğrulama; arka uç yok).
