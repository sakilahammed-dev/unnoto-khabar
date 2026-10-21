'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const FloatingCartTab: React.FC = () => {
  const { cartCount, subtotal, setIsCartOpen } = useCart();

  if (cartCount === 0) return null;

  return (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#f48721] hover:bg-[#d97116] text-white rounded-l-xl p-2.5 sm:p-3 shadow-2xl flex-col items-center justify-center gap-1 transition-all hover:-translate-x-1 cursor-pointer select-none border-y border-l border-orange-400 group"
      aria-label="শপিং কার্ট খুলুন"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>{cartCount} Items</span>
      </div>
      <div className="text-xs sm:text-sm font-extrabold bg-black/15 px-2 py-0.5 rounded">
        ৳{subtotal}
      </div>
    </button>
  );
};
