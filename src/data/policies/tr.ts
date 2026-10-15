import { CONSENT_STORAGE_KEY } from '../../lib/cookie-consent';
import { getContactLine, siteConfig } from '../site';
import type { Policy } from './types';

export const UPDATED_AT_TR = '13 Ekim 2026';

const controller = `${siteConfig.name} (veri sorumlusu)`;

export const policiesTr: readonly Policy[] = [
  {
    id: 'kvkk',
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    summary: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl işlendiği.',
    sections: [
      {
        heading: 'Veri sorumlusu',
        paragraphs: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla ${controller} tarafından aşağıda açıklanan kapsamda işlenmektedir.`,
          `İletişim: ${getContactLine('tr')}`,
        ],
      },
      {
        heading: 'İşlenen kişisel veriler',
        items: [
          'Kimlik bilgisi: iletişim formuna yazdığınız ad.',
          'İletişim bilgisi: iletişim formuna veya e-postaya yazdığınız e-posta adresi.',
          'Talep bilgisi: mesajınızın içeriği (ör. ilgilendiğiniz tasarım, ürün ve adet bilgisi).',
        ],
        paragraphs: ['Sitede üyelik, ödeme veya hesap oluşturma bulunmadığından bunlara ilişkin veri işlenmemektedir.'],
      },
      {
        heading: 'İşleme amaçları',
        items: [
          'Sipariş ve özel tasarım taleplerinizi almak ve yanıtlamak,',
          'Talebinizle ilgili görüşme, teklif ve teslim süreçlerini yürütmek,',
          'Hukuki yükümlülüklerimizi yerine getirmek.',
        ],
      },
      {
        heading: 'Toplama yöntemi ve hukuki sebep',
        paragraphs: [
          'Verileriniz, sitedeki iletişim formu aracılığıyla hazırlanan e-posta ile veya doğrudan bize yazdığınız e-posta ve telefon görüşmeleriyle toplanır.',
          "Verileriniz KVKK m.5/2-c (bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması), m.5/2-ç (hukuki yükümlülüğün yerine getirilmesi) ve m.5/2-f (ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaat) hukuki sebeplerine dayanılarak işlenir.",
        ],
      },
      {
        heading: 'Verilerin aktarılması',
        paragraphs: [
          'Kişisel verileriniz üçüncü kişilere satılmaz veya pazarlama amacıyla paylaşılmaz. Yalnızca hizmetin sunulması için gerekli olduğu ölçüde e-posta ve barındırma hizmeti sağlayıcılarına ve kanunen yetkili kamu kurum ve kuruluşlarına aktarılabilir.',
        ],
      },
      {
        heading: 'Saklama süresi',
        paragraphs: [
          'Verileriniz, talebinizin sonuçlanması için gereken süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca saklanır; sürenin dolmasından sonra silinir, yok edilir veya anonim hale getirilir.',
        ],
      },
      {
        heading: 'KVKK m.11 kapsamındaki haklarınız',
        items: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme,',
          'İşlenmişse buna ilişkin bilgi talep etme,',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
          'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme,',
          'KVKK m.7 çerçevesinde silinmesini veya yok edilmesini isteme,',
          'Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
          'Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,',
          'Kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.',
        ],
      },
      {
        heading: 'Başvuru yöntemi',
        paragraphs: [
          `Haklarınıza ilişkin taleplerinizi ${siteConfig.contactEmail} adresine yazılı olarak iletebilirsiniz. Başvurunuz, talebin niteliğine göre en geç otuz gün içinde sonuçlandırılır.`,
        ],
      },
    ],
  },
  {
    id: 'privacy',
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    summary: 'Bu sitede hangi bilgilerin nasıl toplandığı, kullanıldığı ve korunduğu.',
    sections: [
      {
        heading: 'Kapsam',
        paragraphs: [
          `Bu politika, ${siteConfig.name} web sitesini kullanırken bilgilerinizin nasıl ele alındığını açıklar. Kişisel verilerin işlenmesine ilişkin ayrıntılar için KVKK Aydınlatma Metni'ne bakabilirsiniz.`,
        ],
      },
      {
        heading: 'Hangi bilgileri topluyoruz',
        paragraphs: [
          'Siteyi gezmek için bilgi vermeniz gerekmez. Yalnızca iletişim formunu kullanırsanız yazdığınız ad, e-posta adresi ve mesajı bizimle paylaşmış olursunuz. Sitede üyelik, ödeme veya hesap sistemi yoktur.',
        ],
      },
      {
        heading: 'İletişim formu nasıl çalışır',
        paragraphs: [
          'Form bilgileri sitenin sunucusuna gönderilmez. "Talebi gönder" düğmesine bastığınızda e-posta uygulamanız hazır bir mesajla açılır ve mesajı siz gönderirsiniz. Bilgileriniz yalnızca bu e-postayı gönderdiğinizde bize ulaşır.',
        ],
      },
      {
        heading: 'Bilgilerinizi nasıl kullanıyoruz',
        items: ['Taleplerinizi yanıtlamak,', 'Sipariş ve özel tasarım süreçlerini yürütmek,', 'Yasal yükümlülükleri yerine getirmek.'],
        paragraphs: ['Bilgilerinizi reklam veya profilleme amacıyla kullanmıyoruz.'],
      },
      {
        heading: 'Paylaşım',
        paragraphs: [
          'Bilgilerinizi satmıyoruz. Yalnızca e-posta ve barındırma gibi hizmet sağlayıcılarla ve yasal olarak yetkili kurumlarla, gerektiği ölçüde paylaşabiliriz.',
        ],
      },
      {
        heading: 'Güvenlik',
        paragraphs: ['Bilgilerinizi korumak için makul teknik ve idari tedbirler alıyoruz. Yine de internet üzerinden iletimin tamamen risksiz olduğu garanti edilemez.'],
      },
      {
        heading: 'Değişiklikler ve iletişim',
        paragraphs: [
          'Bu politika zaman zaman güncellenebilir; güncel sürüm her zaman bu sayfada yer alır. Sorularınız için ' + siteConfig.contactEmail + ' adresine yazabilirsiniz.',
        ],
      },
    ],
  },
  {
    id: 'cookies',
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    summary: 'Bu sitede çerez ve benzeri teknolojilerin nasıl kullanıldığı.',
    sections: [
      {
        heading: 'Çerez nedir',
        paragraphs: [
          'Çerezler ve benzeri teknolojiler (ör. tarayıcının yerel depolaması), bir siteyi ziyaret ettiğinizde cihazınızda saklanan küçük veri parçalarıdır.',
        ],
      },
      {
        heading: 'Bu sitede ne kullanıyoruz',
        paragraphs: [
          'Bu site yalnızca zorunlu bir kayıt kullanır: çerez bildirimini kapattığınızı hatırlamak için tarayıcınızın yerel depolamasına küçük bir değer yazar. Analitik, reklam veya takip amaçlı çerez kullanmıyoruz ve üçüncü taraf izleme araçları yüklemiyoruz.',
        ],
        table: {
          head: ['Ad', 'Tür', 'Amaç', 'Süre'],
          rows: [[CONSENT_STORAGE_KEY, 'Zorunlu, birinci taraf (yerel depolama)', 'Çerez bildirimini kapattığınızı hatırlamak', 'Siz silene kadar']],
        },
      },
      {
        heading: 'İzin ve gelecekteki değişiklikler',
        paragraphs: [
          'Zorunlu kayıtlar için ayrıca onay alınmaz. İleride analitik veya benzeri isteğe bağlı çerezler kullanmaya başlarsak, bunları yalnızca açık izninizle etkinleştirir ve bu politikayı güncelleriz.',
        ],
      },
      {
        heading: 'Çerezleri nasıl yönetebilirsiniz',
        paragraphs: [
          'Tarayıcı ayarlarınızdan çerezleri ve site verilerini silebilir veya engelleyebilirsiniz. Zorunlu kaydı silerseniz çerez bildirimi tekrar gösterilir; sitenin diğer işlevleri etkilenmez.',
        ],
      },
      {
        heading: 'İletişim',
        paragraphs: [`Sorularınız için ${siteConfig.contactEmail} adresine yazabilirsiniz.`],
      },
    ],
  },
];
