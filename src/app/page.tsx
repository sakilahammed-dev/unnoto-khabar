'use client';

import { useCart } from '@/context/CartContext';
import { HeroBanner } from '@/components/HeroBanner';
import { CatalogSection } from '@/components/CatalogSection';
import { TrustBadges } from '@/components/TrustBadges';
import { CustomerReviews } from '@/components/CustomerReviews';

export default function HomePage() {
  const { selectedCategory, searchQuery } = useCart();
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col w-full min-h-[70vh]">
      {isSearching ? (
        /* যখন ইউজার সার্চ করবে, তখন সরাসরি সার্চ ফলাফল দেখাবে */
        <CatalogSection />
      ) : selectedCategory === null ? (
        <>
          {/* ১. পূর্ণাঙ্গ হোম পেজ এক্সপেরিয়েন্স: হিরো ব্যানার, ক্যাটাগরি অনুযায়ী সকল পণ্য, ট্রাস্ট ব্যাজ ও রিভিউ */}
          <HeroBanner />
          <CatalogSection />
          <TrustBadges />
          <CustomerReviews />
        </>
      ) : (
        <>
          {/* ২. নির্দিষ্ট ক্যাটাগরি / বিশেষ অফার ভিউ */}
          <CatalogSection />
        </>
      )}
    </div>
  );
}
