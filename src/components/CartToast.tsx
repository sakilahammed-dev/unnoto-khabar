'use client';

import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartToast: React.FC = () => {
  const { showCartToast, setShowCartToast, setIsCartOpen } = useCart();

  if (!showCartToast) return null;

  return (
    <aside aria-label="কার্ট নোটিফিকেশন" className="fixed top-18 right-4 sm:right-6 z-50">
      <div
        onClick={() => {
          setShowCartToast(false);
          setIsCartOpen(true);
        }}
        className="bg-[#2e7d32] hover:bg-[#256829] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer transition-all hover:scale-102 select-none border border-green-600"
      >
        <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
        <span>Added to Cart</span>
        <span className="text-white/70 mx-1">|</span>
        <span className="underline flex items-center gap-0.5 text-xs">
          কার্ট দেখুন <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </aside>
  );
};
