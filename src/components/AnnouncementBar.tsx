'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Phone, MessageCircle, MapPin } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#041f1e] text-white text-xs py-2 px-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Left message */}
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#f48721] shrink-0" />
          <span>সারা দেশে ক্যাশ অন ডেলিভারি | পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা</span>
        </div>

        {/* Right contacts & Track Order */}
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/track"
            className="flex items-center gap-1 text-amber-300 hover:text-white font-bold transition"
          >
            <MapPin className="w-3 h-3 text-[#f48721]" />
            <span>অর্ডার ট্র্যাকিং</span>
          </Link>

          <a
            href="tel:+8801700000000"
            className="flex items-center gap-1.5 hover:text-[#f48721] transition"
          >
            <Phone className="w-3 h-3 text-[#f48721]" />
            <span>হেল্পলাইন: ০১৭০০-০০০০০০</span>
          </a>

          <a
            href="https://wa.me/8801700000000?text=হ্যালো%20উন্নত%20খাবার,%20আমি%20একটি%20অর্ডার%20করতে%20চাই"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-white hover:text-[#f48721] transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>হোয়াটসঅ্যাপে অর্ডার</span>
          </a>
        </div>
      </div>
    </div>
  );
};
