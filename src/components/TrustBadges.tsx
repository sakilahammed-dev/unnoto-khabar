'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw, HeartHandshake } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <section id="trust-section" className="py-10 bg-[#fff5f7] border-b border-pink-100">
      <div className="max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222831]">
            কেন উন্নত খাবার বেছে নেবেন?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            আপনার পরিবারের সুস্বাস্থ্যের নিশ্চয়তায় খাঁটি খাবারের প্রতিশ্রুতি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-pink-100 flex flex-col items-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f48721] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#222831]">১০০% ল্যাব টেস্টেড খাঁটি</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              নিজস্ব তত্ত্বাবধানে পরীক্ষা করে সর্বোচ্চ বিশুদ্ধতা নিশ্চিত করা হয়।
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-pink-100 flex flex-col items-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f48721] flex items-center justify-center mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#222831]">ক্যাশ অন ডেলিভারি</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              সারা দেশে পার্সেল হাতে পেয়ে গুণগত মান দেখে মূল্য পরিশোধ করুন।
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-pink-100 flex flex-col items-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f48721] flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#222831]">সহজ রিটার্ন পলিসি</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              কোনো কারণে সন্তুষ্ট না হলে ৭ দিনের মধ্যে পরিবর্তন বা মানিব্যাকের সুযোগ।
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-pink-100 flex flex-col items-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f48721] flex items-center justify-center mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#222831]">সরাসরি মৌয়াল ও খামারি থেকে</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              মাঝের দালাল ছাড়া সরাসরি প্রাকৃতিক উৎস থেকে খাবার সংগ্রহ।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
