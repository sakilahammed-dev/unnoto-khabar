'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { X, ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS_CATALOG } from '@/data/catalog';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    openQuickOrder,
  } = useCart();

  const sliderRef = useRef<HTMLDivElement>(null);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    openQuickOrder(cartItems);
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  // Complementary suggestions for "You May Also Like"
  const suggestedProducts = PRODUCTS_CATALOG.filter(
    (p) => !cartItems.some((ci) => ci.productId === p.id)
  ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white text-[#222831]">
            <h3 className="font-bold text-sm tracking-wider text-gray-900 uppercase">
              SHOPPING CART
            </h3>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black transition cursor-pointer"
              aria-label="Close"
            >
              <span>Close</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-[#222831]">আপনার কার্ট বর্তমানে খালি</h4>
                <p className="text-xs text-gray-500 mt-1">
                  পছন্দের পণ্য যোগ করে অর্ডার করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-[#f48721] hover:bg-[#d97116] text-white font-semibold text-xs px-5 py-2 rounded transition cursor-pointer"
                >
                  পণ্য দেখুন
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3"
                >
                  {/* Left: Square Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-white p-1">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>

                  {/* Middle: Title & Equation */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#222831] truncate leading-tight">
                      {item.productName}
                    </h4>

                    {/* Stepper & Equation */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="inline-flex items-center border border-gray-200 rounded overflow-hidden bg-white text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 font-bold transition cursor-pointer select-none"
                          aria-label="কমান"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold text-gray-800 text-xs select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 font-bold transition cursor-pointer select-none"
                          aria-label="বাড়ান"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        × ৳{item.price.toLocaleString('en-US')}.00 = ৳{(item.price * item.quantity).toLocaleString('en-US')}.00
                      </span>
                    </div>
                  </div>

                  {/* Right: Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 p-1 transition cursor-pointer shrink-0"
                    aria-label="মুছে ফেলুন"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary & Suggestions */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-4 flex flex-col gap-3">
              {/* You May Also Like Section */}
              {suggestedProducts.length > 0 && (
                <div className="pb-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="relative">
                      <h4 className="font-bold text-sm text-[#222831]">You May Also Like</h4>
                      <div className="h-0.5 w-12 bg-[#f48721] mt-0.5 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={scrollLeft}
                        className="w-6 h-6 rounded-full bg-[#f48721] hover:bg-[#d97116] text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={scrollRight}
                        className="w-6 h-6 rounded-full bg-[#f48721] hover:bg-[#d97116] text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Carousel slider */}
                  <div
                    ref={sliderRef}
                    className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {suggestedProducts.map((p) => {
                      const variant = p.variants[0];
                      return (
                        <div
                          key={p.id}
                          className="min-w-[215px] max-w-[215px] bg-white border border-gray-200 rounded-xl p-2.5 flex items-center gap-2.5 shrink-0 shadow-2xs"
                        >
                          <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                            <Image
                              src={p.imageUrl}
                              alt={p.banglaName || p.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-semibold text-[#222831] truncate">
                              {p.banglaName || p.name}
                            </h5>
                            <span className="text-[11px] font-bold text-gray-500 block">
                              ৳{variant?.price}.00
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                addToCart({
                                  id: `${p.id}_${variant.id}`,
                                  productId: p.id,
                                  productName: p.banglaName,
                                  imageUrl: p.imageUrl,
                                  variantId: variant.id,
                                  weight: variant.weight,
                                  price: variant.price,
                                  originalPrice: variant.originalPrice,
                                  quantity: 1,
                                });
                              }}
                              className="mt-1 bg-[#f48721] hover:bg-[#d97116] text-white text-[11px] font-bold px-3 py-0.5 rounded-full transition cursor-pointer inline-flex items-center gap-1 shadow-2xs active:scale-95"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total and Checkout */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">Total:</span>
                  <span className="font-bold text-[#222831] text-base sm:text-lg">
                    ৳{subtotal.toLocaleString('en-US')}.00
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#f48721] hover:bg-[#d97116] text-white font-bold py-3.5 px-4 rounded-lg text-sm tracking-wider uppercase transition cursor-pointer shadow-md active:scale-[0.99] text-center"
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
