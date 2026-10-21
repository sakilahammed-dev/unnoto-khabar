'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  location: string;
  product: string;
  rating: number;
  date: string;
  comment: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'তানভীর আহমেদ',
    location: 'উত্তরা, ঢাকা',
    product: 'সুন্দরবনের প্রাকৃতিক চাকের কাঁচা মধু',
    rating: 5,
    date: '৩ দিন আগে',
    comment: 'সুন্দরবনের খাঁটি কাঁচা মধুর স্বাদ ও সুবাস অসাধারণ। ফ্রিজে রেখে পরীক্ষা করেছি কোনো চিনি জমেনি। দ্রুত ডেলিভারি পেয়েছি।',
  },
  {
    id: 2,
    name: 'মাহমুদুল হক',
    location: 'পাঁচলাইশ, চট্টগ্রাম',
    product: 'রয়েল হানি নাটস ডিলাক্স',
    rating: 5,
    date: '১ সপ্তাহ আগে',
    comment: 'হানি নাটসের বাদামগুলো অনেক মুচমুচে ও ফ্রেশ। মধুর কোয়ালিটি বেশ ভালো। প্রতিদিন সকালে নাস্তার সাথে খাই।',
  },
  {
    id: 3,
    name: 'ফারহানা ইয়াসমিন',
    location: 'ধানমন্ডি, ঢাকা',
    product: 'কাঠের ঘানিভাঙা সরিষার তেল ও গাওয়া ঘি',
    rating: 5,
    date: '২ সপ্তাহ আগে',
    comment: 'গাওয়া ঘিয়ের সুবাস অনেক সুন্দর, আসল দানাদার ঘি। সরিষার তেলের ঝাঁঝ অরিজিনাল কাঠের ঘানির মতো খাঁটি।',
  },
  {
    id: 4,
    name: 'হাফেজ মাওলানা নূরুল্লাহ',
    location: 'সিলেট সদর',
    product: 'মদিনার আজওয়া খেজুর ও চিয়া সিড',
    rating: 5,
    date: '৩ সপ্তাহ আগে',
    comment: 'আজওয়া খেজুরগুলো নরম এবং মুখে দিলে ভালো লাগে। সুন্নতি আমলের জন্য এই খেজুর ভালো মানের। প্যাকেজিংও সুন্দর ছিল।',
  },
];

export const CustomerReviews: React.FC = () => {
  return (
    <section id="reviews-section" className="py-10 bg-[#fff5f7] border-b border-pink-100">
      <div className="max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222831]">
            গ্রাহক মতামত ও রিভিউ
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            আমাদের খাঁটি খাবার নিয়ে গ্রাহকদের বাস্তব অভিজ্ঞতা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-lg p-4 border border-pink-100 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#f48721] text-[#f48721]" />
                  ))}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#222831]">{rev.name}</span>
                  <span className="flex items-center gap-1 text-[11px] text-green-700 font-medium">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    ভেরিফাইড ক্রেতা
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 flex justify-between">
                  <span>{rev.location}</span>
                  <span>{rev.date}</span>
                </div>
                <p className="text-[11px] text-[#f48721] font-medium mt-1 truncate">
                  {rev.product}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
