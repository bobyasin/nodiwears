import type { Localized } from './config';

const tr = {
  meta: {
    tagline: 'Özgün nakış tasarımları ve özel nakış işleme',
    description:
      'nodiwears; mitoloji, bitkiler ve hayvanlar gibi koleksiyonlarda kendi nakış tasarımlarını sunar ve size özel nakış tasarımı yapar.',
  },
  nav: {
    catalog: 'Katalog',
    contact: 'İletişim',
    order: 'Sipariş ver',
    homeLabel: 'nodiwears ana sayfa',
    mainMenuLabel: 'Ana menü',
    menuToggle: 'Menüyü aç/kapat',
  },
  language: {
    groupLabel: 'Dil',
    tr: 'Türkçe',
    en: 'English',
  },
  hero: {
    titleLine: 'iğne iğne',
    titleMark: 'işlenir.',
    lead: 'Kendi tasarımlarımız. Ya da size özel.',
    ctaCatalog: 'Kataloğa bak',
    ctaCustom: 'Özel tasarım iste',
    logoAlt: 'nodiwears nakış ve giyim logosu: iğne ve ipten oluşan N ve W harfleri',
  },
  catalog: {
    title: 'Katalog',
    all: 'Tümü',
    filterLabel: 'Koleksiyona göre filtrele',
  },
  contact: {
    title: 'Bize yazın',
    email: 'E-posta:',
    phone: 'Telefon:',
    nameField: 'Adınız',
    emailField: 'E-posta',
    messageField: 'Mesajınız',
    submit: 'Talebi gönder',
    note: 'Bilgileriniz talebinizi yanıtlamak için kullanılır.',
    noteLink: 'KVKK Aydınlatma Metni',
    mailSubject: 'Sipariş talebi',
    mailNameLabel: 'Ad',
    mailEmailLabel: 'E-posta',
    errors: {
      'name-required': 'Lütfen adınızı yazın.',
      'name-too-long': 'Ad en fazla {max} karakter olabilir.',
      'email-invalid': 'Lütfen geçerli bir e-posta adresi yazın.',
      'message-required': 'Lütfen mesajınızı yazın.',
      'message-too-long': 'Mesaj en fazla {max} karakter olabilir.',
    },
  },
  design: {
    back: '← Katalog',
    previewSoon: 'Görsel yakında',
    previewAlt: '{title} tasarımı için görsel yakında',
    seoTitle: '{title} nakış tasarımı | {name}',
    description:
      '{title}: nodiwears kataloğundaki {collection} koleksiyonundan özgün nakış tasarımı. Giyim ürünlerinize işletmek için bize yazın.',
    more: 'Bu koleksiyondan diğerleri',
    inquiry: 'Merhaba, {collection} koleksiyonundan "{design}" tasarımıyla ilgileniyorum.',
  },
  policy: {
    back: '← Ana sayfa',
    updated: 'Son güncelleme: {date}',
  },
  footer: {
    rights: '© {year} {name}. Tüm hakları saklıdır.',
    policiesLabel: 'Politikalar',
  },
  cookie: {
    label: 'Çerez bildirimi',
    text: 'Bu site yalnızca zorunlu kayıt kullanır; takip veya reklam çerezi yok.',
    policyLink: 'Çerez politikası',
    ok: 'Tamam',
  },
};

const en: typeof tr = {
  meta: {
    tagline: 'Original embroidery designs and custom embroidery',
    description:
      'nodiwears offers its own embroidery designs in collections like mythology, plants and animals, and creates custom embroidery designs just for you.',
  },
  nav: {
    catalog: 'Catalog',
    contact: 'Contact',
    order: 'Order now',
    homeLabel: 'nodiwears home',
    mainMenuLabel: 'Main menu',
    menuToggle: 'Toggle menu',
  },
  language: {
    groupLabel: 'Language',
    tr: 'Türkçe',
    en: 'English',
  },
  hero: {
    titleLine: 'stitch by',
    titleMark: 'stitch.',
    lead: 'Our own designs. Or made just for you.',
    ctaCatalog: 'Browse catalog',
    ctaCustom: 'Request a custom design',
    logoAlt: 'nodiwears embroidery and wear logo: the letters N and W formed by a needle and thread',
  },
  catalog: {
    title: 'Catalog',
    all: 'All',
    filterLabel: 'Filter by collection',
  },
  contact: {
    title: 'Write to us',
    email: 'Email:',
    phone: 'Phone:',
    nameField: 'Your name',
    emailField: 'Email',
    messageField: 'Your message',
    submit: 'Send request',
    note: 'Your details are used to answer your request.',
    noteLink: 'KVKK Privacy Notice',
    mailSubject: 'Order request',
    mailNameLabel: 'Name',
    mailEmailLabel: 'Email',
    errors: {
      'name-required': 'Please enter your name.',
      'name-too-long': 'The name can be at most {max} characters.',
      'email-invalid': 'Please enter a valid email address.',
      'message-required': 'Please enter your message.',
      'message-too-long': 'The message can be at most {max} characters.',
    },
  },
  design: {
    back: '← Catalog',
    previewSoon: 'Image coming soon',
    previewAlt: 'Image coming soon for the {title} design',
    seoTitle: '{title} embroidery design | {name}',
    description:
      '{title}: an original embroidery design from the {collection} collection in the nodiwears catalog. Write to us to have it stitched on your clothing.',
    more: 'More from this collection',
    inquiry: 'Hello, I am interested in the "{design}" design from the {collection} collection.',
  },
  policy: {
    back: '← Home',
    updated: 'Last updated: {date}',
  },
  footer: {
    rights: '© {year} {name}. All rights reserved.',
    policiesLabel: 'Policies',
  },
  cookie: {
    label: 'Cookie notice',
    text: 'This site only uses a strictly necessary record; there are no tracking or advertising cookies.',
    policyLink: 'Cookie policy',
    ok: 'Got it',
  },
};

export type UiStrings = typeof tr;

export const ui: Localized<UiStrings> = { tr, en };
