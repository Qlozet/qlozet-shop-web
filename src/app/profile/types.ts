// ─── Profile Page Types ──────────────────────────────────────
export type ActiveSection =
  | 'welcome'
  | 'personal-info'
  | 'address-book'
  | 'add-address'
  | 'wallet'
  | 'wallet-detail'
  | 'fund-wallet'
  | 'orders'
  | 'order-detail'
  | 'order-item-detail'
  | 'return-order'
  | 'track-order'
  | 'track-return'
  | 'measurements'
  | 'measurement-detail'
  | 'add-measurement'
  | 'measurement-form'
  | 'account-security'
  | 'change-password'
  | 'notifications'
  | 'payment-information'
  | 'add-card';

export type OrderStatus = 'Shipped' | 'Refused' | 'Delivered' | 'Pending';

export interface MeasurementProfile {
  id: string;
  name: string;
  isDefault: boolean;
  values: Record<string, number>;
}

export type ProductType = 'custom' | 'ready-to-wear' | 'fabric' | 'accessories' | 'bespoke';

export interface OrderItem {
  name: string;
  image: string;
  fabric: string;
  size: string;
  qty: number;
  price: number;
  productType: ProductType;
  vendor?: string;
  vendorLogo?: string;
  vendorRating?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  images: string[];
  items: OrderItem[];
}

export interface Transaction {
  id: string;
  type: 'points-earned' | 'points-spent' | 'ngn-deposit' | 'ngn-spent';
  description: string;
  date: string;
  amount: string;
  isPositive: boolean;
  detail?: {
    title: string;
    subtitle: string;
    image?: string;
    rewardPts: string;
    brands?: string[];
    usedBy?: string;
  };
}

export interface AddressEntry {
  id: string;
  name: string;
  lines: string[];
  isDefault: boolean;
}
