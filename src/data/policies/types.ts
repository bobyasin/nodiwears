export interface PolicyTable {
  head: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface PolicySection {
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  table?: PolicyTable;
}

export interface Policy {
  id: 'kvkk' | 'privacy' | 'cookies';
  slug: string;
  title: string;
  summary: string;
  sections: readonly PolicySection[];
}
