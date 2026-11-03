'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { MASTER_CATEGORIES, getProductsByCategory, getOfferProducts, searchProducts } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';
import { Search, X } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useCart();

  const isSpecialOffers = selectedCategory === 'special-offers';
  const offerProducts = getOfferProducts();

  // ১. সার্চ ফলাফল ভিউ (যখন সার্চ বারে কিছু লিখে এন্টার বা সার্চ দেওয়া হবে)
  if (searchQuery && searchQuery.trim().length > 0) {
    const searchResults = searchProducts(searchQuery);

    return (
      <section id="catalog-products-section" className="py-6 sm:py-10 bg-white/70 backdrop-blur-xs min-h-[60vh] scroll-mt-20">
        <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
          {/* সার্চ হেডার */}
          <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f48721]">সার্চ ফলাফল</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-500">মোট {searchResults.length}টি পণ্য পাওয়া গেছে</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#222831] mt-1">
                &ldquo;{searchQuery}&rdquo;
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="self-start sm:self-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
              <span>সার্চ মুছুন (সকল পণ্য দেখুন)</span>
            </button>
          </div>

          {/* প্রোডাক্ট গ্রিড */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-xl mx-auto shadow-xs">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">
                দুঃখিত, &ldquo;{searchQuery}&rdquo; সম্পর্কিত কোনো পণ্য পাওয়া যায়নি।
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                বানানটি সঠিক আছে কি না দেখুন অথবা নিচের জনপ্রিয় পণ্যগুলো দেখতে পারেন:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['মধু', 'হানি নাটস', 'আজওয়া খেজুর', 'গাওয়া ঘি', 'সরিষার তেল', 'চিয়া সিড', 'আমের আচার'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f48721] text-xs font-bold rounded-lg border border-orange-200 transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-6 px-5 py-2.5 bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                সব পণ্য দেখুন
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ২. বিশেষ অফার ভিউ (শুধুই যখন বিশেষ অফারে ক্লিক করা হবে)
  if (isSpecialOffers) {
    return (
      <section id="catalog-products-section" className="py-6 sm:py-10 bg-white/70 backdrop-blur-xs min-h-[60vh]">
        <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
          {/* বিশেষ অফার হেডার: সাধারণ, পরিচ্ছন্ন ও নিচে আন্ডারলাইন */}
          <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-2.5 sm:pb-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#222831]">
              বিশেষ অফার
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              সীমিত সময়ের জন্য বাছাইকৃত খাদ্যে আকর্ষণীয় ছাড়!
            </p>
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

  // ৩. নির্দিষ্ট ক্যাটাগরি ভিউ (যে ক্যাটাগরিতে ক্লিক করবে শুধু সেই ক্যাটাগরির পণ্যগুলোই শো করবে)
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

  // ৪. হোম পেজ ভিউ: সকল পণ্য হেডলাইন এবং ক্যাটাগরি অনুযায়ী সাজানো সব পণ্যের লিস্ট
  return (
    <section id="catalog-products-section" className="py-8 sm:py-12 bg-white/70 backdrop-blur-xs min-h-[60vh]">
      <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        {/* সকল পণ্য মাস্টার হেডলাইন */}
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
