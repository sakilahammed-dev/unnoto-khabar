'use client';

import { useCart } from '@/context/CartContext';
import { HeroBanner } from '@/components/HeroBanner';
import { CatalogSection } from '@/components/CatalogSection';
import { TrustBadges } from '@/components/TrustBadges';
import { CustomerReviews } from '@/components/CustomerReviews';

export default function HomePage() {
  const { selectedCategory } = useCart();

  return (
    <div className="flex flex-col w-full min-h-[70vh]">
      {selectedCategory === null ? (
        <>
          {/* ১. পূর্ণাঙ্গ হোম পেজ এক্সপেরিয়েন্স: হিরো ব্যানার, ক্যাটাগরি অনুযায়ী সকল পণ্য, ট্রাস্ট ব্যাজ ও রিভিউ */}
          <HeroBanner />
          <CatalogSection />
          <TrustBadges />
          <CustomerReviews />
        </>
      ) : (
        <>
          {/* ২. নির্দিষ্ট ক্যাটাগরি / বিশেষ অফার ভিউ: শুধু ওই ক্যাটাগরির পণ্য, আর বাকি দুইটা বাদ দিয়ে সরাসরি ফুটার (UK লোগো অংশ) */}
          <CatalogSection />
        </>
      )}
    </div>
  );
}
