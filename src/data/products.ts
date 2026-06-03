// Product Types & Catalog Data
// Single source of truth for all product information across the app.

export type ProductKind = 'clothing' | 'fabric' | 'accessory';

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  kind: ProductKind;
  rating: number;
  reviews: number;
  brand: string;
  tag: string;
  desc: string;
  details: string[];
  sizes: string[];
  colors: string[];
  colorHexMap: Record<string, string>;
  gallery: string[];
}

export const productCatalog: Product[] = [
  {
    id: 'prod_1',
    title: 'Agbada bespoke orange',
    price: 180000,
    image: '/image/bespoke-agbada-orange.webp',
    kind: 'clothing',
    rating: 4.9,
    reviews: 512,
    brand: 'AFRICANA COUTURE',
    tag: 'CUSTOMIZABLE',
    desc: 'An exquisite hand-embroidered Agbada crafted with premium Nigerian cashmere and authentic silk threads. This bespoke garment features intricate geometrical tribal embroidery along the chest plates and neck, offering an exceptional luxury appearance for traditional occasions.',
    details: ['100% Cashmere Cotton Blend', 'Intricate hand-stitched detailing', 'Tailored to custom fit profile', 'Dry clean only'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Orange', 'Wine', 'Black'],
    colorHexMap: { 'Orange': '#D4752A', 'Wine': '#722F37', 'Black': '#1A1A1A' },
    gallery: [
      '/image/bespoke-agbada-orange.webp',
      '/image/orange-bespoke-1.png',
      '/image/orange-bespoke-2.png',
      '/image/orange-bespoke-3.png',
    ],
  },
  {
    id: 'prod_2',
    title: 'Bespoke agbada lime',
    price: 185000,
    image: '/image/bespoke-agbada-lime.webp',
    kind: 'clothing',
    rating: 4.8,
    reviews: 420,
    brand: 'GARM ISLAND',
    tag: 'CUSTOMIZABLE',
    desc: 'Bring a striking modern aesthetic to traditional lines. This rich lime green agbada is tailored with luxury light crepe fabric, offering unmatched flexibility and breathability in warm climates. Features bespoke metallic gold threadings.',
    details: ['Premium Crepe Silk Blend', 'Highly breathable under high temperatures', 'Custom body-masking configurations supported', 'Handmade in Lagos, Nigeria'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Lime Green', 'Royal Blue', 'Emerald'],
    colorHexMap: { 'Lime Green': '#7CBF3F', 'Royal Blue': '#2D3FA8', 'Emerald': '#2E8B57' },
    gallery: [
      '/image/bespoke-agbada-lime.webp',
      '/image/blue-bespoke-1.png',
      '/image/blue-bespoke-2.png',
      '/image/blue-bespoke-3.png',
    ],
  },
  {
    id: 'prod_3',
    title: 'Chocolate Silk Kaftan',
    price: 120000,
    image: '/image/bespoke-kaftan-brown-1.png',
    kind: 'clothing',
    rating: 4.7,
    reviews: 310,
    brand: 'EJIRO AMOS TAFIRI',
    tag: 'CUSTOMIZABLE',
    desc: 'An understated luxury masterpiece. This double-layered chocolate silk kaftan sits comfortably as a premium loungewear or high-fashion corporate fit. Cut in a modern relaxed silhouette with clean shoulder stitchings.',
    details: ['Pure Mulberry Silk', 'Ultra smooth finish against skin', 'Side slit detailing', 'Features signature double-collar'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Chocolate Brown', 'Cream Milk', 'Caramel'],
    colorHexMap: { 'Chocolate Brown': '#3E2723', 'Cream Milk': '#F5F0E8', 'Caramel': '#C68E4E' },
    gallery: [
      '/image/bespoke-kaftan-brown-1.png',
      '/image/bespoke-kaftan-brown-2.png',
      '/image/bespoke-kaftan-brown-3.png',
      '/image/bespoke-kaftan-brown-4.png',
      '/image/bespoke-kaftan-brown-5.png',
    ],
  },
  {
    id: 'prod_4',
    title: 'Milk Crepe Kaftan',
    price: 115000,
    image: '/image/bespoke-kaftan-milk-1.png',
    kind: 'clothing',
    rating: 4.6,
    reviews: 185,
    brand: 'FRUCHÉ',
    tag: 'CUSTOMIZABLE',
    desc: 'Designed with a high focus on draping. This milk crepe kaftan utilizes structured heavy-weight fabrics that flow smoothly over the shoulders, establishing a highly elegant corporate silhouette. Perfectly matches gold accessories.',
    details: ['Heavy-Weight Crepe Fabric', 'High crease resistance', 'Concealed front placket', 'Ethically sourced threads'],
    sizes: ['S', 'M', 'L'],
    colors: ['Cream Milk', 'Olive Green', 'Deep Cocoa'],
    colorHexMap: { 'Cream Milk': '#F5F0E8', 'Olive Green': '#556B2F', 'Deep Cocoa': '#3E2723' },
    gallery: [
      '/image/bespoke-kaftan-milk-1.png',
      '/image/bespoke-kaftan-milk-2.png',
      '/image/bespoke-kaftan-milk-3.png',
      '/image/bespoke-kaftan-milk-4.png',
      '/image/bespoke-kaftan-milk-5.png',
    ],
  },
  {
    id: 'prod_5',
    title: 'Ankara Premium Textile',
    price: 45000,
    image: '/image/ankara.png',
    kind: 'fabric',
    rating: 4.5,
    reviews: 198,
    brand: 'POPWAVE TEXTILES',
    tag: 'FABRIC YARD',
    desc: 'A premium 100% combed cotton Ankara wax print. Highly popular for bespoke tailoring, this fabric features dynamic geometric tribal patterns colored in deep rust orange, obsidian black, and gold. Extremely soft texture with lasting color saturation.',
    details: ['6 Yards length per bundle', '115 cm width', '100% Combed Cotton Wax', 'Machine washable'],
    sizes: ['6 Yards', '12 Yards'],
    colors: ['Rust Orange Pattern', 'Teal Wave Pattern'],
    colorHexMap: { 'Rust Orange Pattern': '#C75B12', 'Teal Wave Pattern': '#2A8A8A' },
    gallery: [
      '/image/ankara.png',
      '/image/fabric-swatch-1.jpg',
      '/image/fabric-swatch-3.jpg',
    ],
  },
  {
    id: 'prod_6',
    title: 'Golden Brocade Lace',
    price: 75000,
    image: '/image/fabric-1.jpg',
    kind: 'fabric',
    rating: 4.8,
    reviews: 144,
    brand: 'AFRICANA FABRICS',
    tag: 'FABRIC YARD',
    desc: 'A luxury golden brocade lace fabric. Features raised metallic threading weaves representing elegant floral lattices. Ideal for designing statement bespoke gowns, agbada trims, or luxury traditional caps.',
    details: ['5 Yards length per bundle', 'Heavy metallic threading raised weave', 'Luxury floral lattice pattern', 'Delicate - Hand wash or Dry clean'],
    sizes: ['5 Yards'],
    colors: ['Metallic Gold', 'Silver Lattice'],
    colorHexMap: { 'Metallic Gold': '#C9A63A', 'Silver Lattice': '#A8A9AD' },
    gallery: [
      '/image/fabric-1.jpg',
      '/image/fabric-swatch-1.jpg',
      '/image/fabric-swatch-2.jpg',
    ],
  },
  {
    id: 'prod_7',
    title: 'Midnight Leather Totebag',
    price: 95000,
    image: '/image/qlozet-bag.png',
    kind: 'accessory',
    rating: 4.9,
    reviews: 340,
    brand: 'QLOZET ACCESSORIES',
    tag: 'ACCESSORY',
    desc: 'A structured minimalist leather totebag. Engineered with genuine full-grain pebble leather. Features a spacious microfiber-lined interior, matching brass zippers, and dual hand-sewn shoulder loops. Perfect companion for both formal and informal styles.',
    details: ['Genuine Full-Grain Pebble Leather', 'Brass metallic hardware', 'Interior zip pockets', 'Dimensions: 36 x 28 x 14 cm'],
    sizes: ['Standard Size'],
    colors: ['Midnight Black', 'Forest Green', 'Tan Brown'],
    colorHexMap: { 'Midnight Black': '#1A1A1A', 'Forest Green': '#2E5A3C', 'Tan Brown': '#C19A6B' },
    gallery: [
      '/image/qlozet-bag.png',
      '/image/totebag.png',
      '/image/leather.jpg',
    ],
  },
  {
    id: 'prod_8',
    title: 'Suede Shoulder Clutch',
    price: 65000,
    image: '/image/bag.webp',
    kind: 'accessory',
    rating: 4.4,
    reviews: 96,
    brand: 'EB ACCESSORIES',
    tag: 'ACCESSORY',
    desc: 'An elegant hand-held suede envelope clutch. Soft tactile suede finish with a metallic brass clasp. Includes a detachable thin gold chain loop to switch easily into a shoulder bag.',
    details: ['Genuine tactile Suede exterior', 'Envelope clasp closure', 'Detachable gold chain shoulder loop', 'Dimensions: 24 x 16 x 5 cm'],
    sizes: ['One Size'],
    colors: ['Burgundy', 'Forest Green', 'Charcoal Gray'],
    colorHexMap: { 'Burgundy': '#800020', 'Forest Green': '#2E5A3C', 'Charcoal Gray': '#4A4A4A' },
    gallery: [
      '/image/bag.webp',
      '/image/leather.jpg',
      '/image/fabric-swatch-2.jpg',
    ],
  },
];
