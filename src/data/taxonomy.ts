// Taxonomy & Discover Page Configuration
// Defines the category hierarchy, hero banners, and browse grid for /discover pages.


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
    slug: 'ready-to-wear',
    label: 'Ready to Wear',
    image: '/image/bespoke-dress-1.png',
    productFilter: { kind: ['clothing'] },
    children: [
      { slug: 'dresses', label: 'Dresses', image: '/image/bespoke-dress-1.png', productFilter: { kind: ['clothing'], subcategory: 'dress' } },
      { slug: 'suits', label: 'Suits', image: '/image/bespoke-kaftan-milk-1.png', productFilter: { kind: ['clothing'], subcategory: 'suit' } },
      { slug: 'kaftan', label: 'Kaftan', image: '/image/bespoke-kaftan-brown-1.png', productFilter: { kind: ['clothing'], subcategory: 'kaftan' } },
      { slug: 'agbada', label: 'Agbada', image: '/image/bespoke-agbada-orange.webp', productFilter: { kind: ['clothing'], subcategory: 'agbada' } },
      { slug: 'ankara', label: 'Ankara', image: '/image/bespoke-ankara-1.png', productFilter: { kind: ['clothing'], subcategory: 'ankara' } },
    ],
  },
  {
    slug: 'custom',
    label: 'Custom',
    image: '/image/custom-outfit-1.webp',
    productFilter: { tags: ['CUSTOMIZABLE'] },
    children: [
      { slug: 'dresses', label: 'Dresses', image: '/image/bespoke-dress-1.png', productFilter: { subcategory: 'dress', tags: ['CUSTOMIZABLE'] } },
      { slug: 'kaftan', label: 'Kaftan', image: '/image/bespoke-kaftan-brown-1.png', productFilter: { subcategory: 'kaftan', tags: ['CUSTOMIZABLE'] } },
      { slug: 'agbada', label: 'Agbada', image: '/image/bespoke-agbada-orange.webp', productFilter: { subcategory: 'agbada', tags: ['CUSTOMIZABLE'] } },
      { slug: 'ankara', label: 'Ankara', image: '/image/bespoke-ankara-1.png', productFilter: { subcategory: 'ankara', tags: ['CUSTOMIZABLE'] } },
    ],
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    image: '/image/qlozet-bag.png',
    productFilter: { kind: ['accessory'] },
    children: [
      { slug: 'bags', label: 'Bags', productFilter: { subcategory: 'bags' } },
      { slug: 'belts', label: 'Belts', productFilter: { subcategory: 'belt' } },
      { slug: 'headwear', label: 'Headwear', productFilter: { subcategory: 'headwear' } },
      { slug: 'jewelry', label: 'Jewelry', productFilter: { subcategory: 'jewelry' } },
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
      { slug: 'linen', label: 'Linen', productFilter: { kind: ['fabric'], subcategory: 'linen' } },
      { slug: 'cotton', label: 'Cotton', productFilter: { kind: ['fabric'], subcategory: 'cotton' } },
      { slug: 'lace', label: 'Lace', productFilter: { kind: ['fabric'], subcategory: 'lace' } },
      { slug: 'adire-fabric', label: 'Adire', productFilter: { kind: ['fabric'], subcategory: 'adire' } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  HERO BANNERS (dynamic — each can point to any route)
// ═══════════════════════════════════════════════════════════════

export interface HeroBanner {
  label: string;
  description: string;
  image: string;
  href: string;
}

export const HERO_BANNERS: HeroBanner[] = [
  { label: 'FOR YOU', description: 'Curated picks based on your style preferences', image: '/image/bespoke-dress-1.png', href: '/discover/traditional' },
  { label: 'CORPORATE', description: 'Tailored suits, blouses & office-ready elegance', image: '/image/bespoke-kaftan-milk-1.png', href: '/discover/corporate' },
  { label: 'TRADITIONAL', description: 'Agbada, Kaftan, Ankara & heritage styles', image: '/image/bespoke-agbada-orange.webp', href: '/discover/traditional' },
];

// ═══════════════════════════════════════════════════════════════
//  BROWSE CATEGORIES GRID
// ═══════════════════════════════════════════════════════════════

export interface BrowseCategory {
  label: string;
  href: string;
  images: string[]; // 2-3 thumbnail images
  productIds?: string[]; // matching product IDs for each image
  color?: string;   // Optional accent
}

export const BROWSE_CATEGORIES: BrowseCategory[] = [
  { label: 'CLOTHING', href: '/discover/ready-to-wear', images: ['/image/bespoke-dress-1.png', '/image/bespoke-outfit-1.webp', '/image/bespoke-kaftan-brown-1.png'], productIds: ['prod_9', 'prod_11', 'prod_3'], color: '#3B3026' },
  { label: 'ACCESSORIES', href: '/discover/accessories', images: ['/image/qlozet-bag.png', '/image/bag.webp', '/image/bespoke-outfit-4.webp'], productIds: ['prod_7', 'prod_8', 'prod_27'], color: '#4A6741' },
  { label: 'FABRIC', href: '/discover/fabric', images: ['/image/fabric-1.jpg', '/image/ankara.png', '/image/fabric-swatch-1.jpg'], productIds: ['prod_6', 'prod_5', 'prod_21'], color: '#5B4A6B' },
  { label: 'DESIGNS', href: '/bespoke', images: ['/image/bespoke-dress-2.png', '/image/bespoke-ankara-1.png', '/image/bespoke-outfit-3.webp'], productIds: ['prod_16', 'prod_10', 'prod_12'], color: '#2E4A62' },
  { label: "WHAT'S NEW", href: '/discover/clothing', images: ['/image/bespoke-outfit-4.webp', '/image/pattern-bespoke-1.png', '/image/bespoke-ankara-2.png'], productIds: ['prod_27', 'prod_20', 'prod_19'], color: '#B04A4A' },
  { label: 'DISCOUNTS', href: '/discover/clothing', images: ['/image/bespoke-agbada-lime.webp', '/image/bag.webp', '/image/bespoke-kaftan-milk-1.png'], productIds: ['prod_2', 'prod_8', 'prod_4'], color: '#C48B3F' },
  { label: 'TOP RATED', href: '/discover/clothing', images: ['/image/bespoke-agbada-orange.webp', '/image/bespoke-kaftan-milk-1.png', '/image/bespoke-dress-1.png'], productIds: ['prod_1', 'prod_4', 'prod_9'], color: '#3A7A6A' },
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

