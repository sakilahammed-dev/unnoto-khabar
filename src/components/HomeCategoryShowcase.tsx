'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export interface ShowcaseBadge {
  id: string;
  name: string;
  image: string;
  isOffer?: boolean;
  highlightTag?: string;
}

export const SHOWCASE_CATEGORIES: ShowcaseBadge[] = [
  { id: 'honey', name: 'মধু', image: '/categories/emblems/honey_v2.png' },
  { id: 'honey-nuts', name: 'হানি নাটস', image: '/categories/emblems/honey-nuts.png' },
  { id: 'whole-nuts', name: 'বাদাম', image: '/categories/emblems/whole-nuts.png' },
  { id: 'dates', name: 'খেজুর', image: '/categories/emblems/dates_v2.png' },
  { id: 'oil-ghee', name: 'তেল ও ঘি', image: '/categories/emblems/oil-ghee.png' },
  { id: 'shutki-balachaw', name: 'শুঁটকি', image: '/categories/emblems/shutki-balachaw.png' },
  { id: 'health-mix', name: 'স্বাস্থ্য মিক্স', image: '/categories/emblems/health-mix.png' },
  { id: 'super-seeds', name: 'সুপার সিডস', image: '/categories/emblems/super-seeds.png' },
  { id: 'pickles-spices', name: 'আচার ও মসলা', image: '/categories/emblems/pickles-spices.png' },
  {
    id: 'special-offers',
    name: 'বিশেষ অফার',
    image: '/categories/emblems/special-offers.png',
    isOffer: true,
    highlightTag: 'অফার',
  },
];

