import type { Localized } from '../i18n/config';

export const productIds = ['tshirt', 'shirt', 'hoodie', 'shorts', 'cap', 'scarf', 'socks'] as const;

export type ProductId = (typeof productIds)[number];

export interface ProductOption {
  id: ProductId;
  label: Localized<string>;
  /** Size ids; 'one-size' is shown as "Standart" / "One size". */
  sizes: readonly string[];
}

export interface ColorOption {
  id: string;
  hex: string;
  name: Localized<string>;
}

export const ONE_SIZE = 'one-size';

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const products: readonly ProductOption[] = [
  { id: 'tshirt', label: { tr: 'Tişört', en: 'T-shirt' }, sizes: clothingSizes },
  { id: 'shirt', label: { tr: 'Gömlek', en: 'Shirt' }, sizes: clothingSizes },
  { id: 'hoodie', label: { tr: 'Hoodie', en: 'Hoodie' }, sizes: clothingSizes },
  { id: 'shorts', label: { tr: 'Şort', en: 'Shorts' }, sizes: clothingSizes },
  { id: 'cap', label: { tr: 'Şapka', en: 'Cap' }, sizes: [ONE_SIZE] },
  { id: 'scarf', label: { tr: 'Buf', en: 'Neck warmer' }, sizes: [ONE_SIZE] },
  { id: 'socks', label: { tr: 'Çorap', en: 'Socks' }, sizes: ['35-38', '39-42', '43-46'] },
];

export const colors: readonly ColorOption[] = [
  { id: 'black', hex: '#1b1b1f', name: { tr: 'Siyah', en: 'Black' } },
  { id: 'white', hex: '#ffffff', name: { tr: 'Beyaz', en: 'White' } },
  { id: 'cream', hex: '#f0e6d2', name: { tr: 'Krem', en: 'Cream' } },
  { id: 'grey', hex: '#9aa0a6', name: { tr: 'Gri', en: 'Grey' } },
  { id: 'navy', hex: '#1f3354', name: { tr: 'Lacivert', en: 'Navy' } },
  { id: 'red', hex: '#b3261e', name: { tr: 'Kırmızı', en: 'Red' } },
  { id: 'burgundy', hex: '#6d1f2f', name: { tr: 'Bordo', en: 'Burgundy' } },
  { id: 'green', hex: '#2f6b4f', name: { tr: 'Yeşil', en: 'Green' } },
  { id: 'mustard', hex: '#d9a21b', name: { tr: 'Hardal', en: 'Mustard' } },
  { id: 'pink', hex: '#e8a3b8', name: { tr: 'Pembe', en: 'Pink' } },
  { id: 'lilac', hex: '#b8a4e3', name: { tr: 'Lila', en: 'Lilac' } },
  { id: 'brown', hex: '#7a5238', name: { tr: 'Kahverengi', en: 'Brown' } },
];

export function getProduct(id: string): ProductOption | undefined {
  return products.find((product) => product.id === id);
}

export function isColor(id: string): boolean {
  return colors.some((color) => color.id === id);
}

export const PRINT_CUSTOM = 'custom';
export const DEFAULT_PRINT_PRESET = 'medium';
export const DEFAULT_PLACEMENT = 'center';

export type PrintPresetId = 'small' | 'medium' | 'large' | 'max';

export interface PrintPreset {
  id: PrintPresetId;
  widthCm: number;
  heightCm: number;
}

/** A named spot on the product the visitor can pick with one tap; x and y are the print's centre. */
export interface PlacementOption {
  id: string;
  label: Localized<string>;
  /** Percent of the product picture, left to right and top to bottom. */
  x: number;
  y: number;
}

export interface PrintZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PrintSpec {
  /** The most the studio can stitch on this product, in centimetres. */
  maxWidthCm: number;
  maxHeightCm: number;
  presets: readonly PrintPreset[];
  /** How much of the product picture one centimetre covers, in percent; drives the preview. */
  percentPerCm: number;
  /** Where on the picture a print may sit, in percent. */
  zone: PrintZone;
  positions: readonly PlacementOption[];
}

export const presetLabels: Record<PrintPresetId, { label: Localized<string>; hint: Localized<string> }> = {
  small: { label: { tr: 'Küçük', en: 'Small' }, hint: { tr: 'Küçük logo', en: 'Small logo' } },
  medium: { label: { tr: 'Orta', en: 'Medium' }, hint: { tr: 'Orta boy', en: 'Medium size' } },
  large: { label: { tr: 'Büyük', en: 'Large' }, hint: { tr: 'Geniş baskı', en: 'Wide print' } },
  max: { label: { tr: 'Maksimum', en: 'Maximum' }, hint: { tr: 'En büyük alan', en: 'Largest area' } },
};

const chest = (id: string, tr: string, en: string, x: number, y: number): PlacementOption => ({ id, label: { tr, en }, x, y });

const bodyPositions = [
  chest('center', 'Ortada', 'Centre', 50, 50),
  chest('left-chest', 'Sol göğüs', 'Left chest', 60, 38),
  chest('right-chest', 'Sağ göğüs', 'Right chest', 40, 38),
];

