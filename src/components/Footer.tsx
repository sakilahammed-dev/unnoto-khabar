'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { MASTER_CATEGORIES } from '@/data/catalog';
import { useCart } from '@/context/CartContext';

export const Footer: React.FC = () => {
  const { navigateToCategory } = useCart();

  const handleCategoryClick = (id: string) => {
    navigateToCategory(id);
  };

  return (
    <footer className="bg-gradient-to-b from-[#f8e8eb] via-[#f5e0e4] to-[#ebd5da] text-gray-700 pt-12 pb-20 md:pb-8 border-t-2 border-[#e2bfc6] shadow-[0_-4px_24px_rgba(226,191,198,0.25)]">
      <div className="max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-1.5 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#ddb4bc]">
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div>
              <div className="relative h-11 sm:h-12 w-40 sm:w-44 shrink-0 mb-1.5">
                <Image
                  src="/logo_uk_v2.png"
                  alt="উন্নত খাবার"
                  fill
                  sizes="176px"
                  className="object-contain object-left"
                />
              </div>
              <span className="text-xs text-emerald-800 font-bold block tracking-wide">
                সুস্থ জীবনের খাঁটি আহার
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              উন্নত খাবার একটি নির্ভরযোগ্য খাদ্য সরবরাহকারী প্রতিষ্ঠান। আমাদের লক্ষ্য প্রতিটি পরিবারের নিকট শতভাগ নির্ভেজাল, স্বাস্থ্যসম্মত ও খাঁটি খাদ্যপণ্য পৌঁছে দেওয়া।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-[#f48721] text-white flex items-center justify-center transition shadow-xs"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <span className="text-xs text-gray-600 font-medium">
                ট্রেড লাইসেন্স নং: TRAD/DSCC/034291/2025
              </span>
            </div>
          </div>

          {/* Col 2: Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-gray-900 mb-3 border-b-2 border-amber-500/60 pb-1 inline-block">
              ক্যাটাগরি সমূহ
            </h4>
            <ul className="space-y-1.5 text-xs">
              {MASTER_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className="text-gray-700 hover:text-[#f48721] hover:font-bold transition-all text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {cat.banglaName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-900 mb-3 border-b-2 border-amber-500/60 pb-1 inline-block">
              গ্রাহক সেবা
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>
                <Link href="#trust-section" className="hover:text-[#f48721] hover:font-semibold transition">
                  আমাদের বৈশিষ্ট্য
                </Link>
              </li>
              <li>
                <Link href="#offer-zone-section" className="hover:text-[#f48721] hover:font-semibold transition">
                  অফার জোন
                </Link>
              </li>
              <li>
                <Link href="#reviews-section" className="hover:text-[#f48721] hover:font-semibold transition">
                  গ্রাহক রিভিউ
                </Link>
              </li>
              <li>
                <span className="hover:text-[#f48721] transition cursor-pointer">
                  ডেলিভারি পলিসি
                </span>
              </li>
              <li>
                <span className="hover:text-[#f48721] transition cursor-pointer">
                  রিটার্ন ও রিফান্ড নীতি
                </span>
              </li>
              <li>
                <span className="hover:text-[#f48721] transition cursor-pointer">
                  গোপনীয়তা নীতি
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpline (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-gray-900 mb-3 border-b-2 border-amber-500/60 pb-1 inline-block">
              যোগাযোগ
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#f48721]" />
                </div>
                <div>
                  <span className="block text-gray-500 text-[11px]">হেল্পলাইন:</span>
                  <a
                    href="tel:+8801700000000"
                    className="font-bold text-gray-900 hover:text-[#f48721] transition text-sm"
                  >
                    ০১৭০০-০০০০০০
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <span className="block text-gray-500 text-[11px]">WhatsApp:</span>
                  <a
                    href="https://wa.me/8801700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 font-semibold hover:text-emerald-700 transition"
                  >
                    ০১৭০০-০০০০০০
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#f48721]" />
                </div>
                <div>
                  <span className="block text-gray-500 text-[11px]">ইমেইল:</span>
                  <a
                    href="mailto:support@unnotokhabar.com"
                    className="text-gray-700 hover:text-[#f48721] font-medium transition"
                  >
                    support@unnotokhabar.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f48721]" />
                </div>
                <div>
                  <span className="block text-gray-500 text-[11px]">ঠিকানা:</span>
                  <span className="text-gray-700 font-medium">মিরপুর-১০, ঢাকা-১২১৬, বাংলাদেশ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600 text-center md:text-left">
          <p>
            © {new Date().getFullYear()} <strong className="text-gray-900 font-bold">উন্নত খাবার (Unnoto Khabar)</strong>. সর্বস্বত্ব সংরক্ষিত।
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">পেমেন্ট মেথড:</span>
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <span className="bg-white text-gray-800 px-2.5 py-0.5 rounded-md border border-[#ddb4bc] shadow-2xs font-semibold">বিকাশ</span>
              <span className="bg-white text-gray-800 px-2.5 py-0.5 rounded-md border border-[#ddb4bc] shadow-2xs font-semibold">নগদ</span>
              <span className="bg-white text-gray-800 px-2.5 py-0.5 rounded-md border border-[#ddb4bc] shadow-2xs font-semibold">রকেট</span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-md shadow-2xs font-bold">ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
