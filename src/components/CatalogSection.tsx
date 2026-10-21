'use client';

import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MASTER_CATEGORIES, getProductsByCategory, getOfferProducts } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';

export const CatalogSection: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useCart();

  const isSpecialOffers = selectedCategory === 'special-offers';
  const offerProducts = getOfferProducts();

  // ১. বিশেষ অফার ভিউ (শুধুই যখন বিশেষ অফারে ক্লিক করা হবে)
  if (isSpecialOffers) {
    return (
      <section id="catalog-products-section" className="py-8 sm:py-12 bg-white/70 backdrop-blur-xs min-h-[60vh]">
        <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="hover:text-[#f48721] flex items-center gap-1 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </button>
            <span>/</span>
            <span className="text-red-600 font-bold">বিশেষ অফার</span>
          </nav>

          <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 border border-red-200/80 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 sm:h-9 rounded-full bg-red-600 shadow-xs shrink-0" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#222831]">
                  বিশেষ অফার ও ডিসকাউন্ট
                </h1>
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {offerProducts.length} টি বিশেষ অফার
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
                সীমিত সময়ের জন্য বাছাইকৃত প্রিমিয়াম খাদ্যে আকর্ষণীয় ছাড়!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="self-start sm:self-auto inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 bg-white hover:bg-orange-50 border border-orange-300 hover:border-[#f48721] px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#f48721]" />
              <span>সকল পণ্যে ফিরে যান</span>
            </button>
          </div>

          {offerProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {offerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <p className="text-gray-500 text-sm">বর্তমানে কোনো বিশেষ অফার নেই।</p>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="mt-4 px-5 py-2.5 bg-[#f48721] text-white text-xs font-bold rounded-xl hover:bg-[#d97116] transition"
              >
                হোম পেজে ফিরে যান
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ২. নির্দিষ্ট ক্যাটাগরি ভিউ (যে ক্যাটাগরিতে ক্লিক করবে শুধু সেই ক্যাটাগরির পণ্যগুলোই শো করবে)
  if (selectedCategory !== null) {
    const currentCategory = MASTER_CATEGORIES.find((c) => c.id === selectedCategory);
    const categoryProducts = getProductsByCategory(selectedCategory);

    return (
      <section id="catalog-products-section" className="py-6 sm:py-10 bg-white/70 backdrop-blur-xs min-h-[60vh]">
        <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
          {/* ক্যাটাগরি হেডার */}
          <div className="mb-4 sm:mb-6 border-b border-gray-200 pb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#222831] pb-1.5 border-b-4 border-[#f48721] inline-block -mb-[5.5px]">
              {currentCategory ? currentCategory.banglaName : 'পণ্যসমূহ'}
            </h1>
          </div>

          {/* শুধু এই ক্যাটাগরির পণ্যগুলো শো করবে */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <p className="text-gray-500 text-sm">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই।</p>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="mt-4 px-5 py-2.5 bg-[#f48721] text-white text-xs font-bold rounded-xl hover:bg-[#d97116] transition"
              >
                হোম পেজে ফিরে যান
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ৩. হোম পেজ ভিউ: সকল পণ্য হেডলাইন এবং ক্যাটাগরি অনুযায়ী সাজানো সব পণ্যের লিস্ট (স্ক্রল করে দেখা যাবে)
  return (
    <section id="catalog-products-section" className="py-8 sm:py-12 bg-white/70 backdrop-blur-xs min-h-[60vh]">
      <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        {/* সকল পণ্য মাস্টার হেডলাইন (সেন্টার ও পিকচারের স্কেল অনুযায়ী ফুল-উইডথ আন্ডারলাইন) */}
        <div className="text-center mb-8 sm:mb-12 pb-3 sm:pb-4 border-b-2 sm:border-b-[3px] border-[#f48721]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#222831] tracking-tight">
            সকল পণ্য
          </h2>
        </div>

        {/* ক্যাটাগরি অনুযায়ী আলাদা আলাদা সেকশন */}
        <div className="space-y-12 sm:space-y-16">
          {MASTER_CATEGORIES.map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-20 md:scroll-mt-24"
              >
                {/* সাধারণ ক্যাটাগরি টাইটেল ও আন্ডারলাইন */}
                <div className="mb-4 sm:mb-6 border-b border-gray-200 pb-1">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#222831] pb-1.5 border-b-4 border-[#f48721] inline-block -mb-[5.5px]">
                    {category.banglaName}
                  </h3>
                </div>

                {/* প্রোডাক্ট গ্রিড */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
