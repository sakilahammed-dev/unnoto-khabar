'use client';

import React from 'react';
import Image from 'next/image';
import { MASTER_CATEGORIES } from '@/data/catalog';
import { useCart } from '@/context/CartContext';
import { Check } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useCart();

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="categories-section" className="py-8 bg-white/70 backdrop-blur-xs border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Ghorer Bazar Style) */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222831]">
            ক্যাটাগরি সমূহ
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            পছন্দের ক্যাটাগরি বেছে নিন এবং সরাসরি পণ্য দেখুন
          </p>
        </div>

        {/* Category Items */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
          {MASTER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center group text-center cursor-pointer transition"
              >
                {/* Circular image badge */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-0.5 border-2 transition-all ${
                    isSelected
                      ? 'border-[#f48721] ring-2 ring-orange-100'
                      : 'border-gray-200 group-hover:border-[#f48721]'
                  }`}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.banglaName}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="bg-[#f48721] text-white p-1 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Clean Title Without Emojis */}
                <h3
                  className={`mt-2 text-xs font-semibold leading-tight line-clamp-2 transition-colors ${
                    isSelected ? 'text-[#f48721]' : 'text-[#222831] group-hover:text-[#f48721]'
                  }`}
                >
                  {cat.banglaName}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Reset button if filtered */}
        {selectedCategory && (
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f48721] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-1.5 rounded transition"
            >
              <span>সকল পণ্য প্রদর্শন করুন</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
