'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomeCategoryShowcase } from '@/components/HomeCategoryShowcase';

const RUNNING_TICKER_TEXT =
  '✦ উন্নত খাবার প্ল্যাটফর্মে আপনাকে স্বাগতম। ✦ আজকের বিশেষ অফার: ১ কেজি সুন্দরবনের খাঁটি চাকের মধু কিনলে ২৫% ডিসকাউন্ট এবং সারা দেশে ডেলিভারি চার্জ ফ্রি!';

const BANNERS = [
  {
    id: 1,
    src: '/hero_banner_unnoto_khabar_v5.png',
    alt: 'উন্নত খাবার - সুস্থ জীবনের সমাহার',
    target: 'offer-zone-section',
  },
];

export const HeroBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (BANNERS.length <= 1) return;
    setCurrent((prev) => (prev + 1) % BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    if (BANNERS.length <= 1) return;
    setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  // ৫-৭ সেকেন্ড (৬ সেকেন্ড) পর পর স্বয়ংক্রিয় পরিবর্তন (একাধিক ব্যানার থাকলে)
  useEffect(() => {
    if (isHovered || BANNERS.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden pt-1 sm:pt-1.5 bg-[#fff8fa] border-b border-pink-100">
      {/* ব্যানার লেআউট: হেডারের লোগো (বামে) থেকে কার্ট (ডানে) পর্যন্ত নিখুঁতভাবে মেলানো */}
      <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        {/* ব্যানার গ্রিড: ডেসকটপ ও ল্যাপটপে বামে বড় স্লাইডার (৮ কলাম) এবং ডানে স্থায়ী হানি নাট ব্যানার (৪ কলাম) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* ১. বাম পাশের স্লাইডার ব্যানার (ডেসকটপে স্ক্রিনের বামে চাপানো ৮ কলাম, মোবাইলে ফুল উইডথ) */}
          <div className="w-full lg:col-span-8 flex flex-col">
            <div
              className="relative w-full aspect-[1024/572] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-amber-100/80 bg-[#fff9ed] group select-none flex flex-col"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => scrollTo(BANNERS[current].target)}
              role="region"
              aria-label="হিরো ব্যানার স্লাইডার"
            >
              {/* স্লাইডিং ট্র্যাক: স্প্রিং বাউন্স (লাফ মারা) অ্যানিমেশন সহ */}
              <div
                className="flex w-full h-full"
                style={{
                  transform: `translateX(-${current * 100}%)`,
                  transition:
                    'transform 850ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {BANNERS.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="relative w-full h-full shrink-0 overflow-hidden"
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 960px"
                      className={`object-cover object-center transition-transform duration-700 ease-out ${
                        index === current
                          ? 'scale-100 group-hover:scale-[1.01]'
                          : 'scale-[0.96] opacity-90'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* নেভিগেশন তীর ও ইন্ডিকেটর (শুধুমাত্র একাধিক ব্যানার থাকলে দৃশ্যমান হবে) */}
              {BANNERS.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    aria-label="পূর্ববর্তী ব্যানার"
                    className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md opacity-75 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    aria-label="পরবর্তী ব্যানার"
                    className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md opacity-75 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* ইন্ডিকেটর ডট / ক্যাপসুল (Pagination Indicators) */}
                  <div
                    className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {BANNERS.map((banner, index) => (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => setCurrent(index)}
                        aria-label={`ব্যানার ${index + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          index === current
                            ? 'w-6 sm:w-7 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm'
                            : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/70 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ২. ডান পাশের স্থায়ী হানি নাট ব্যানার (শুধুমাত্র কম্পিউটার এবং ল্যাপটপে শো করবে, মোবাইলে নয়) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col h-full">
            <div
              onClick={() => {
                const el = document.getElementById('catalog-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-200/80 bg-white group select-none flex flex-col justify-between"
              role="button"
              tabIndex={0}
              aria-label="খাঁটি হানি নাট স্পেশাল ব্যানার"
            >
              <Image
                src="/hero_side_banner_honey_nuts_v4.png"
                alt="উন্নত খাবার - খাঁটি হানি নাট"
                fill
                sizes="(max-width: 1280px) 400px, 480px"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* হোম পেজ ক্যাটাগরি শোকেস (১০টি লাক্সারি গোল্ডেন অ্যাম্বলেম ব্যাজ ও লাইটিং সিস্টেম) */}
      <div className="w-full shrink-0 my-0.5 sm:my-1">
        <HomeCategoryShowcase />
      </div>

      {/* রানিং হেডলাইন স্ট্রিপ (স্ক্রিনের একদম নিচে থাকবে) */}
      <div className="w-full shrink-0 border-y border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 py-1.5 sm:py-2 overflow-hidden flex items-center relative shadow-2xs select-none">
        {/* দুই পাশে হালকা ফেড ওভারলে */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-amber-50 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-amber-50 to-transparent z-10" />

        <div className="overflow-hidden w-full relative">
          <div className="animate-marquee-single whitespace-nowrap flex items-center">
            <div className="flex items-center shrink-0">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-[13px] md:text-sm font-bold shadow-xs mr-3">
                বিশেষ অফার
              </span>
              <span className="text-gray-900 tracking-wide text-xs sm:text-[15px] md:text-[16.5px] font-extrabold">
                উন্নত খাবার প্ল্যাটফর্মে আপনাকে স্বাগতম। আজকের বিশেষ অফারে ১ কেজি সুন্দরবনের খাঁটি চাকের মধু কিনলে ২৫% ডিসকাউন্ট এবং সারাদেশে ডেলিভারি চার্জ ফ্রি!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

