'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  Home,
  User, 
  ChevronRight, 
  X, 
  Flame, 
  Heart, 
  HelpCircle, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Master Categories matching Ghorer Bazar catalog flow
const MOBILE_CATALOG_LIST = [
  { id: 'honey', name: 'মধু (Natural Honey)' },
  { id: 'honey-nuts', name: 'হানি নাটস (Honey Nuts)' },
  { id: 'whole-nuts', name: 'বাদাম (Premium Nuts)' },
  { id: 'dates', name: 'খেজুর (Royal Dates)' },
  { id: 'oil-ghee', name: 'তেল ও ঘি (Oils & Ghee)' },
  { id: 'shutki-balachaw', name: 'শুঁটকি (Dry Fish & Balachaw)' },
  { id: 'health-mix', name: 'স্বাস্থ্য মিক্স (Health Mix)' },
  { id: 'super-seeds', name: 'সুপার সিডস (Super Seeds)' },
  { id: 'pickles-spices', name: 'আচার ও মসলা (Pickles & Spices)' },
];

export const MobileMenuDrawer: React.FC = () => {
  const { 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    selectedCategory, 
    setSelectedCategory,
    navigateToCategory,
    cartCount,
    setIsCartOpen
  } = useCart();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  const handleSelectCategory = (catId: string | null) => {
    setIsMobileMenuOpen(false);
    if (!catId) {
      setSelectedCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToCategory(catId);
    }
  };

  const handleSpecialOffers = () => {
    setIsMobileMenuOpen(false);
    navigateToCategory('special-offers');
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* 1. Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Top-right close button outside drawer on backdrop */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(false)}
        className="fixed top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition cursor-pointer"
        aria-label="বন্ধ করুন"
      >
        <X className="w-8 h-8 drop-shadow" />
      </button>

      {/* 3. Solid Side Drawer Panel (Exact Ghorer Bazar Architecture) */}
      <div 
        className="relative w-[82%] max-w-[340px] h-full shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-250 select-none"
        style={{ backgroundColor: '#f4f5f7' }}
      >
        <div className="p-4 space-y-4">
          {/* A. Top Profile / Brand Banner (Ghorer Bazar Orange Card) */}
          <div 
            onClick={() => handleSelectCategory(null)}
            className="bg-gradient-to-r from-[#f48721] to-[#ea580c] text-white p-3.5 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer hover:brightness-105 transition"
            title="হোম পেজে যান"
          >
            <div className="w-11 h-11 rounded-full bg-white text-[#f48721] flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-6 h-6 text-[#f48721]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm leading-tight truncate">উন্নত খাবার</h4>
              <p className="text-[11px] text-orange-100 font-medium">সুস্থ জীবনের খাঁটি আহার</p>
            </div>
          </div>

          {/* B. All Catalogs / Categories Card (Ghorer Bazar Style White Box with Chevron List) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden divide-y divide-gray-100">
            {/* 0. Home Page Entry */}
            <button
              type="button"
              onClick={() => handleSelectCategory(null)}
              className={`w-full py-3 px-3.5 flex items-center justify-between text-left transition cursor-pointer group ${
                selectedCategory === null
                  ? 'bg-orange-50 text-[#f48721] font-bold'
                  : 'text-gray-800 hover:bg-orange-50/50 hover:text-[#f48721]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                  selectedCategory === null
                    ? 'bg-[#f48721] text-white shadow-2xs'
                    : 'bg-orange-100/80 text-[#f48721] group-hover:bg-[#f48721] group-hover:text-white'
                }`}>
                  <Home className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  হোম পেজ (Home Page)
                </span>
              </div>
              <ChevronRight 
                className={`w-4 h-4 transition ${
                  selectedCategory === null ? 'text-[#f48721]' : 'text-gray-400 group-hover:text-[#f48721]'
                }`} 
              />
            </button>

            {/* 1. Special Offer Zone */}
            <button
              type="button"
              onClick={handleSpecialOffers}
              className={`w-full py-3 px-3.5 flex items-center justify-between text-left transition cursor-pointer group ${
                selectedCategory === 'special-offers'
                  ? 'bg-red-50 text-red-600 font-bold'
                  : 'text-gray-800 hover:bg-orange-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-xs sm:text-sm font-bold text-red-600">
                  বিশেষ অফার
                </span>
              </div>
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                HOT
              </span>
            </button>

            {/* 2. All 9 Master Categories */}
            {MOBILE_CATALOG_LIST.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full py-2.5 px-3.5 flex items-center justify-between text-left transition cursor-pointer group ${
                    isActive
                      ? 'bg-orange-50 text-[#f48721] font-bold'
                      : 'text-gray-700 hover:bg-orange-50/50 hover:text-[#f48721]'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium">
                    {cat.name}
                  </span>
                  <ChevronRight 
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-[#f48721]' : 'text-gray-400 group-hover:text-[#f48721]'
                    }`} 
                  />
                </button>
              );
            })}

            {/* 3. All Products Entry */}
            <button
              type="button"
              onClick={() => handleSelectCategory(null)}
              className={`w-full py-3 px-3.5 flex items-center justify-between text-left transition cursor-pointer font-semibold ${
                selectedCategory === null
                  ? 'bg-orange-50 text-[#f48721] font-bold'
                  : 'text-gray-800 hover:bg-orange-50/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span className="text-xs sm:text-sm">সকল পণ্য (All Products)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* C. Quick Links Card (Ghorer Bazar Style) */}
          <div>
            <div className="flex flex-col gap-1 mb-2 px-1">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Quick Links
              </span>
              <div className="w-8 h-0.5 bg-[#f48721] rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-3 space-y-2.5 text-xs text-gray-700">
              {/* Wishlist / Cart */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center justify-between w-full hover:text-[#f48721] transition cursor-pointer py-1"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <span>আমার শপিং কার্ট</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#f48721] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* FAQs */}
              <button
                type="button"
                onClick={() => scrollToSection('trust-section')}
                className="flex items-center gap-2.5 w-full hover:text-[#f48721] transition cursor-pointer py-1 text-left"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <span>সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (Faqs)</span>
              </button>

              {/* About Us */}
              <button
                type="button"
                onClick={() => scrollToSection('reviews-section')}
                className="flex items-center gap-2.5 w-full hover:text-[#f48721] transition cursor-pointer py-1 text-left"
              >
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>আমাদের সম্পর্কে (About Us)</span>
              </button>

              {/* Hotline Call */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <a
                  href="tel:+8801700000000"
                  className="flex items-center gap-2 font-bold text-[#f48721] hover:underline"
                >
                  <PhoneCall className="w-4 h-4 text-[#f48721]" />
                  <span>০১৭০০-০০০০০০</span>
                </a>
                <span className="text-[10px] text-gray-400">২৪/৭ সাপোর্ট</span>
              </div>
            </div>
          </div>
        </div>

        {/* D. Footer Brand Note */}
        <div className="p-4 border-t border-gray-200/80 text-[11px] text-gray-500 text-center">
          <p className="font-semibold text-gray-700">উন্নত খাবার (Unnoto Khabar)</p>
          <p className="text-[10px] text-gray-400 mt-0.5">১০০% প্রাকৃতিক ও নির্ভেজাল আহারের প্রতিশ্রুতি</p>
        </div>
      </div>
    </div>
  );
};
