'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame, Sparkles } from 'lucide-react';
import { getOfferProducts } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';

const toBanglaDigits = (num: number) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num)
    .padStart(2, '0')
    .split('')
    .map((d) => banglaDigits[Number(d)] || d)
    .join('');
};

const getTargetDeadline = () => {
  const now = new Date();
  const target = new Date(now);
  // Default target: রাত ১১:৫৯:৫৯ (Midnight)
  target.setHours(23, 59, 59, 999);
  return target.getTime();
};

const calculateRemainingTime = (targetTimestamp: number) => {
  const now = Date.now();
  const diff = Math.max(0, targetTimestamp - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
};

export const OfferZone: React.FC = () => {
  const offerProducts = getOfferProducts();

  const [hasMounted, setHasMounted] = useState(false);
  const [targetTime, setTargetTime] = useState<number>(() => getTargetDeadline());
  const [timeLeft, setTimeLeft] = useState(() => calculateRemainingTime(targetTime));

  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => {
      const remaining = calculateRemainingTime(targetTime);
      if (remaining.totalSeconds <= 0) {
        const nextTarget = getTargetDeadline();
        setTargetTime(nextTarget);
        setTimeLeft(calculateRemainingTime(nextTarget));
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <section id="offer-zone-section" className="py-8 bg-white border-b border-pink-100 scroll-mt-20">
      <div className="max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        {/* Offer Header Banner */}
        <div className="bg-[#fff9f5] border border-orange-200/90 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-7 rounded-full bg-red-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222831] flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600 fill-red-600" />
              <span>বিশেষ অফার</span>
            </h2>
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {offerProducts.length} টি অফার
            </span>
          </div>

          {/* Clean Countdown Box */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-orange-200 shadow-2xs shrink-0">
            <Clock className="w-4 h-4 text-[#f48721] shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-700 whitespace-nowrap hidden sm:inline">
                অফার শেষ হতে:
              </span>
              <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-red-600">
                <span className="bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono">
                  {hasMounted ? toBanglaDigits(timeLeft.hours) : '০৯'} ঘণ্টা
                </span>
                <span className="text-red-400 font-bold">:</span>
                <span className="bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono">
                  {hasMounted ? toBanglaDigits(timeLeft.minutes) : '৪৩'} মি
                </span>
                <span className="text-red-400 font-bold">:</span>
                <span className="bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono">
                  {hasMounted ? toBanglaDigits(timeLeft.seconds) : '০০'} সে
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Special Offer Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 max-w-4xl mx-auto gap-3 sm:gap-6">
          {offerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