/** Print limits and placement rules per product, so a cap never gets a shirt-sized print. */
export const printSpecs: Record<ProductId, PrintSpec> = {
  tshirt: {
    maxWidthCm: 36,
    maxHeightCm: 20,
    presets: [
      { id: 'small', widthCm: 8, heightCm: 8 },
      { id: 'medium', widthCm: 15, heightCm: 12 },
      { id: 'large', widthCm: 25, heightCm: 18 },
      { id: 'max', widthCm: 36, heightCm: 20 },
    ],
    percentPerCm: 0.94,
    zone: { x: 30, y: 30, w: 40, h: 44 },
    positions: bodyPositions,
  },
  hoodie: {
    maxWidthCm: 36,
    maxHeightCm: 20,
    presets: [
      { id: 'small', widthCm: 8, heightCm: 8 },
      { id: 'medium', widthCm: 15, heightCm: 12 },
      { id: 'large', widthCm: 25, heightCm: 18 },
      { id: 'max', widthCm: 36, heightCm: 20 },
    ],
    percentPerCm: 0.9,
    zone: { x: 30, y: 38, w: 40, h: 36 },
    positions: [chest('center', 'Ortada', 'Centre', 50, 56), chest('left-chest', 'Sol göğüs', 'Left chest', 61, 46), chest('right-chest', 'Sağ göğüs', 'Right chest', 39, 46)],
  },
  shirt: {
    maxWidthCm: 12,
    maxHeightCm: 10,
    presets: [
      { id: 'small', widthCm: 5, heightCm: 5 },
      { id: 'medium', widthCm: 9, heightCm: 8 },
      { id: 'max', widthCm: 12, heightCm: 10 },
    ],
    percentPerCm: 0.95,
    zone: { x: 30, y: 34, w: 42, h: 42 },
    positions: [chest('left-chest', 'Sol göğüs', 'Left chest', 62, 44), chest('right-chest', 'Sağ göğüs', 'Right chest', 38, 44), chest('center', 'Ortada', 'Centre', 50, 56)],
  },
  shorts: {
    maxWidthCm: 12,
    maxHeightCm: 10,
    presets: [
      { id: 'small', widthCm: 5, heightCm: 5 },
      { id: 'medium', widthCm: 8, heightCm: 7 },
      { id: 'max', widthCm: 12, heightCm: 10 },
    ],
    percentPerCm: 1,
    zone: { x: 20, y: 28, w: 60, h: 36 },
    positions: [chest('left-leg', 'Sol bacak', 'Left leg', 66, 46), chest('right-leg', 'Sağ bacak', 'Right leg', 34, 46), chest('center', 'Ortada', 'Centre', 50, 46)],
  },
  cap: {
    maxWidthCm: 10,
    maxHeightCm: 6,
    presets: [
      { id: 'small', widthCm: 4, heightCm: 3 },
      { id: 'medium', widthCm: 7, heightCm: 5 },
      { id: 'max', widthCm: 10, heightCm: 6 },
    ],
    percentPerCm: 4,
    zone: { x: 24, y: 30, w: 52, h: 36 },
    positions: [chest('center', 'Önde', 'Front', 50, 48), chest('left-side', 'Sol yan', 'Left side', 66, 52), chest('right-side', 'Sağ yan', 'Right side', 34, 52)],
  },
  scarf: {
    maxWidthCm: 14,
    maxHeightCm: 8,
    presets: [
      { id: 'small', widthCm: 6, heightCm: 4 },
      { id: 'medium', widthCm: 10, heightCm: 6 },
      { id: 'max', widthCm: 14, heightCm: 8 },
    ],
    percentPerCm: 1.9,
    zone: { x: 33, y: 22, w: 34, h: 60 },
    positions: [chest('top', 'Üstte', 'Top', 50, 34), chest('center', 'Ortada', 'Centre', 50, 52), chest('bottom', 'Altta', 'Bottom', 50, 72)],
  },
  socks: {
    maxWidthCm: 6,
    maxHeightCm: 8,
    presets: [
      { id: 'small', widthCm: 3, heightCm: 3 },
      { id: 'medium', widthCm: 4, heightCm: 5 },
      { id: 'max', widthCm: 6, heightCm: 8 },
    ],
    percentPerCm: 2.8,
    zone: { x: 34, y: 22, w: 30, h: 56 },
    positions: [chest('top', 'Üstte', 'Top', 46, 36), chest('center', 'Ortada', 'Centre', 46, 52), chest('bottom', 'Altta', 'Bottom', 46, 68)],
  },
};

export function getPrintSpec(product: string): PrintSpec | undefined {
  return (printSpecs as Record<string, PrintSpec | undefined>)[product];
}

export function getPrintPreset(product: string, id: string): PrintPreset | undefined {
  return getPrintSpec(product)?.presets.find((preset) => preset.id === id);
}

export function getPlacement(product: string, id: string): PlacementOption | undefined {
  return getPrintSpec(product)?.positions.find((position) => position.id === id);
}
