import type { Order, Transaction } from './types';
import { Truck, Store } from 'lucide-react';

// ─── Demo Orders ────────────────────────────────────────────
export const demoOrders: Order[] = [
  { id: 'o1', orderNumber: '#QZ20250127A', date: 'Jan 27, 2025', total: 280000, status: 'Pending', images: ['/image/product-1.png', '/image/product-2.png'], items: [
    { name: 'Amasi Dress', image: '/image/product-1.png', fabric: '#2D6A4F', size: 'M', qty: 1, price: 250000, productType: 'custom', vendor: 'Garm Island', vendorLogo: '/image/product-1.png', vendorRating: '4.6 (807)' },
    { name: 'Ankara Head Wrap', image: '/image/product-2.png', fabric: '#D4AF37', size: 'One Size', qty: 1, price: 8500, productType: 'accessories', vendor: 'Adire Hub', vendorLogo: '/image/product-2.png', vendorRating: '4.8 (324)' },
  ] },
  { id: 'o2', orderNumber: '#QZ20250115B', date: 'Jan 15, 2025', total: 49999, status: 'Shipped', images: ['/image/product-3.png'], items: [
    { name: 'Seamless High Waist Joggers', image: '/image/product-3.png', fabric: '#1A1A1A', size: 'X L', qty: 1, price: 49999, productType: 'ready-to-wear' },
  ] },
  { id: 'o3', orderNumber: '#QZ20250108C', date: 'Jan 8, 2025', total: 18500, status: 'Delivered', images: ['/image/product-4.png'], items: [
    { name: 'Aso-Oke Premium Fabric', image: '/image/product-4.png', fabric: '#8B4513', size: '6 yards', qty: 1, price: 18500, productType: 'fabric', vendor: 'Grass Field Textiles', vendorLogo: '/image/product-4.png', vendorRating: '4.9 (1,204)' },
  ] },
  { id: 'o4', orderNumber: '#QZ20241228D', date: 'Dec 28, 2024', total: 12500, status: 'Delivered', images: ['/image/product-5.png'], items: [
    { name: 'Gold Plated Ear Cuffs', image: '/image/product-5.png', fabric: '#D4AF37', size: 'One Size', qty: 2, price: 12500, productType: 'accessories', vendor: 'Lagos Gold Co.', vendorLogo: '/image/product-5.png', vendorRating: '4.7 (512)' },
  ] },
  { id: 'o5', orderNumber: '#QZ20241220E', date: 'Dec 20, 2024', total: 450000, status: 'Refused', images: ['/image/product-2.png', '/image/product-1.png'], items: [
    { name: 'Wedding Agbada 3-Piece', image: '/image/product-2.png', fabric: '#FFFFFF', size: 'Custom', qty: 1, price: 380000, productType: 'bespoke', vendor: 'Royal Stitches', vendorLogo: '/image/product-3.png', vendorRating: '4.9 (256)' },
    { name: 'Fila Cap & Beads Set', image: '/image/product-1.png', fabric: '#FFFFFF', size: 'L', qty: 1, price: 35000, productType: 'accessories', vendor: 'Royal Stitches', vendorLogo: '/image/product-3.png', vendorRating: '4.9 (256)' },
  ] },
];

