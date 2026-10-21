'use client';

import React from 'react';
import { Home, LayoutGrid, Flame, ShoppingCart, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, setIsCartOpen, setSelectedCategory, setIsMobileMenuOpen } = useCart();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
      <div className="grid grid-cols-5 items-center justify-items-center text-[10px] font-medium text-gray-700">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center gap-1 hover:text-[#f48721] transition cursor-pointer"
        >
          <Home className="w-5 h-5 text-[#222831]" />
          <span>হোম</span>
        </button>

        {/* 2. Category - Opens Mobile Catalog Drawer */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-[#f48721] transition cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5 text-[#222831]" />
          <span>ক্যাটাগরি</span>
        </button>

        {/* 3. Special Offers */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('special-offers');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center gap-1 hover:text-red-600 transition cursor-pointer"
        >
          <Flame className="w-5 h-5 text-red-600 fill-red-600" />
          <span className="text-red-600 font-bold">বিশেষ অফার</span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-[#f48721] transition relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-[#222831]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#f48721] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>কার্ট</span>
        </button>

        {/* 5. Call */}
        <a
          href="tel:+8801700000000"
          className="flex flex-col items-center gap-1 text-[#222831] hover:text-[#f48721] transition"
        >
          <PhoneCall className="w-5 h-5 text-[#f48721]" />
          <span>কল করুন</span>
        </a>
      </div>
    </div>
  );
};
