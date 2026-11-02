'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  MessageCircle,
  Printer,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Shield,
  FileText,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  weight: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  district: string;
  upazila: string;
  address: string;
  notes?: string | null;
  deliveryZone: string;
  deliveryCharge: number;
  subtotal: number;
  totalAmount: number;
  advancePlan: number;
  advanceAmount: number;
  dueAmount: number;
  paymentMethod: string;
  paymentTrxId?: string | null;
  paymentSenderNumber?: string | null;
  paymentStatus: string;
  status: string;
  courierName?: string | null;
  trackingCode?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  totalRevenue: number;
}

interface AdminProduct {
  id: string;
  variantId: string;
  itemKey: string;
  name: string;
  banglaName: string;
  category: string;
  categoryName: string;
  weight: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
  isOffer: boolean;
  badge?: string | null;
  isCustom: boolean;
}

const CATEGORY_OPTIONS = [
  { id: 'honey', label: 'মধু (Natural Honey)' },
  { id: 'honey-nuts', label: 'হানি নাটস (Honey Nuts)' },
  { id: 'whole-nuts', label: 'বাদাম (Premium Nuts)' },
  { id: 'dates', label: 'খেজুর (Royal Dates)' },
  { id: 'oil-ghee', label: 'তেল ও ঘি (Oils & Ghee)' },
  { id: 'dry-fish', label: 'শুঁটকি (Dry Fish)' },
  { id: 'health-mix', label: 'হেলথ মিক্স (Health Mix)' },
  { id: 'super-seeds', label: 'সুপার সিডস (Super Seeds)' },
  { id: 'pickles-spices', label: 'আচার ও মসলা (Pickles & Spices)' },
  { id: 'special-offers', label: 'বিশেষ অফার (Special Offers)' },
];

