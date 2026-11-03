'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, X, ChevronRight, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { searchProducts } from '@/data/catalog';
import { Product } from '@/types';

const NAV_CATEGORIES = [
  { id: 'honey', name: 'মধু' },
  { id: 'honey-nuts', name: 'হানি নাটস' },
  { id: 'whole-nuts', name: 'বাদাম' },
  { id: 'dates', name: 'খেজুর' },
  { id: 'oil-ghee', name: 'তেল ও ঘি' },
  { id: 'shutki-balachaw', name: 'শুঁটকি' },
  { id: 'health-mix', name: 'স্বাস্থ্য মিক্স' },
  { id: 'super-seeds', name: 'সুপার সিডস' },
  { id: 'pickles-spices', name: 'আচার ও মসলা' },
];

export const Header: React.FC = () => {
  const { 
    cartCount, 
    subtotal, 
    setIsCartOpen, 
    openQuickOrder, 
    selectedCategory, 
    setSelectedCategory,
    navigateToCategory,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    searchQuery,
    setSearchQuery,
  } = useCart();

  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeNavCategory, setActiveNavCategory] = useState<string | null>(null);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Sync searchInput when searchQuery is cleared elsewhere (e.g. from Clear button on page)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Live search handler
  useEffect(() => {
    const q = searchInput.trim();
    if (q.length >= 1) {
      const results = searchProducts(q);
      setSearchResults(results.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchInput]);

  // Click outside search results to close on both Desktop & Mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopSearchRef.current?.contains(target);
      const inMobile = mobileSearchRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Scroll spy to highlight active category in navbar when on home page
  useEffect(() => {
    if (selectedCategory !== null || searchQuery.trim().length > 0) {
      setActiveNavCategory(null);
      return;
    }

    const updateActiveNav = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const firstCatEl = document.getElementById('category-honey');

      // ১. পেজের শীর্ষে বা প্রথম ক্যাটাগরি (মধু)-এর উপরে থাকলে সর্বদা 'হোম' সিলেক্টেড থাকবে (null)
      if (scrollY < 200) {
        setActiveNavCategory(null);
        return;
      }

      if (firstCatEl) {
        const firstRect = firstCatEl.getBoundingClientRect();
        if (firstRect.top > 180) {
          setActiveNavCategory(null);
          return;
        }
      }

      // ২. নিচে স্ক্রল করার সময় বর্তমানে স্ক্রিনে থাকা নির্দিষ্ট ক্যাটাগরি নির্ধারণ
      const activationOffset = 180;
      let matchedCategory: string | null = null;

      for (const cat of NAV_CATEGORIES) {
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= activationOffset && rect.bottom > 80) {
            matchedCategory = cat.id;
          }
        }
      }

      if (matchedCategory) {
        setActiveNavCategory(matchedCategory);
      } else if (firstCatEl && firstCatEl.getBoundingClientRect().top > 180) {
        setActiveNavCategory(null);
      }
    };

    updateActiveNav();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveNav();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [selectedCategory, searchQuery]);

  // Handle Search Submission (Enter or Click)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      setSearchQuery(query);
      setIsSearchFocused(false);
      setSelectedCategory(null);
      const el = document.getElementById('catalog-products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  // Select item from live dropdown
  const handleSelectSearchResult = (product: Product) => {
    setIsSearchFocused(false);
    const primaryVariant = product.variants[0];
    openQuickOrder({
      id: `${product.id}_${primaryVariant.id}`,
      productId: product.id,
      productName: product.banglaName,
      imageUrl: product.imageUrl,
      variantId: primaryVariant.id,
      weight: primaryVariant.weight,
      price: primaryVariant.price,
      originalPrice: primaryVariant.originalPrice,
      quantity: 1,
    });
  };

  const handleHomeClick = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSearchInput('');
    setActiveNavCategory(null);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryNavClick = (catId: string) => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    setSearchInput('');
    setActiveNavCategory(catId);
    navigateToCategory(catId);
  };

  const handleSpecialOffersClick = () => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    setSearchInput('');
    setActiveNavCategory(null);
    navigateToCategory('special-offers');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="w-full max-w-[1520px] 2xl:max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-15 lg:h-16 gap-2">
          {/* 1. Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-md text-gray-700 hover:bg-pink-50 lg:hidden cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleHomeClick();
              }}
              className="flex items-center py-1 cursor-pointer"
            >
              <div className="relative h-10 w-32 sm:h-11 sm:w-38 xl:h-12 xl:w-44 shrink-0">
                <Image
                  src="/logo_uk_v2.png"
                  alt="উন্নত খাবার"
                  fill
                  sizes="(max-width: 640px) 130px, 176px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* 2. Center: All Categories in Top Navigation Line */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3 text-[13px] xl:text-[14.5px] 2xl:text-[15px] font-bold text-[#222831]">
            <button
              type="button"
              onClick={handleHomeClick}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
                selectedCategory === null && !searchQuery
                  ? 'text-[#f48721] bg-orange-50 font-extrabold shadow-2xs'
                  : 'text-[#222831] hover:text-[#f48721] hover:bg-pink-50/80'
              }`}
            >
              সকল পণ্য
            </button>
            {NAV_CATEGORIES.map((cat) => {
              const isActive =
                selectedCategory === cat.id ||
                (selectedCategory === null && !searchQuery && activeNavCategory === cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryNavClick(cat.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#f48721] bg-orange-50 font-extrabold shadow-2xs'
                      : 'text-[#222831] hover:text-[#f48721] hover:bg-pink-50/80 font-bold'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleSpecialOffersClick}
              className={`px-3 xl:px-3.5 2xl:px-4 py-1.5 rounded-full text-xs xl:text-[13px] 2xl:text-sm font-extrabold transition whitespace-nowrap shrink-0 ml-1 cursor-pointer shadow-xs flex items-center justify-center ${
                selectedCategory === 'special-offers'
                  ? 'bg-red-700 text-white ring-2 ring-red-400'
                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-105 text-white'
              }`}
            >
              <span>বিশেষ অফার</span>
            </button>
          </nav>

          {/* 3. Right: Compact Search Bar & Shopping Cart */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Highlighted Search Bar (Desktop) */}
            <div ref={desktopSearchRef} className="hidden md:block relative w-40 lg:w-48 xl:w-56">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center group">
                <input
                  type="text"
                  placeholder="পণ্য সার্চ করুন..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-white border-2 border-black hover:border-gray-800 focus:border-[#1b5e20] focus:ring-2 focus:ring-green-100 rounded-full py-1.5 pl-3.5 pr-14 text-xs xl:text-[13px] font-semibold text-[#222831] placeholder:text-gray-500 shadow-2xs transition"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-8 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                    title="মুছুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="absolute right-1 w-7 h-7 bg-[#222831] hover:bg-black text-white rounded-full flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                  aria-label="সার্চ করুন"
                  title="সার্চ করুন"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>

              {/* Desktop Search Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-full right-0 mt-1.5 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-2.5 border-b border-gray-100 text-xs font-semibold text-gray-500 bg-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-700">পণ্য তালিকা ({searchResults.length})</span>
                        <span className="text-[11px] text-gray-400">ক্লিক করে অর্ডার করুন</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectSearchResult(product)}
                            className="p-2.5 hover:bg-orange-50/50 cursor-pointer flex items-center justify-between transition group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-10 h-10 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.banglaName}
                                  fill
                                  sizes="40px"
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="pr-1">
                                <h4 className="text-xs font-bold text-[#222831] line-clamp-1 group-hover:text-[#f48721] transition">
                                  {product.banglaName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-extrabold text-[#1b5e20] font-mono">
                                    ৳{product.variants[0].price}
                                  </span>
                                  {product.variants[0].originalPrice > product.variants[0].price && (
                                    <span className="text-[10px] text-gray-400 line-through font-mono">
                                      ৳{product.variants[0].originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#f48721] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full p-2.5 bg-orange-50 hover:bg-orange-100 text-[#f48721] text-xs font-bold text-center border-t border-orange-100 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>&ldquo;{searchInput}&rdquo;-এর সকল ফলাফল দেখুন ({searchResults.length}টি)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : searchInput.trim().length >= 1 ? (
                    <div className="p-4 text-center text-xs text-gray-500 bg-white">
                      <p className="font-bold text-gray-800">কোনো পণ্য পাওয়া যায়নি</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        &ldquo;মধু&rdquo;, &ldquo;খেজুর&rdquo;, &ldquo;বাদাম&rdquo;, &ldquo;তেল&rdquo; ইত্যাদি লিখে খুঁজুন
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Black Bordered Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-black hover:border-gray-800 text-black rounded-full p-2 sm:px-3 sm:py-1.5 xl:px-3.5 shadow-2xs transition cursor-pointer shrink-0 group active:scale-95 mr-0.5 sm:mr-0"
              aria-label="শপিং কার্ট"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-black stroke-[2.2] group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] font-bold text-black">কার্ট</span>
                <span className="font-extrabold text-black mt-0.5 text-xs xl:text-[13px]">৳{subtotal}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div ref={mobileSearchRef} className="pb-3 md:hidden relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="পণ্য সার্চ করুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-white border-2 border-r-0 border-black focus:border-[#1b5e20] rounded-l-full py-2 pl-4 pr-9 text-xs font-semibold text-[#222831] placeholder:text-gray-500 focus:outline-none shadow-2xs"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="মুছুন"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <button
              type="submit"
              className="bg-[#222831] hover:bg-black text-white px-4 py-2.5 rounded-r-full shrink-0 border-2 border-l-0 border-black shadow-2xs cursor-pointer flex items-center justify-center"
              aria-label="সার্চ করুন"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Mobile search dropdown */}
          {isSearchFocused && (
            <div className="mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-2 border-b border-gray-100 text-[11px] font-bold text-gray-500 bg-gray-50 flex justify-between">
                    <span>পণ্য তালিকা ({searchResults.length})</span>
                    <span>অর্ডারের জন্য ট্যাপ করুন</span>
                  </div>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectSearchResult(product)}
                      className="p-2.5 flex items-center justify-between active:bg-orange-50/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                          <Image
                            src={product.imageUrl}
                            alt={product.banglaName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#222831] line-clamp-1">
                            {product.banglaName}
                          </h4>
                          <span className="text-[11px] text-[#1b5e20] font-extrabold font-mono">
                            ৳{product.variants[0].price}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full p-2.5 bg-orange-50 text-[#f48721] text-xs font-bold text-center border-t border-orange-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>&ldquo;{searchInput}&rdquo;-এর সকল ফলাফল দেখুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : searchInput.trim().length >= 1 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-white">
                  <p className="font-bold text-gray-800">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    &ldquo;মধু&rdquo;, &ldquo;খেজুর&rdquo;, &ldquo;বাদাম&rdquo;, &ldquo;তেল&rdquo; লিখে খুঁজুন
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
