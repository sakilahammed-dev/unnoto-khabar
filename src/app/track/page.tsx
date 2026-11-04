'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

interface TrackedOrder {
  id: string;
  orderCode: string;
  customerName: string;
  maskedPhone: string;
  district: string;
  upazila: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  dueAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  courierName?: string | null;
  trackingCode?: string | null;
  createdAt: string;
  items: Array<{
    name: string;
    weight: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const ORDER_STEPS = [
  { key: 'PENDING', label: 'অর্ডার প্রাপ্ত', desc: 'অর্ডার পর্যালোচনায় আছে' },
  { key: 'CONFIRMED', label: 'নিশ্চিত হয়েছে', desc: 'অর্ডার ভেরিফাই সম্পন্ন' },
  { key: 'PROCESSING', label: 'প্যাকিং চলছে', desc: 'খাঁটি পণ্য প্রস্তুত হচ্ছে' },
  { key: 'SHIPPED', label: 'কুরিয়ারে হস্তান্তর', desc: 'আপনার গন্তব্যে রওনা হয়েছে' },
  { key: 'DELIVERED', label: 'সফল ডেলিভারি', desc: 'পণ্য পৌঁছে গেছে' },
];

export default function OrderTrackPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'অর্ডার খুঁজে পাওয়া যায়নি।');
      } else {
        setOrders(data.orders || []);
      }
    } catch {
      setErrorMessage('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#1b5e20] mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল দোকানে ফিরে যান</span>
        </Link>

        {/* Hero Title Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b5e20] to-[#2e7d32] text-white shadow-lg shadow-green-900/20 mb-3">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
            অর্ডার লাইভ ট্র্যাকিং
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            আপনার মোবাইল নম্বর অথবা অর্ডার কোড লিখে পার্সেলের বর্তমান অবস্থান জেনে নিন
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="যেমন: UK-2611-1001 অথবা 01712345678"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] hover:from-[#154a1a] hover:to-[#256629] text-white font-bold rounded-xl shadow-md text-sm transition transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ট্র্যাক করুন</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        {orders && orders.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'CANCELLED';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 sm:p-7 relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">অর্ডার কোড:</span>
                        <span className="text-base font-bold font-mono text-[#f48721]">
                          #{order.orderCode}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600">গ্রাহক:</span>
                      <strong className="text-xs text-gray-900">{order.customerName}</strong>
                      <span className="text-xs font-mono text-gray-500">({order.maskedPhone})</span>
                    </div>
                  </div>

                  {/* Tracking Stepper */}
                  <div className="py-8">
                    {isCancelled ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
                        <p className="font-bold text-sm">অর্ডারটি বাতিল করা হয়েছে</p>
                        <p className="text-xs mt-1">বিস্তারিত তথ্যের জন্য আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন।</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-2 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
                          <div
                            className="h-full bg-[#1b5e20] transition-all duration-500"
                            style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                          />
                        </div>

                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                                  isDone
                                    ? 'bg-[#1b5e20] text-white ring-4 ring-green-100'
                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] font-bold mt-2 leading-tight ${
                                  isCurrent ? 'text-[#1b5e20]' : isDone ? 'text-gray-800' : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[9px] text-gray-500 hidden sm:block mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Details & Summary */}
                  <div className="bg-[#fcfbf9] rounded-xl p-4 border border-gray-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">
                        ডেলিভারি ঠিকানা
                      </h4>
                      <p className="text-gray-700 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-[#1b5e20] shrink-0 mt-0.5" />
                        <span>
                          {order.upazila}, {order.district}
                        </span>
                      </p>
                      {order.courierName && (
                        <p className="mt-2 text-gray-600">
                          কুরিয়ার: <strong>{order.courierName}</strong>
                          {order.trackingCode && (
                            <span className="block font-mono text-[11px] text-blue-700">
                              ট্র্যাকিং কোড: {order.trackingCode}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="sm:border-l sm:border-gray-200 sm:pl-4">
                      <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">
                        বিলিং তথ্য
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-gray-600">
                          <span>মোট বিল:</span>
                          <span className="font-bold text-gray-900 font-mono">৳{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>ডেলিভারির সময় বাকি:</span>
                          <span className="font-bold text-red-600 font-mono">৳{order.dueAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-[11px] pt-1">
                          <span>পেমেন্ট মাধ্যম:</span>
                          <span className="uppercase font-semibold">{order.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <h4 className="text-[11px] font-bold text-gray-700 mb-2">
                      অর্ডারকৃত পণ্য তালিকা ({order.items.length}টি):
                    </h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                          <span>• {item.name} ({item.weight}) x {item.quantity}টি</span>
                          <span className="font-mono font-bold text-gray-800">৳{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Support Bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">যেকোনো তথ্যের জন্য কল করুন বা মেসেজ দিন:</span>
                    <a
                      href={`https://wa.me/8801888000000?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমার অর্ডার কোড #${order.orderCode} সম্পর্কে জানতে চাচ্ছিলাম।`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