export const HomeCategoryShowcase: React.FC = () => {
  const { setSelectedCategory, navigateToCategory } = useCart();
  const [visibleCount, setVisibleCount] = useState<number>(7);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  // ডিসপ্লে সাইজ অনুযায়ী ভিজিবল ক্যাটাগরি কাউন্ট (ডেসকটপে ঠিক ৭টি, ট্যাবলেটে ৫টি, মোবাইলে ৪টি)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(7);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(5);
      } else {
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // পেজ ইনডেক্স ক্যালকুলেশন: ডেসকটপে প্রথম ৭টি [০] এবং বাকিগুলো সহ ৭টি [৩]
  const getPageIndices = useCallback(() => {
    const total = SHOWCASE_CATEGORIES.length; // 10
    if (visibleCount === 7) {
      return [0, total - 7]; // [0, 3] -> প্রতিবারে ঠিক ৭টি করে শো করবে
    } else if (visibleCount === 5) {
      return [0, total - 5]; // [0, 5] -> ৫টি করে
    } else {
      return [0, 3, total - 4]; // [0, 3, 6] -> মোবাইলে ৪টি করে
    }
  }, [visibleCount]);

  const pageIndices = getPageIndices();

  // পরবর্তী সেটে জাম্প
  const handleNext = useCallback(() => {
    const pages = getPageIndices();
    setCurrentIndex((prev) => {
      const currentIdxInPages = pages.indexOf(prev);
      if (currentIdxInPages === -1) return pages[0];
      const nextIdx = (currentIdxInPages + 1) % pages.length;
      return pages[nextIdx];
    });
  }, [getPageIndices]);

  // পূর্ববর্তী সেটে জাম্প
  const handlePrev = useCallback(() => {
    const pages = getPageIndices();
    setCurrentIndex((prev) => {
      const currentIdxInPages = pages.indexOf(prev);
      if (currentIdxInPages === -1) return pages[0];
      const prevIdx = (currentIdxInPages - 1 + pages.length) % pages.length;
      return pages[prevIdx];
    });
  }, [getPageIndices]);

  // অটো ৫ সেকেন্ড পর পর লাফ মেরে চেঞ্জ হবে
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  // ক্লিক হ্যান্ডলার: নির্দিষ্ট ক্যাটাগরিতে সরাসরি নেভিগেশন
  const handleCategoryClick = (categoryId: string) => {
    navigateToCategory(categoryId);
  };

  // মোবাইল টাচ সোয়াইপ হ্যান্ডলার
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const itemWidthPercent = 100 / visibleCount;
  const currentTranslateX = currentIndex * itemWidthPercent;

  return (
    <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
      {/* ব্যানার স্কেলের সাথে পুরোপুরি মেলানো ফুল উইডথ কন্টেইনার */}
      <div className="w-full relative">
        <div
          className="relative rounded-2xl bg-gradient-to-b from-amber-50/90 via-white/95 to-amber-50/80 px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 border border-amber-200/70 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.18)] backdrop-blur-md"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
        {/* ব্যাকগ্রাউন্ড সফট গ্লো */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-amber-400/10 blur-2xl rounded-full" />

        {/* বাম দিকের অরেঞ্জ গোল বাটন (Left Arrow - ঘরের বাজার স্টাইল) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="পূর্ববর্তী ক্যাটাগরি"
          className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#f48721] hover:bg-[#d97116] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white select-none"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[2.5]" />
        </button>

        {/* ডান দিকের অরেঞ্জ গোল বাটন (Right Arrow - ঘরের বাজার স্টাইল) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="পরবর্তী ক্যাটাগরি"
          className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#f48721] hover:bg-[#d97116] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white select-none"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[2.5]" />
        </button>

        {/* ক্যারোসেল ভিউপোর্ট */}
        <div className="overflow-hidden w-full relative z-10 py-1">
          <div
            className="flex transition-transform duration-600 ease-out will-change-transform"
            style={{
              transform: `translate3d(-${currentTranslateX}%, 0, 0)`,
            }}
          >
            {SHOWCASE_CATEGORIES.map((item) => {
              const isOffer = item.isOffer;

              return (
                <div
                  key={item.id}
                  style={{
                    width: `${itemWidthPercent}%`,
                    minWidth: `${itemWidthPercent}%`,
                  }}
                  className="shrink-0 flex flex-col items-center justify-start text-center px-1 sm:px-2"
                >
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(item.id)}
                    title={`${item.name} দেখুন`}
                    className="group flex flex-col items-center justify-start w-full text-center transition-all duration-300 focus:outline-hidden cursor-pointer select-none"
                  >
                    {/* ৪ কোণা (Squircle) ব্যাজ র‍্যাপার উইথ গোল্ডেন লাইটিং রিং */}
                    <div className="relative flex items-center justify-center">
                      {/* লাইটিং অরা / পালসিং হ্যালো */}
                      <div
                        className={`absolute -inset-1.5 rounded-2xl transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:scale-105 blur-[4px] ${
                          isOffer
                            ? 'bg-gradient-to-tr from-red-500 via-amber-400 to-orange-500 animate-pulse'
                            : 'bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 group-hover:blur-[6px]'
                        }`}
                      />

                      {/* ব্যাজ ইমেজ কন্টেইনার (৪ কোণা স্কোয়ার্কল কার্ড - স্কেল অনুযায়ী বড় ও স্পষ্ট) */}
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[70px] lg:h-[70px] xl:w-[78px] xl:h-[78px] 2xl:w-[82px] 2xl:h-[82px] rounded-2xl bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 active:scale-95 ${
                          isOffer
                            ? 'ring-2 ring-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                            : 'ring-1.5 ring-amber-400/80 group-hover:ring-2 group-hover:ring-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.22)]'
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={140}
                          height={140}
                          priority
                          className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* অফার ব্যাজ ট্যাগ */}
                        {item.highlightTag && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[8.5px] sm:text-[10px] font-bold rounded-full shadow-xs flex items-center gap-0.5 border border-white animate-bounce">
                            <Sparkles className="w-2 h-2 text-yellow-200" />
                            {item.highlightTag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ক্যাটাগরি বাংলা নাম */}
                    <span
                      className={`mt-1 sm:mt-1.5 min-h-[18px] sm:min-h-[20px] flex items-center justify-center text-center text-[11px] sm:text-xs md:text-[13px] lg:text-sm leading-tight font-bold tracking-tight transition-colors duration-200 ${
                        isOffer
                          ? 'text-red-600 font-extrabold group-hover:text-red-700'
                          : 'text-gray-800 group-hover:text-amber-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* নিচের পেজিনেশন ডট (ক্যারোসেল ইনডিকেটর) */}
        <div className="flex items-center justify-center gap-1.5 mt-0.5 sm:mt-1">
          {pageIndices.map((idx, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-5 h-1.5 bg-[#f48721]'
                  : 'w-1.5 h-1.5 bg-amber-300 hover:bg-amber-400'
              }`}
              aria-label={`ক্যাটাগরি পেজ ${i + 1}`}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

