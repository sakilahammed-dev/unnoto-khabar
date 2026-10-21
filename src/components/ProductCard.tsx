'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  // For special offer items, default to the ১ কেজি variant
  const defaultVariant = product.isOffer
    ? (product.variants.find((v) => v.weight.includes('১ কেজি')) || product.variants[0])
    : product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);

  const discount = Math.round(
    ((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100
  );

  const itemKey = `${product.id}_${selectedVariant.id}`;
  const cartItem = cartItems.find((i) => i.id === itemKey);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart({
      id: itemKey,
      productId: product.id,
      productName: product.banglaName,
      imageUrl: product.imageUrl,
      variantId: selectedVariant.id,
      weight: selectedVariant.weight,
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 group">
      {/* 1. Square Image with Save Label */}
      <div className="relative aspect-square w-full bg-white overflow-hidden rounded flex items-center justify-center">
        <Image
          src={product.imageUrl}
          alt={product.banglaName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 rounded"
        />

        {/* Save Label (Reference style: green badge on top-right) */}
        {discount > 0 ? (
          <span className="absolute top-2 right-2 bg-[#2e9b5f] text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
            Save {discount}%
          </span>
        ) : null}
      </div>

      {/* 2. Product Details */}
      <div className="pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h4 className="font-medium text-[#222831] text-sm sm:text-base leading-snug line-clamp-2 min-h-10">
            {product.banglaName}
          </h4>

          {/* Pricing */}
          <div className="mt-1.5 flex items-baseline gap-2">
            <ins className="no-underline text-base sm:text-lg font-bold text-[#f48721]">
              ৳{selectedVariant.price}
            </ins>
            {selectedVariant.originalPrice > selectedVariant.price && (
              <del className="text-xs sm:text-sm text-gray-400 line-through">
                ৳{selectedVariant.originalPrice}
              </del>
            )}
          </div>

          {/* Weight Variants (Clean Pills only if more than 1) */}
          {product.variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.variants.map((v) => {
                const isActive = v.id === selectedVariant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`text-[11px] px-2.5 py-0.5 rounded border transition cursor-pointer ${
                      isActive
                        ? 'border-[#f48721] bg-orange-50 text-[#f48721] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {v.weight}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Ghorer Bazar Style: Transforming Add To Cart or Active Stepper */}
        <div className="pt-3">
          {quantityInCart > 0 ? (
            /* Active Quantity Stepper Box (Ghorer Bazar Style) */
            <div className="flex items-stretch border border-[#f48721] rounded overflow-hidden h-9 sm:h-10 w-full shadow-xs">
              <button
                type="button"
                onClick={() => updateQuantity(itemKey, -1)}
                className="bg-[#f48721] hover:bg-[#d97116] text-white w-10 sm:w-12 flex items-center justify-center transition active:scale-95 cursor-pointer font-bold select-none"
                aria-label="পরিমাণ কমান"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex-1 bg-white flex items-center justify-center font-bold text-[#222831] text-sm sm:text-base select-none">
                {quantityInCart}
              </div>

              <button
                type="button"
                onClick={() => updateQuantity(itemKey, 1)}
                className="bg-[#f48721] hover:bg-[#d97116] text-white w-10 sm:w-12 flex items-center justify-center transition active:scale-95 cursor-pointer font-bold select-none"
                aria-label="পরিমাণ বাড়ান"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            /* Default Add To Cart Button */
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full h-9 sm:h-10 border border-[#f48721] text-[#f48721] hover:bg-[#f48721] hover:text-white rounded text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add To Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