// ─── Wallet Transaction Data ────────────────────────────────
export const walletMonths: { label: string; transactions: Transaction[] }[] = [
  {
    label: 'Dec 2024',
    transactions: [
      { id: 'tx1', type: 'points-spent', description: 'You spent 2.2 pts', date: '12 Dec, 10:41', amount: '-2.2pts', isPositive: false, detail: { title: '10,000 NGN', subtitle: 'You Spent', image: '/image/product-1.png', rewardPts: '3.8pts', brands: ['POP', 'EB', 'AFR', 'Fi', 'QLZT'] } },
      { id: 'tx2', type: 'points-earned', description: 'You earned 7.9 pts', date: '12 Dec, 10:41', amount: '+7.9pts', isPositive: true, detail: { title: 'Amasi Dress', subtitle: 'Used Design', image: '/image/product-2.png', rewardPts: '10.8pts', usedBy: '@kemi' } },
      { id: 'tx3', type: 'points-spent', description: 'You earned 3.8 pts', date: '12 Dec, 10:41', amount: '-3.8pts', isPositive: false, detail: { title: '10,000 NGN', subtitle: 'You Spent', image: '/image/product-3.png', rewardPts: '3.8pts', brands: ['POP', 'EB', 'AFR', 'Fi', 'QLZT'] } },
    ],
  },
  {
    label: 'Nov 2024',
    transactions: [
      { id: 'tx4', type: 'points-earned', description: 'You earned 3.8 pts', date: '12 Dec, 10:41', amount: '+3.8pts', isPositive: true, detail: { title: 'Amasi Dress', subtitle: 'Used Design', image: '/image/product-4.png', rewardPts: '3.8pts', usedBy: '@kemi' } },
      { id: 'tx5', type: 'ngn-deposit', description: 'You deposited 2000 naira', date: '12 Dec, 10:41', amount: '+2000 NGN', isPositive: true },
      { id: 'tx6', type: 'points-spent', description: 'You spent 2.2 pts', date: '12 Dec, 10:41', amount: '-2.2pts', isPositive: false, detail: { title: '10,000 NGN', subtitle: 'You Spent', image: '/image/product-5.png', rewardPts: '3.8pts', brands: ['POP', 'EB', 'AFR'] } },
      { id: 'tx7', type: 'points-earned', description: 'You earned 3.8 pts', date: '12 Dec, 10:41', amount: '+3.8pts', isPositive: true, detail: { title: 'Amasi Dress', subtitle: 'Used Design', image: '/image/product-2.png', rewardPts: '3.8pts', usedBy: '@kemi' } },
      { id: 'tx8', type: 'ngn-spent', description: 'You spent 2000 Naira', date: '12 Dec, 10:41', amount: '-2000 NGN', isPositive: false, detail: { title: '10,000 NGN', subtitle: 'You Spent', image: '/image/product-1.png', rewardPts: '3.8pts', brands: ['POP', 'EB', 'AFR', 'Fi', 'QLZT'] } },
    ],
  },
];

// ─── Return Flow Options ────────────────────────────────────
export const conditionOptions = [
  'I would like to return a sealed product.',
  'I want to return an item ordered by mistake.',
  'The product is defective or damaged.',
  'I wish to return an unsealed but functional product.',
  'Received the wrong product.',
];

export const reasonOptions = [
  'The product quality is unsatisfactory.',
  'The product was not my size.',
  'I changed my mind or the product was not as expected.',
  'The product information was misleading.',
  'The product was not delivered.',
];

export const returnShipOptions = [
  { id: 'standard', icon: Truck, title: 'Standard Shipping - ₦10,000', desc: 'Send it by tomorrow' },
  { id: 'pickup', icon: Store, title: 'In-store pickup - Free', desc: 'Send it by 10/11/2024' },
];

export const returnPayOptions = [
  { id: 'voucher', title: 'I would like a store voucher', desc: 'Receive an instant voucher to use on new orders.' },
  { id: 'refund', title: 'I want a refund', desc: 'We will process your refund, which may take up to 7 business days.' },
  { id: 'replacement', title: 'I would like a replacement product', desc: 'We will replace your product with a new one.' },
  { id: 'adjustment', title: 'I would like an adjustment to the size', desc: 'We will mend the cloth to your desired size.' },
];

// ─── Address Data ────────────────────────────────────────────
export const defaultAddresses = [
  { id: '1', name: 'Mobbin D', lines: ['8 Bukit Batok Street 41', 'Butik Batok', 'Singapore, 657990', 'Singapore'], isDefault: true },
  { id: '2', name: 'Mobbin D', lines: ['8 Bukit Batok Street 41', 'Butik Batok', 'Singapore, 657990', 'Singapore'], isDefault: false },
  { id: '3', name: 'Mobbin D', lines: ['8 Bukit Batok Street 41', 'Butik Batok', 'Singapore, 657990', 'Singapore'], isDefault: false },
];

export const suggestedAddresses = [
  { main: 'Gold Estate, Abuja, Federal Capital Territory', sub: 'Gold estate, Abuja, Nigeria' },
  { main: 'Gold Estate, Abuja, Federal Capital Territory', sub: 'Gold estate, Abuja, Nigeria' },
  { main: 'Gold Estate, Abuja, Federal Capital Territory', sub: 'Gold estate, Abuja, Nigeria' },
  { main: 'Gold Estate, Abuja, Federal Capital Territory', sub: 'Gold estate, Abuja, Nigeria' },
];
