// Vendor Types & Data
// Maps existing product brands to vendor entities for the home feed.

export interface VendorPromotion {
  title: string;
  subtitle: string;
  color: string; // background color
}

export interface Vendor {
  id: string;
  name: string;
  logoInitials: string;
  logoStyle: 'initials' | 'image';
  logoImage?: string;
  followers: number;
  rating: number;
  reviewCount: number;
  productIds: string[];
  category: 'clothing' | 'accessories' | 'fabric' | 'custom_made';
  description: string;
  heroImage: string;
  successRate: number;
  totalItemsSold: number;
  collections: string[];
  promotions: VendorPromotion[];
  promo?: {
    label: string;
    condition: string;
  };
  themeColor?: string; // dynamic accent color
  socialLinks?: {
    instagram?: string;
    pinterest?: string;
    youtube?: string;
    website?: string;
    email?: string;
    address?: string;
  };
  policies?: {
    privacy?: string;
    refund?: string;
    shipping?: string;
  };
}

export const vendorCatalog: Vendor[] = [
  // ─── CUSTOM MADE ────────────────────────────────────────────────
  {
    id: 'vendor_1',
    name: 'AFRICANA COUTURE',
    logoInitials: 'PV',
    logoStyle: 'image',
    logoImage: '/image/icon1.jpg',
    followers: 2340,
    rating: 4.4,
    reviewCount: 500,
    productIds: ['prod_1'],
    category: 'custom_made',
    description: 'Luxury bespoke traditional wear. Specializing in hand-embroidered agbadas, kaftans, and senator styles crafted with premium fabrics.',
    heroImage: '/image/bespoke-agbada-orange.webp',
    successRate: 98,
    totalItemsSold: 149,
    collections: ['Agbada', 'Senator', 'Kaftan', 'Buba & Sokoto', 'Caps'],
    promotions: [
      { title: 'Free shipping on orders over ₦75,000 when you pay with PayPal!', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
      { title: 'Save ₦10,000 on orders over ₦150,000', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
      { title: 'Get 15% off every month with our VIP subscription!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
    ],
    promo: {
      label: 'Get 20% off',
      condition: 'on orders over ₦50,000',
    },
    themeColor: '#D97706', // Amber/Orange
    socialLinks: {
      instagram: '@africanacouture',
      pinterest: 'africanacouture',
      youtube: 'Africana Couture NG',
      website: 'africanacouture.com',
      email: 'help@africanacouture.com',
      address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    },
    policies: {
      privacy: 'View privacy policy',
      refund: 'View refund policy',
      shipping: 'View shipping policy',
    },
  },
  {
    id: 'vendor_2',
    name: 'GARM ISLAND',
    logoInitials: 'GI',
    logoStyle: 'image',
    logoImage: '/image/icon2.jpg',
    followers: 1890,
    rating: 4.6,
    reviewCount: 420,
    productIds: ['prod_2'],
    category: 'custom_made',
    description: 'Contemporary African menswear. Bold colours and modern cuts that blend Nigerian heritage with streetwear culture.',
    heroImage: '/image/agbada-lime.webp',
    successRate: 96,
    totalItemsSold: 203,
    collections: ['Agbada', 'Casual Wear', 'Event Wear', 'Accessories'],
    promotions: [
      { title: 'Flash Sale: 30% off for the next 3 hours!', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
      { title: 'Buy 3, get ₦65,000 off selected items', subtitle: 'Automatically applied in cart', color: '#6B7280' },
    ],
    themeColor: '#65A30D', // Lime Green
  },
  {
    id: 'vendor_9',
    name: 'KENTE KINGS',
    logoInitials: 'KK',
    logoStyle: 'image',
    logoImage: '/image/icon8.jpg',
    followers: 3210,
    rating: 4.5,
    reviewCount: 380,
    productIds: ['prod_3'],
    category: 'custom_made',
    description: 'Authentic Kente-inspired designs for the modern African man. Handwoven patterns meet contemporary tailoring.',
    heroImage: '/image/kente-outfit.webp',
    successRate: 94,
    totalItemsSold: 178,
    collections: ['Kente Wear', 'Traditional', 'Modern Fusion', 'Accessories'],
    promotions: [
      { title: 'Save ₦15,000 on orders over ₦80,000', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
    ],
    promo: {
      label: 'Save ₦15,000',
      condition: 'on orders over ₦80,000',
    },
  },
  {
    id: 'vendor_10',
    name: 'ADIRE COLLECTIVE',
    logoInitials: 'AC',
    logoStyle: 'image',
    logoImage: '/image/icon9.jpg',
    followers: 1560,
    rating: 4.3,
    reviewCount: 215,
    productIds: ['prod_4'],
    category: 'custom_made',
    description: 'Hand-dyed Adire textiles reimagined into wearable art. Each piece tells a story through indigo and beyond.',
    heroImage: '/image/adire-outfit.webp',
    successRate: 92,
    totalItemsSold: 95,
    collections: ['Adire', 'Indigo Collection', 'Modern Cuts'],
    promotions: [],
    themeColor: '#FFFFFF', // White/Light theme
  },
  {
    id: 'vendor_11',
    name: 'LAGOS TAILORS',
    logoInitials: 'LT',
    logoStyle: 'image',
    logoImage: '/image/icon10.jpg',
    followers: 4780,
    rating: 4.7,
    reviewCount: 620,
    productIds: ['prod_1', 'prod_2'],
    category: 'custom_made',
    description: 'Premium bespoke tailoring from the heart of Lagos. From traditional agbadas to modern suits, perfection in every stitch.',
    heroImage: '/image/bespoke-agbada-orange.webp',
    successRate: 99,
    totalItemsSold: 412,
    collections: ['Agbada', 'Suits', 'Kaftan', 'Senator', 'Buba & Sokoto'],
    promotions: [
      { title: 'Free alterations on all orders!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
      { title: 'Save ₦20,000 on orders over ₦200,000', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
    ],
  },

  // ─── CLOTHING (READY TO WEAR) ──────────────────────────────────
  {
    id: 'vendor_3',
    name: 'EJIRO AMOS TAFIRI',
    logoInitials: 'EA',
    logoStyle: 'image',
    logoImage: '/image/icon3.jpg',
    followers: 5120,
    rating: 4.8,
    reviewCount: 810,
    productIds: ['prod_3'],
    category: 'clothing',
    description: 'High-fashion ready-to-wear celebrating African femininity. Bold prints, sculptural silhouettes, and runway-quality craftsmanship.',
    heroImage: '/image/kente-outfit.webp',
    successRate: 97,
    totalItemsSold: 534,
    collections: ['Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Sets'],
    promotions: [
      { title: 'Save ₦10,000 on orders over ₦100,000', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
      { title: 'Get 15% off every month with VIP!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
    ],
    promo: {
      label: 'Save ₦10,000',
      condition: 'on orders over ₦100,000',
    },
    themeColor: '#9333EA', // Purple
  },
  {
    id: 'vendor_4',
    name: 'FRUCHÉ',
    logoInitials: 'FR',
    logoStyle: 'image',
    logoImage: '/image/icon4.jpg',
    followers: 3670,
    rating: 4.5,
    reviewCount: 290,
    productIds: ['prod_4'],
    category: 'clothing',
    description: 'Avant-garde Nigerian fashion. Pushing boundaries with experimental cuts, textures, and a fearless approach to African design.',
    heroImage: '/image/adire-outfit.webp',
    successRate: 95,
    totalItemsSold: 187,
    collections: ['Dresses', 'Outerwear', 'Tops', 'Bottoms'],
    promotions: [],
  },
  {
    id: 'vendor_12',
    name: 'WOVEN THREADS',
    logoInitials: 'WT',
    logoStyle: 'image',
    logoImage: '/image/icon11.jpg',
    followers: 2890,
    rating: 4.4,
    reviewCount: 345,
    productIds: ['prod_1'],
    category: 'clothing',
    description: 'Artisan woven fabrics transformed into everyday luxury. Tradition meets modern comfort.',
    heroImage: '/image/bespoke-agbada-orange.webp',
    successRate: 93,
    totalItemsSold: 210,
    collections: ['Tops', 'Dresses', 'Rompers', 'Jackets/Blazers'],
    promotions: [
      { title: 'Flash Sale: 25% off all tops!', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
    ],
  },
  {
    id: 'vendor_13',
    name: 'STYLE BUREAU',
    logoInitials: 'SB',
    logoStyle: 'image',
    logoImage: '/image/icon12.jpg',
    followers: 1340,
    rating: 4.2,
    reviewCount: 178,
    productIds: ['prod_2'],
    category: 'clothing',
    description: 'Curated contemporary fashion for the modern Nigerian woman. Clean lines, premium fabrics, effortless elegance.',
    heroImage: '/image/agbada-lime.webp',
    successRate: 91,
    totalItemsSold: 124,
    collections: ['Dresses', 'Tops', 'Bottoms', 'Sets'],
    promotions: [
      { title: 'Get 15% off your first order!', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
    ],
    promo: {
      label: 'Get 15% off',
      condition: 'on first order',
    },
  },
  {
    id: 'vendor_14',
    name: 'NAIJA DRIP',
    logoInitials: 'ND',
    logoStyle: 'image',
    logoImage: '/image/icon13.jpg',
    followers: 6100,
    rating: 4.6,
    reviewCount: 750,
    productIds: ['prod_3', 'prod_4'],
    category: 'clothing',
    description: 'Streetwear with a Nigerian soul. Bold graphics, vibrant Ankara-infused designs, and unmistakable Lagos energy.',
    heroImage: '/image/kente-outfit.webp',
    successRate: 96,
    totalItemsSold: 489,
    collections: ['Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Rompers', 'Sets'],
    promotions: [
      { title: 'Buy 2 get 1 free on all tops!', subtitle: 'Automatically applied in cart', color: '#065F46' },
      { title: 'Flash Sale: 30% off for the next 3 hours!', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
      { title: 'Free shipping on all orders over ₦50,000', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
    ],
  },

  // ─── ACCESSORIES ────────────────────────────────────────────────
  {
    id: 'vendor_5',
    name: 'EB ACCESSORIES',
    logoInitials: 'EB',
    logoStyle: 'initials',
    followers: 1450,
    rating: 4.3,
    reviewCount: 195,
    productIds: ['prod_7', 'prod_8'],
    category: 'accessories',
    description: 'Handcrafted accessories that complete every outfit. From statement necklaces to elegant clutches.',
    heroImage: '/image/accessory-cap.webp',
    successRate: 90,
    totalItemsSold: 112,
    collections: ['Necklaces', 'Bracelets', 'Clutches', 'Caps'],
    promotions: [],
  },
  {
    id: 'vendor_6',
    name: 'QLOZET ACCESSORIES',
    logoInitials: 'QA',
    logoStyle: 'image',
    logoImage: '/image/icon5.jpg',
    followers: 4210,
    rating: 4.7,
    reviewCount: 640,
    productIds: ['prod_7'],
    category: 'accessories',
    description: 'Premium curated accessories by Qlozet. Traditional fila caps, modern clutches, and jewelry for every occasion.',
    heroImage: '/image/accessory-cap.webp',
    successRate: 97,
    totalItemsSold: 380,
    collections: ['Caps', 'Jewelry', 'Bags', 'Shoes'],
    promotions: [
      { title: 'Get 20% off on orders over ₦50,000', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
      { title: 'Free gift wrapping on all orders!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
    ],
    promo: {
      label: 'Get 20% off',
      condition: 'on orders over ₦50,000',
    },
  },
  {
    id: 'vendor_15',
    name: 'LUXE CRAFT',
    logoInitials: 'LC',
    logoStyle: 'image',
    logoImage: '/image/icon14.jpg',
    followers: 2750,
    rating: 4.5,
    reviewCount: 410,
    productIds: ['prod_8'],
    category: 'accessories',
    description: 'Luxury leather goods and accessories. Each piece is hand-stitched for timeless sophistication.',
    heroImage: '/image/accessory-cap.webp',
    successRate: 95,
    totalItemsSold: 245,
    collections: ['Bags', 'Belts', 'Wallets', 'Shoes'],
    promotions: [
      { title: 'Save ₦5,000 on orders over ₦30,000', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
    ],
    promo: {
      label: 'Save ₦5,000',
      condition: 'on orders over ₦30,000',
    },
  },
  {
    id: 'vendor_16',
    name: 'HERITAGE LEATHER',
    logoInitials: 'HL',
    logoStyle: 'image',
    logoImage: '/image/icon15.jpg',
    followers: 980,
    rating: 4.1,
    reviewCount: 132,
    productIds: ['prod_7'],
    category: 'accessories',
    description: 'Heritage-quality leather accessories rooted in Nigerian craftsmanship. Bags, sandals, and belts built to last.',
    heroImage: '/image/accessory-cap.webp',
    successRate: 89,
    totalItemsSold: 78,
    collections: ['Bags', 'Sandals', 'Belts'],
    promotions: [],
  },
  {
    id: 'vendor_17',
    name: 'ABUJA GEMS',
    logoInitials: 'AG',
    logoStyle: 'image',
    logoImage: '/image/icon16.jpg',
    followers: 3400,
    rating: 4.6,
    reviewCount: 520,
    productIds: ['prod_8', 'prod_7'],
    category: 'accessories',
    description: 'Exquisite gemstone jewelry and premium accessories from the capital city. Elegance redefined.',
    heroImage: '/image/accessory-cap.webp',
    successRate: 96,
    totalItemsSold: 312,
    collections: ['Rings', 'Necklaces', 'Earrings', 'Watches'],
    promotions: [
      { title: 'VIP members get 10% off always!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
    ],
  },

  // ─── FABRIC ─────────────────────────────────────────────────────
  {
    id: 'vendor_7',
    name: 'POPWAVE TEXTILES',
    logoInitials: 'PT',
    logoStyle: 'image',
    logoImage: '/image/icon6.jpg',
    followers: 980,
    rating: 4.2,
    reviewCount: 160,
    productIds: ['prod_5'],
    category: 'fabric',
    description: 'Ankara clothing, originating from West Africa, blends culture, history, and creativity into vibrant, stylish pieces that tell a story through bold patterns and colors.',
    heroImage: '/image/ankara.png',
    successRate: 98,
    totalItemsSold: 149,
    collections: ['Trad Wear', 'Crochet Wear', 'Tops', 'Bottoms', 'Outer Wear'],
    promotions: [
      { title: 'Free shipping on orders over ₦75,000 when you pay with PayPal!', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
      { title: 'Save ₦10,000 on orders over ₦150,000', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
      { title: 'Get 15% off every month with our VIP subscription!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
      { title: 'Flash Sale: 30% off for the next 3 hours!', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
      { title: 'Buy 3, get ₦65,000 off selected items', subtitle: 'Automatically applied in cart. Expires on Dec 9 at 6:59 am', color: '#6B7280' },
    ],
    promo: {
      label: 'Get 20% off',
      condition: 'on orders over ₦50,000',
    },
    themeColor: '#FF6B00', // Popwave Orange
  },
  {
    id: 'vendor_8',
    name: 'AFRICANA FABRICS',
    logoInitials: 'AF',
    logoStyle: 'image',
    logoImage: '/image/icon7.jpg',
    followers: 2100,
    rating: 4.6,
    reviewCount: 310,
    productIds: ['prod_6'],
    category: 'fabric',
    description: 'Luxury African fabrics sourced from the finest weavers. Lace, brocade, and Aso-oke for your most important moments.',
    heroImage: '/image/fabric-1.jpg',
    successRate: 97,
    totalItemsSold: 267,
    collections: ['Lace', 'Brocade', 'Aso-oke', 'Ankara', 'Swiss Voile'],
    promotions: [
      { title: 'Get 20% off on 12-yard bundles!', subtitle: 'Automatically applied at checkout', color: '#F5A623' },
    ],
  },
  {
    id: 'vendor_18',
    name: 'SILK ROAD NG',
    logoInitials: 'SR',
    logoStyle: 'image',
    logoImage: '/image/icon17.jpg',
    followers: 1780,
    rating: 4.4,
    reviewCount: 240,
    productIds: ['prod_5', 'prod_6'],
    category: 'fabric',
    description: 'Premium silk and blended fabrics for discerning designers. From Aso-oke to imported Italian silk.',
    heroImage: '/image/ankara.png',
    successRate: 93,
    totalItemsSold: 156,
    collections: ['Silk', 'Aso-oke', 'Ankara', 'Lace'],
    promotions: [
      { title: 'Get 25% off on 12-yard bundles', subtitle: 'Automatically applied at checkout', color: '#065F46' },
    ],
    promo: {
      label: 'Get 25% off',
      condition: 'on 12-yard bundles',
    },
  },
  {
    id: 'vendor_19',
    name: 'LAGOS LACE HOUSE',
    logoInitials: 'LL',
    logoStyle: 'image',
    logoImage: '/image/icon18.jpg',
    followers: 4560,
    rating: 4.8,
    reviewCount: 680,
    productIds: ['prod_6'],
    category: 'fabric',
    description: 'The finest lace fabrics in Lagos. Swiss, French, and Nigerian lace for weddings, events, and everyday luxury.',
    heroImage: '/image/fabric-1.jpg',
    successRate: 99,
    totalItemsSold: 523,
    collections: ['Swiss Lace', 'French Lace', 'Nigerian Lace', 'Brocade'],
    promotions: [
      { title: 'Free shipping on all lace orders!', subtitle: 'Automatically applied at checkout', color: '#065F46' },
      { title: 'Save ₦15,000 on orders over ₦100,000', subtitle: 'Automatically applied at checkout', color: '#DC2626' },
    ],
  },
  {
    id: 'vendor_20',
    name: 'COTTON & THREAD',
    logoInitials: 'CT',
    logoStyle: 'image',
    logoImage: '/image/icon19.jpg',
    followers: 890,
    rating: 4.0,
    reviewCount: 95,
    productIds: ['prod_5'],
    category: 'fabric',
    description: 'Affordable quality cotton fabrics and Ankara prints for everyday sewing projects and small businesses.',
    heroImage: '/image/ankara.png',
    successRate: 88,
    totalItemsSold: 67,
    collections: ['Cotton', 'Ankara', 'Prints', 'Plain'],
    promotions: [],
  },
];