const PRESET_IMAGES = [
  { label: 'খাঁটি মধু', url: '/products/sundarban_raw_honey.png' },
  { label: 'হানি নাটস', url: '/products/honey_nuts_royal.png' },
  { label: 'আমেরিকান কাঠবাদাম', url: '/products/almonds_american.png' },
  { label: 'মরিয়ম খেজুর', url: '/products/maryam_dates.png' },
  { label: 'সরিষার তেল', url: '/products/mustard_oil.png' },
  { label: 'গাওয়া ঘি', url: '/products/pure_ghee.png' },
  { label: 'চিয়া সিডস', url: '/products/chia_seed.png' },
  { label: 'আমের আচার', url: '/products/mango_pickle.png' },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation main tab: 'orders' | 'products'
  const [activeNav, setActiveNav] = useState<'orders' | 'products'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0,
  });
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductKey, setEditingProductKey] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState<number>(0);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    banglaName: '',
    name: '',
    category: 'honey',
    weight: '১ কেজি',
    price: '',
    originalPrice: '',
    imageUrl: '/products/sundarban_raw_honey.png',
    badge: '১০০% খাঁটি ও প্রাকৃতিক',
    isOffer: false,
    shortDescription: '',
  });

  // Verify auth and fetch orders
  const fetchOrders = useCallback(async () => {
    setIsOrdersLoading(true);
    try {
      const meRes = await fetch('/api/admin/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }

      const url = new URL('/api/orders', window.location.origin);
      if (orderStatusFilter !== 'ALL') url.searchParams.set('status', orderStatusFilter);
      if (orderSearchQuery.trim()) url.searchParams.set('search', orderSearchQuery.trim());

      const ordersRes = await fetch(url.toString());
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
        if (data.stats) setOrderStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  }, [orderStatusFilter, orderSearchQuery, router]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (activeNav === 'products' && products.length === 0) {
      fetchProducts();
    }
  }, [activeNav, products.length, fetchProducts]);

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: data.order.status } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: data.order.status } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Product In-Stock Status
  const handleToggleStock = async (product: AdminProduct) => {
    const newStock = !product.inStock;
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.itemKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inStock: newStock,
          isCustom: product.isCustom,
        }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.itemKey === product.itemKey ? { ...p, inStock: newStock } : p))
        );
      } else {
        alert('স্টক আপডেট করতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      console.error(err);
      alert('স্টক আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // Start Inline Edit Price
  const handleStartEditPrice = (product: AdminProduct) => {
    setEditingProductKey(product.itemKey);
    setEditPrice(product.price);
    setEditOriginalPrice(product.originalPrice);
  };

  // Save Inline Edit Price
  const handleSavePrice = async (product: AdminProduct) => {
    setIsSavingProduct(true);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.itemKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: editPrice,
          originalPrice: editOriginalPrice,
          isCustom: product.isCustom,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.itemKey === product.itemKey
              ? { ...p, price: editPrice, originalPrice: editOriginalPrice }
              : p
          )
        );
        setEditingProductKey(null);
      } else {
        alert('মূল্য আপডেট করতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      console.error(err);
      alert('মূল্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Custom Product
  const handleDeleteProduct = async (product: AdminProduct) => {
    if (!product.isCustom) return;
    if (!confirm(`আপনি কি সত্যিই "${product.banglaName}" পণ্যটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.itemKey !== product.itemKey));
      } else {
        alert('পণ্যটি মুছতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      console.error(err);
      alert('পণ্য মুছতে সমস্যা হয়েছে।');
    }
  };

  // Submit New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.banglaName || !newProduct.price || !newProduct.weight) {
      alert('অনুগ্রহ করে পণ্যের বাংলা নাম, ওজন এবং বিক্রয় মূল্য দিন।');
      return;
    }

    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (res.ok) {
        alert('নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!');
        setIsAddProductOpen(false);
        setNewProduct({
          banglaName: '',
          name: '',
          category: 'honey',
          weight: '১ কেজি',
          price: '',
          originalPrice: '',
          imageUrl: '/products/sundarban_raw_honey.png',
          badge: '১০০% খাঁটি ও প্রাকৃতিক',
          isOffer: false,
          shortDescription: '',
        });
        fetchProducts();
      } else {
        alert(data.error || 'নতুন পণ্য যুক্ত করতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভার এরর: পণ্য যুক্ত করা সম্ভব হয়নি।');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/admin/me', { method: 'POST' });
    router.push('/admin/login');
  };

  // WhatsApp click handler
  const handleWhatsApp = (order: Order) => {
    const cleanPhone = order.phoneNumber.replace(/^0/, '880');
    const itemsSummary = order.items.map((i) => `${i.name} (${i.weight}) x ${i.quantity}টি`).join(', ');
    const msg = `আসসালামু আলাইকুম ${order.customerName} ভাই/ম্যাম, উন্নত খাবার (Unnoto Khabar) থেকে আপনার অর্ডার কোড #${order.orderCode} কনফার্ম করার জন্য যোগাযোগ করছি।\n\nঅর্ডারকৃত পণ্য: ${itemsSummary}\nমোট বিল: ৳${order.totalAmount} (ডেলিভারিতে প্রদেয়: ৳${order.dueAmount})\nডেলিভারি ঠিকানা: ${order.address}, ${order.upazila}, ${order.district}।\n\nআপনার ঠিকানা ও অর্ডারটি ঠিক থাকলে অনুগ্রহ করে কনফার্ম করুন। ধন্যবাদ!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Status color badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><Clock className="w-3 h-3" /> অপেক্ষমান (Pending)</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> নিশ্চিত (Confirmed)</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><Package className="w-3 h-3" /> প্রসেসিং (Processing)</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><Truck className="w-3 h-3" /> কুরিয়ারে (Shipped)</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ডেলিভার্ড (Delivered)</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold inline-flex items-center gap-1"><X className="w-3 h-3" /> বাতিল (Cancelled)</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
    const matchesSearch =
      !productSearchQuery.trim() ||
      p.banglaName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1b5e20] to-[#2e7d32] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              উ
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">উন্নত খাবার</h1>
              <p className="text-[11px] text-[#f48721] font-bold uppercase tracking-wider">
                Enterprise Admin Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 text-[#1b5e20] flex items-center justify-center font-bold text-xs">
                শ
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">শাকিল আহাম্মেদ</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Super Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="লগআউট"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Admin Segmented Tabs (Orders vs Products) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 pt-2 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveNav('orders')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeNav === 'orders'
                ? 'border-[#1b5e20] text-[#1b5e20] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>অর্ডার ও ডেলিভারি (Orders)</span>
            <span className="px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded-full text-[10px]">
              {orderStats.totalOrders}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('products')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeNav === 'products'
                ? 'border-[#1b5e20] text-[#1b5e20] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>পণ্য ও মূল্য নিয়ন্ত্রণ (Products & Inventory)</span>
            <span className="px-1.5 py-0.2 bg-green-100 text-[#1b5e20] rounded-full text-[10px]">
              {products.length > 0 ? products.length : 'Live'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* ========================================================= */}
        {/* VIEW 1: ORDERS & FULFILLMENT                             */}
        {/* ========================================================= */}
        {activeNav === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">মোট অর্ডার</p>
                  <h3 className="text-xl font-bold text-gray-900">{orderStats.totalOrders}</h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-amber-800 font-semibold">অপেক্ষমান (Pending)</p>
                  <h3 className="text-xl font-bold text-amber-900">{orderStats.pending}</h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-semibold">নিশ্চিত অর্ডার</p>
                  <h3 className="text-xl font-bold text-blue-900">{orderStats.confirmed}</h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm bg-gradient-to-br from-indigo-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-indigo-800 font-semibold">কুরিয়ারে পাঠানো</p>
                  <h3 className="text-xl font-bold text-indigo-900">{orderStats.shipped}</h3>
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-green-200 shadow-sm bg-gradient-to-br from-green-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-green-100 text-[#1b5e20] flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#1b5e20] font-semibold">মোট বিক্রি (Revenue)</p>
                  <h3 className="text-xl font-bold text-green-950">৳{orderStats.totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'ALL', label: 'সকল অর্ডার' },
                  { id: 'PENDING', label: 'অপেক্ষমান (Pending)' },
                  { id: 'CONFIRMED', label: 'নিশ্চিত (Confirmed)' },
                  { id: 'PROCESSING', label: 'প্রসেসিং' },
                  { id: 'SHIPPED', label: 'কুরিয়ারে' },
                  { id: 'DELIVERED', label: 'ডেলিভার্ড' },
                  { id: 'CANCELLED', label: 'বাতিল' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      orderStatusFilter === tab.id
                        ? 'bg-[#1b5e20] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Refresh */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="অর্ডার কোড, ফোন, নাম খুঁজুন..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:border-transparent transition"
                  />
                </div>

                <button
                  onClick={fetchOrders}
                  disabled={isOrdersLoading}
                  title="রিফ্রেশ"
                  className="p-2 text-gray-600 hover:text-[#1b5e20] bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isOrdersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-3.5 px-4">অর্ডার কোড & তারিখ</th>
                      <th className="py-3.5 px-4">কাস্টমার তথ্য</th>
                      <th className="py-3.5 px-4">ডেলিভারি ঠিকানা</th>
                      <th className="py-3.5 px-4">পণ্য তালিকা</th>
                      <th className="py-3.5 px-4">বিল ও বকেয়া</th>
                      <th className="py-3.5 px-4">স্ট্যাটাস</th>
                      <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isOrdersLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1b5e20]" />
                          ডাটাবেজ থেকে অর্ডার লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition">
                          {/* Code & Date */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="font-bold text-[#f48721] text-xs block font-mono">
                              #{order.orderCode}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          {/* Customer Info */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="font-bold text-gray-900 block">{order.customerName}</span>
                            <a
                              href={`tel:${order.phoneNumber}`}
                              className="text-[#1b5e20] hover:underline flex items-center gap-1 font-mono text-[11px] mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              {order.phoneNumber}
                            </a>
                          </td>

                          {/* Address */}
                          <td className="py-3.5 px-4 align-top max-w-[200px]">
                            <span className="font-semibold text-gray-800 block text-[11px]">
                              {order.district}, {order.upazila}
                            </span>
                            <span className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">
                              {order.address}
                            </span>
                            {order.notes && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                                নোট: {order.notes}
                              </span>
                            )}
                          </td>

                          {/* Items */}
                          <td className="py-3.5 px-4 align-top max-w-[220px]">
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-[11px] text-gray-700 flex justify-between">
                                  <span className="truncate pr-1">
                                    • {item.name} ({item.weight})
                                  </span>
                                  <span className="font-semibold whitespace-nowrap text-gray-900">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Billing */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="font-bold text-gray-900 text-xs block">
                              ৳{order.totalAmount}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              ডেলিভারিতে বাকি: <strong className="text-red-600">৳{order.dueAmount}</strong>
                            </span>
                            <div className="mt-1">
                              {order.paymentMethod === 'cod' ? (
                                <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                  ক্যাশ অন ডেলিভারি
                                </span>
                              ) : (
                                <div className="bg-pink-50 border border-pink-200 rounded p-1.5 space-y-0.5 text-[10px]">
                                  <span className="font-bold text-[#e2136e] block uppercase">
                                    {order.paymentMethod} (অগ্রিম ৳{order.advanceAmount})
                                  </span>
                                  {order.paymentSenderNumber && (
                                    <span className="text-gray-700 block font-mono">
                                      নম্বর: {order.paymentSenderNumber}
                                    </span>
                                  )}
                                  {order.paymentTrxId && (
                                    <span className="font-bold font-mono text-blue-700 block bg-blue-50 px-1 rounded">
                                      TrxID: {order.paymentTrxId}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1.5">
                              {getStatusBadge(order.status)}
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className="block w-full text-[11px] bg-white border border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-[#1b5e20] focus:outline-none cursor-pointer disabled:opacity-50"
                              >
                                <option value="PENDING">অপেক্ষমান (Pending)</option>
                                <option value="CONFIRMED">নিশ্চিত (Confirmed)</option>
                                <option value="PROCESSING">প্রসেসিং (Processing)</option>
                                <option value="SHIPPED">কুরিয়ারে (Shipped)</option>
                                <option value="DELIVERED">ডেলিভার্ড (Delivered)</option>
                                <option value="CANCELLED">বাতিল (Cancelled)</option>
                              </select>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* WhatsApp Button */}
                              <button
                                onClick={() => handleWhatsApp(order)}
                                title="কাস্টমারকে WhatsApp মেসেজ পাঠান"
                                className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition border border-green-200 cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* Print Invoice Memo */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                title="ইনভয়েস স্লিপ দেখুন ও প্রিন্ট করুন"
                                className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition border border-gray-200 cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: PRODUCTS & INVENTORY MANAGEMENT                  */}
        {/* ========================================================= */}
        {activeNav === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Product KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">মোট পণ্য ভ্যারিয়েন্ট</p>
                  <h3 className="text-xl font-bold text-gray-900">{products.length}টি</h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm bg-gradient-to-br from-green-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-green-100 text-[#1b5e20] flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#1b5e20] font-semibold">স্টকে সক্রিয়</p>
                  <h3 className="text-xl font-bold text-green-950">
                    {products.filter((p) => p.inStock).length}টি
                  </h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm bg-gradient-to-br from-red-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-red-700 font-semibold">স্টক শেষ (Out of Stock)</p>
                  <h3 className="text-xl font-bold text-red-950">
                    {products.filter((p) => !p.inStock).length}টি
                  </h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50/40 to-white flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-purple-700 font-semibold">অ্যাডমিন নিজস্ব পণ্য</p>
                  <h3 className="text-xl font-bold text-purple-950">
                    {products.filter((p) => p.isCustom).length}টি
                  </h3>
                </div>
              </div>
            </div>

            {/* Product Control Bar (Filters, Search & Add Button) */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Category select */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b5e20] cursor-pointer"
                >
                  <option value="ALL">সকল ক্যাটাগরি</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b5e20] transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={fetchProducts}
                  disabled={isProductsLoading}
                  title="রিফ্রেশ"
                  className="p-2 text-gray-600 hover:text-[#1b5e20] bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isProductsLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2 bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন পণ্য যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-3.5 px-4">ছবি ও নাম</th>
                      <th className="py-3.5 px-4">ক্যাটাগরি</th>
                      <th className="py-3.5 px-4">সাইজ / ওজন</th>
                      <th className="py-3.5 px-4">বিক্রয় মূল্য (৳)</th>
                      <th className="py-3.5 px-4">আসল মূল্য (৳)</th>
                      <th className="py-3.5 px-4 text-center">স্টক স্ট্যাটাস</th>
                      <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isProductsLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1b5e20]" />
                          পণ্য তালিকা লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          কোনো পণ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isEditingThis = editingProductKey === prod.itemKey;

                        return (
                          <tr key={prod.itemKey} className="hover:bg-gray-50/80 transition">
                            {/* Product Image & Title */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                  <Image
                                    src={prod.imageUrl}
                                    alt={prod.banglaName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="max-w-[220px]">
                                  <span className="font-bold text-gray-900 block truncate">
                                    {prod.banglaName}
                                  </span>
                                  <span className="text-[10px] text-gray-500 block truncate font-mono">
                                    {prod.name}
                                  </span>
                                  {prod.isCustom && (
                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                      কাস্টম পণ্য
                                    </span>
                                  )}
                                  {prod.badge && (
                                    <span className="inline-block mt-0.5 ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-medium rounded">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 text-gray-700 font-medium">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                                {prod.categoryName || prod.category}
                              </span>
                            </td>

                            {/* Weight */}
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              {prod.weight}
                            </td>

                            {/* Selling Price */}
                            <td className="py-3 px-4">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                  className="w-20 px-2 py-1 text-xs border border-green-500 rounded bg-green-50 font-bold focus:outline-none"
                                  autoFocus
                                />
                              ) : (
                                <span className="font-bold text-sm text-[#1b5e20] font-mono">
                                  ৳{prod.price}
                                </span>
                              )}
                            </td>

                            {/* Original Price */}
                            <td className="py-3 px-4">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  value={editOriginalPrice}
                                  onChange={(e) =>
                                    setEditOriginalPrice(Math.max(0, parseInt(e.target.value, 10) || 0))
                                  }
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 font-mono focus:outline-none"
                                />
                              ) : (
                                <span className="text-gray-400 line-through font-mono">
                                  ৳{prod.originalPrice}
                                </span>
                              )}
                            </td>

                            {/* In Stock Toggle */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleStock(prod)}
                                title="স্টক পরিবর্তন করতে ক্লিক করুন"
                                className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                                  prod.inStock
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {prod.inStock ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>স্টকে আছে</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    <span>স্টক শেষ</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions (Edit / Save / Delete) */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {isEditingThis ? (
                                  <>
                                    <button
                                      onClick={() => handleSavePrice(prod)}
                                      disabled={isSavingProduct}
                                      title="সংরক্ষণ করুন"
                                      className="p-1.5 bg-[#1b5e20] text-white hover:bg-green-700 rounded-lg transition cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingProductKey(null)}
                                      title="বাতিল"
                                      className="p-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleStartEditPrice(prod)}
                                    title="দাম পরিবর্তন করুন"
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}

                                {prod.isCustom && (
                                  <button
                                    onClick={() => handleDeleteProduct(prod)}
                                    title="পণ্যটি মুছে ফেলুন"
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ADD NEW PRODUCT MODAL                                     */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-[#1b5e20] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">নতুন পণ্য যুক্ত করুন</h3>
                  <p className="text-[11px] text-gray-500">
                    সহজেই নতুন আইটেম যুক্ত করুন ও ওয়েবসাইটে প্রদর্শন করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Bangla Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পণ্যের বাংলা নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সুন্দরবনের খলিশা মধু"
                    value={newProduct.banglaName}
                    onChange={(e) => setNewProduct({ ...newProduct, banglaName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ইংরেজি নাম (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sundarban Khalisha Honey"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ওজন / সাইজ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১ কেজি অথবা ৫০০ গ্রাম"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="যেমন: 1250"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none font-bold"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    আসল / পূর্বের মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 1400 (ছাড় দেখাতে)"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Presets & Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  পণ্যের ছবি
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, imageUrl: preset.url })}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition cursor-pointer ${
                        newProduct.imageUrl === preset.url
                          ? 'bg-[#1b5e20] text-white border-[#1b5e20]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="ছবির লিংক বা পাথ (যেমন: /products/sundarban_raw_honey.png)"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none font-mono"
                />
              </div>

              {/* Badge & Offer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ব্যাজ / হাইলাইট
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সেরা অফার / প্রিমিয়াম"
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b5e20] focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isOffer}
                      onChange={(e) => setNewProduct({ ...newProduct, isOffer: e.target.checked })}
                      className="w-4 h-4 text-[#1b5e20] rounded focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      &quot;বিশেষ অফার&quot; ক্যাটাগরিতে প্রদর্শন করুন
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingProduct ? 'সংরক্ষণ হচ্ছে...' : 'পণ্য যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINTABLE INVOICE MODAL                                   */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Content Area */}
            <div id="printable-memo" className="p-4 bg-white">
              {/* Memo Header */}
              <div className="text-center pb-4 border-b-2 border-gray-800">
                <h2 className="text-xl font-bold font-serif text-gray-900 tracking-wide">
                  উন্নত খাবার (Unnoto Khabar)
                </h2>
                <p className="text-[11px] text-gray-600">
                  ১০০% খাঁটি ও প্রাকৃতিক প্রিমিয়াম খাদ্য পণ্য
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  হটলাইন / হোয়াটসঅ্যাপ: +880 1888-000000 | unnotokhabar.com
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-gray-900 text-white text-xs font-mono font-bold rounded">
                  ইনভয়েস কোড: #{selectedOrder.orderCode}
                </div>
              </div>

              {/* Customer & Order Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-200 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1">
                    গ্রাহকের বিবরণ:
                  </h4>
                  <p className="font-bold text-gray-800">{selectedOrder.customerName}</p>
                  <p className="text-gray-600 font-mono">{selectedOrder.phoneNumber}</p>
                  <p className="text-gray-600 mt-1">{selectedOrder.address}</p>
                  <p className="text-gray-600">
                    {selectedOrder.district}, {selectedOrder.upazila}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1">
                    অর্ডারের তথ্য:
                  </h4>
                  <p className="text-gray-600">
                    তারিখ: {new Date(selectedOrder.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-gray-600">
                    পেমেন্ট মোড: <strong className="uppercase">{selectedOrder.paymentMethod}</strong>
                  </p>
                  {selectedOrder.paymentTrxId && (
                    <p className="text-[11px] font-mono font-bold text-blue-800">
                      TrxID: {selectedOrder.paymentTrxId}
                    </p>
                  )}
                  {selectedOrder.paymentSenderNumber && (
                    <p className="text-[11px] font-mono text-gray-700">
                      প্রেরক: {selectedOrder.paymentSenderNumber}
                    </p>
                  )}
                  <p className="text-gray-600">
                    ডেলিভারি এরিয়া:{' '}
                    {selectedOrder.deliveryZone === 'inside-dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}
                  </p>
                  <p className="mt-1">{getStatusBadge(selectedOrder.status)}</p>
                </div>
              </div>

              {/* Item Details Table */}
              <div className="py-4 border-b border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-700 font-bold">
                      <th className="py-1.5 text-left">পণ্য বিবরণ</th>
                      <th className="py-1.5 text-center">পরিমাণ</th>
                      <th className="py-1.5 text-right">মূল্য</th>
                      <th className="py-1.5 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="py-1.5">
                        <td className="py-1 text-gray-800">
                          {item.name} <span className="text-gray-500">({item.weight})</span>
                        </td>
                        <td className="py-1 text-center font-mono">{item.quantity}</td>
                        <td className="py-1 text-right font-mono">৳{item.unitPrice}</td>
                        <td className="py-1 text-right font-bold text-gray-900 font-mono">
                          ৳{item.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>পণ্যের মূল্য (Subtotal):</span>
                  <span className="font-mono">৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-mono">৳{selectedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>সর্বমোট বিল (Grand Total):</span>
                  <span className="font-mono">৳{selectedOrder.totalAmount}</span>
                </div>
                {selectedOrder.advanceAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>অগ্রিম পরিশোধিত:</span>
                    <span className="font-mono">৳{selectedOrder.advanceAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-red-600 pt-1 border-t border-dashed border-gray-300">
                  <span>ডেলিভারির সময় প্রদেয় (Due COD):</span>
                  <span className="font-mono text-base">৳{selectedOrder.dueAmount}</span>
                </div>
              </div>

              {/* Memo Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
                <p>পণ্য রিসিভ করার সময় দেখে নেওয়ার অনুরোধ রইল। উন্নত খাবারের সাথে থাকার জন্য ধন্যবাদ!</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>মেমো প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
