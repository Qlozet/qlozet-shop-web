// Taxonomy & Discover Page Configuration
// Defines the category hierarchy, hero banners, and browse grid for /discover pages.

import { type Product, productCatalog } from './products';

// ═══════════════════════════════════════════════════════════════
//  TAXONOMY TREE
// ═══════════════════════════════════════════════════════════════

export interface TaxonomyNode {
  slug: string;
  label: string;
  image?: string;
  children?: TaxonomyNode[];
  productFilter?: {
    kind?: string[];
    collection?: string;
    subcategory?: string;
    tags?: string[];
    brands?: string[];
  };
  filterChips?: string[]; // Product type chips at deepest level
}

export const TAXONOMY: TaxonomyNode[] = [
  {
    slug: 'traditional',
    label: 'Traditional',
    image: '/image/bespoke-agbada-orange.webp',
    productFilter: { collection: 'traditional' },
    children: [
      {
        slug: 'ankara',
        label: 'Ankara',
        image: '/image/bespoke-dress-1.png',
        productFilter: { subcategory: 'ankara' },
        filterChips: ['Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Sets', 'Jackets/Blazers'],
        children: [
          { slug: 'bakatari', label: 'Bakatari', productFilter: { subcategory: 'ankara', tags: ['CUSTOMIZABLE'] }, filterChips: ['Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Rompers', 'Jackets/Blazers', 'Sets'] },
          { slug: 'trad-wear', label: 'Trad Wear', productFilter: { subcategory: 'ankara' }, filterChips: ['Dresses', 'Tops', 'Sets'] },
          { slug: 'iro-and-buba', label: 'Iro and Buba', productFilter: { subcategory: 'iro-and-buba' }, filterChips: ['Sets', 'Tops', 'Skirts'] },
        ],
      },
      {
        slug: 'kaftan',
        label: 'Kaftan',
        image: '/image/bespoke-kaftan-brown-1.png',
        productFilter: { subcategory: 'kaftan' },
        filterChips: ['Sets', 'Tops'],
      },
      {
        slug: 'agbada',
        label: 'Agbada',
        image: '/image/bespoke-agbada-orange.webp',
        productFilter: { subcategory: 'agbada' },
        filterChips: ['Sets'],
      },
      {
        slug: 'aso-oke',
        label: 'Aso-Oke',
        image: '/image/fabric-swatch-1.jpg',
        productFilter: { subcategory: 'aso-oke' },
      },
      {
        slug: 'adire',
        label: 'Adire',
        image: '/image/fabric-swatch-3.jpg',
        productFilter: { subcategory: 'adire' },
      },
    ],
  },
  {
    slug: 'corporate',
    label: 'Corporate',
    image: '/image/bespoke-kaftan-milk-1.png',
    productFilter: { collection: 'corporate' },
    children: [
      { slug: 'suits', label: 'Suits', productFilter: { subcategory: 'suits' }, filterChips: ['Sets'] },
      { slug: 'dresses', label: 'Dresses', productFilter: { collection: 'corporate', subcategory: 'dresses' }, filterChips: ['Dresses'] },
      { slug: 'blouses', label: 'Blouses', productFilter: { collection: 'corporate', subcategory: 'blouses' }, filterChips: ['Tops'] },
    ],
  },
  {
    slug: 'streetwear',
    label: 'Streetwear',
    image: '/image/bespoke-ankara-2.png',
    productFilter: { collection: 'streetwear' },
    children: [
      { slug: 'jackets', label: 'Jackets', productFilter: { subcategory: 'jackets' }, filterChips: ['Jackets/Blazers'] },
      { slug: 'tees', label: 'Tees', productFilter: { subcategory: 'tees' }, filterChips: ['Tops'] },
    ],
  },
  {
    slug: 'clothing',
    label: 'Clothing',
    image: '/image/bespoke-dress-1.png',
    productFilter: { kind: ['clothing'] },
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    image: '/image/qlozet-bag.png',
    productFilter: { kind: ['accessory'] },
    children: [
      { slug: 'bags', label: 'Bags', productFilter: { subcategory: 'bags' } },
      { slug: 'jewelry', label: 'Jewelry', productFilter: { subcategory: 'jewelry' } },
      { slug: 'headwraps', label: 'Headwraps', productFilter: { subcategory: 'headwraps' } },
      { slug: 'shoes', label: 'Shoes', productFilter: { subcategory: 'shoes' } },
    ],
  },
  {
    slug: 'fabric',
    label: 'Fabric',
    image: '/image/fabric-1.jpg',
    productFilter: { kind: ['fabric'] },
    children: [
      { slug: 'ankara-fabric', label: 'Ankara', productFilter: { kind: ['fabric'], subcategory: 'ankara' } },
      { slug: 'lace', label: 'Lace', productFilter: { subcategory: 'lace' } },
      { slug: 'aso-oke-fabric', label: 'Aso-Oke', productFilter: { subcategory: 'aso-oke' } },
      { slug: 'adire-fabric', label: 'Adire', productFilter: { subcategory: 'adire' } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  HERO BANNERS (dynamic — each can point to any route)
// ═══════════════════════════════════════════════════════════════

export interface HeroBanner {
  label: string;
  image: string;
  href: string;
}

export const HERO_BANNERS: HeroBanner[] = [
  { label: 'FOR YOU', image: '/image/bespoke-dress-1.png', href: '/discover/traditional' },
  { label: 'CORPORATE', image: '/image/bespoke-kaftan-milk-1.png', href: '/discover/corporate' },
  { label: 'TRADITIONAL', image: '/image/bespoke-agbada-orange.webp', href: '/discover/traditional' },
];

// ═══════════════════════════════════════════════════════════════
//  BROWSE CATEGORIES GRID
// ═══════════════════════════════════════════════════════════════

export interface BrowseCategory {
  label: string;
  href: string;
  images: string[]; // 2-3 thumbnail images
  color?: string;   // Optional accent
}

export const BROWSE_CATEGORIES: BrowseCategory[] = [
  { label: 'CLOTHING', href: '/discover/clothing', images: ['/image/bespoke-dress-1.png', '/image/bespoke-outfit-1.webp', '/image/bespoke-kaftan-brown-1.png'], color: '#3B3026' },
  { label: 'ACCESSORIES', href: '/discover/accessories', images: ['/image/qlozet-bag.png', '/image/bag.webp'], color: '#4A6741' },
  { label: 'FABRIC', href: '/discover/fabric', images: ['/image/fabric-1.jpg', '/image/ankara.png', '/image/fabric-swatch-1.jpg'], color: '#5B4A6B' },
  { label: 'DESIGNS', href: '/bespoke', images: ['/image/bespoke-dress-2.png', '/image/bespoke-ankara-1.png', '/image/bespoke-outfit-3.webp'], color: '#2E4A62' },
  { label: "WHAT'S NEW", href: '/discover/clothing', images: ['/image/bespoke-outfit-4.webp', '/image/pattern-bespoke-1.png'], color: '#B04A4A' },
  { label: 'DISCOUNTS', href: '/discover/clothing', images: ['/image/bespoke-agbada-lime.webp', '/image/bag.webp'], color: '#C48B3F' },
  { label: 'TOP RATED', href: '/discover/clothing', images: ['/image/bespoke-agbada-orange.webp', '/image/bespoke-kaftan-milk-1.png'], color: '#3A7A6A' },
  { label: 'VENDORS', href: '/vendor/vendor_1', images: ['/image/icon1.jpg', '/image/icon2.jpg', '/image/icon3.jpg'], color: '#6B5B4A' },
];

// ═══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Walk the taxonomy tree to resolve a slug path like ['traditional', 'ankara', 'bakatari'] */
export function resolveSlug(slugParts: string[]): { nodes: TaxonomyNode[]; current: TaxonomyNode | null } {
  const trail: TaxonomyNode[] = [];
  let children = TAXONOMY;

  for (const part of slugParts) {
    const found = children.find((n) => n.slug === part);
    if (!found) return { nodes: trail, current: null };
    trail.push(found);
    children = found.children || [];
  }

  return { nodes: trail, current: trail[trail.length - 1] || null };
}

/** Build breadcrumb items from a slug path */
export function buildBreadcrumbs(slugParts: string[]): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: 'Explore', href: '/discover' }];
  const { nodes } = resolveSlug(slugParts);

  nodes.forEach((node, i) => {
    const path = slugParts.slice(0, i + 1).join('/');
    crumbs.push({ label: node.label, href: `/discover/${path}` });
  });

  return crumbs;
}

/** Get filtered products for a taxonomy node */
export function getProductsForNode(node: TaxonomyNode | null): Product[] {
  if (!node?.productFilter) return productCatalog;

  const f = node.productFilter;
  return productCatalog.filter((p) => {
    if (f.kind && !f.kind.includes(p.kind)) return false;
    if (f.collection && p.collection !== f.collection) return false;
    if (f.subcategory && p.subcategory !== f.subcategory) return false;
    if (f.tags && f.tags.length > 0 && !f.tags.includes(p.tag)) return false;
    if (f.brands && f.brands.length > 0 && !f.brands.includes(p.brand)) return false;
    return true;
  });
}

/** Get products sorted by rating (top rated) */
export function getTopRated(products: Product[], limit = 8): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/** Get products sorted by reviews (trending) */
export function getTrending(products: Product[], limit = 8): Product[] {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

/** Get newest products (ones with NEW tag, or fallback to shuffled) */
export function getWhatsNew(products: Product[], limit = 8): Product[] {
  const newOnes = products.filter((p) => p.tag === 'NEW');
  if (newOnes.length >= limit) return newOnes.slice(0, limit);
  // Fill with remaining products shuffled
  const remaining = products.filter((p) => p.tag !== 'NEW');
  return [...newOnes, ...remaining].slice(0, limit);
}
