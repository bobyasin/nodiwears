import { CONSENT_STORAGE_KEY } from '../../lib/cookie-consent';
import { siteConfig } from '../site';
import type { Policy } from './types';

export const UPDATED_AT_EN = 'October 13, 2026';

const controller = `${siteConfig.name} (data controller)`;

export const policiesEn: readonly Policy[] = [
  {
    id: 'kvkk',
    slug: 'kvkk-notice',
    title: 'KVKK Privacy Notice',
    summary: 'How your personal data is processed under Turkish Personal Data Protection Law No. 6698 (KVKK).',
    sections: [
      {
        heading: 'Data controller',
        paragraphs: [
          `Under Turkish Personal Data Protection Law No. 6698 ("KVKK"), your personal data is processed by ${controller} as described below.`,
          `Contact: ${siteConfig.contactEmail} · ${siteConfig.contactPhone} · ${siteConfig.address.en}`,
        ],
      },
      {
        heading: 'Personal data we process',
        items: [
          'Identity data: the name you enter in the contact form.',
          'Contact data: the email address you enter in the contact form or send us by email.',
          'Request data: the content of your message (for example the design, product and quantity you are interested in).',
        ],
        paragraphs: ['The site has no membership, payment or account creation, so no data related to these is processed.'],
      },
      {
        heading: 'Purposes of processing',
        items: [
          'Receiving and answering your order and custom design requests,',
          'Carrying out the discussion, quotation and delivery steps of your request,',
          'Fulfilling our legal obligations.',
        ],
      },
      {
        heading: 'Collection method and legal basis',
        paragraphs: [
          'Your data is collected through the email prepared by the contact form on the site, or through emails and phone calls you send us directly.',
          'Your data is processed on the legal bases of KVKK Art. 5/2-c (it is directly related to the establishment or performance of a contract), Art. 5/2-ç (compliance with a legal obligation) and Art. 5/2-f (legitimate interests, provided your fundamental rights and freedoms are not harmed).',
        ],
      },
      {
        heading: 'Transfer of data',
        paragraphs: [
          'Your personal data is not sold to third parties or shared for marketing. It may be transferred only to email and hosting service providers, to the extent needed to provide the service, and to public bodies that are legally authorized to request it.',
        ],
      },
      {
        heading: 'Retention period',
        paragraphs: [
          'Your data is kept for as long as needed to complete your request and for the retention periods set by the relevant legislation; afterwards it is deleted, destroyed or anonymized.',
        ],
      },
      {
        heading: 'Your rights under KVKK Art. 11',
        items: [
          'To learn whether your personal data is processed,',
          'To request information if it has been processed,',
          'To learn the purpose of processing and whether it is used accordingly,',
          'To know the third parties to whom it is transferred, in Turkey or abroad,',
          'To request correction if it is incomplete or inaccurate,',
          'To request deletion or destruction under KVKK Art. 7,',
          'To request that corrections and deletions be notified to third parties to whom the data was transferred,',
          'To object to a result against you that arises from analysis exclusively by automated systems,',
          'To claim compensation if you suffer damage because your data was processed unlawfully.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          `You can send your requests about your rights in writing to ${siteConfig.contactEmail}. Your application is answered within thirty days at the latest, depending on the nature of the request.`,
        ],
      },
    ],
  },
  {
    id: 'privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'What information this site collects, how it is used and how it is protected.',
    sections: [
      {
        heading: 'Scope',
        paragraphs: [
          `This policy explains how your information is handled when you use the ${siteConfig.name} website. For details on the processing of personal data, see the KVKK Privacy Notice.`,
        ],
      },
      {
        heading: 'What information we collect',
        paragraphs: [
          'You do not need to provide any information to browse the site. Only if you use the contact form do you share the name, email address and message you write. The site has no membership, payment or account system.',
        ],
      },
      {
        heading: 'How the contact form works',
        paragraphs: [
          'Form details are not sent to the site\'s server. When you press "Send request", your email app opens with a prepared message and you send it yourself. Your details reach us only when you send that email.',
        ],
      },
      {
        heading: 'How we use your information',
        items: ['Answering your requests,', 'Carrying out order and custom design processes,', 'Fulfilling legal obligations.'],
        paragraphs: ['We do not use your information for advertising or profiling.'],
      },
      {
        heading: 'Sharing',
        paragraphs: [
          'We do not sell your information. We may share it, to the extent necessary, only with service providers such as email and hosting, and with legally authorized institutions.',
        ],
      },
      {
        heading: 'Security',
        paragraphs: [
          'We take reasonable technical and organizational measures to protect your information. Still, transmission over the internet cannot be guaranteed to be entirely risk-free.',
        ],
      },
      {
        heading: 'Changes and contact',
        paragraphs: [
          `This policy may be updated from time to time; the current version is always on this page. For questions, write to ${siteConfig.contactEmail}.`,
        ],
      },
    ],
  },
  {
    id: 'cookies',
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    summary: 'How cookies and similar technologies are used on this site.',
    sections: [
      {
        heading: 'What are cookies',
        paragraphs: [
          "Cookies and similar technologies (for example your browser's local storage) are small pieces of data stored on your device when you visit a site.",
        ],
      },
      {
        heading: 'What we use on this site',
        paragraphs: [
          "This site uses only one strictly necessary record: it writes a small value to your browser's local storage to remember that you closed the cookie notice. We do not use analytics, advertising or tracking cookies and we do not load third-party tracking tools.",
        ],
        table: {
          head: ['Name', 'Type', 'Purpose', 'Duration'],
          rows: [
            [CONSENT_STORAGE_KEY, 'Strictly necessary, first party (local storage)', 'To remember that you closed the cookie notice', 'Until you delete it'],
          ],
        },
      },
      {
        heading: 'Consent and future changes',
        paragraphs: [
          'No separate consent is requested for strictly necessary records. If we start using optional cookies such as analytics in the future, we will enable them only with your explicit consent and update this policy.',
        ],
      },
      {
        heading: 'How you can manage cookies',
        paragraphs: [
          'You can delete or block cookies and site data in your browser settings. If you delete the necessary record, the cookie notice is shown again; the other functions of the site are not affected.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`For questions, write to ${siteConfig.contactEmail}.`],
      },
    ],
  },
];
