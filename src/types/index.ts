export interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  banglaName: string;
  category: string; // matches Category.id
  categoryName: string;
  shortDescription: string;
  description: string;
  features: string[];
  imageUrl: string;
  gallery?: string[];
  variants: ProductVariant[];
  rating: number;
  reviewsCount: number;
  isOffer: boolean;
  discountPercentage?: number;
  badge?: string;
  sku: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  banglaName: string;
  icon: string;
  imageUrl: string;
  description: string;
  itemCount: number;
}

export interface CartItem {
  id: string; // Composite unique key: `${productId}_${variantId}`
  productId: string;
  productName: string;
  imageUrl: string;
  variantId: string;
  weight: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

export type DeliveryZone = 'inside-dhaka' | 'outside-dhaka';

export interface OrderSubmission {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  deliveryZone: DeliveryZone;
  deliveryCharge: number;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  district?: string;
  upazila?: string;
  paymentMethod?: 'cod' | 'bkash' | 'nagad';
  advancePlan?: '50' | '75' | '100';
  advanceAmount?: number;
  dueAmount?: number;
  createdAt: string;
}
