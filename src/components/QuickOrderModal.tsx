'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Trash2,
  Minus,
  Plus,
  Phone,
  MapPin,
  Banknote,
  Check,
} from 'lucide-react';
import { useCart, DELIVERY_RATES } from '@/context/CartContext';
import {
  BANGLADESH_DISTRICTS,
  isDhakaDistrict,
  getUpazilasForDistrict,
} from '@/data/districts';
import { CartItem, OrderSubmission } from '@/types';

export const QuickOrderModal: React.FC = () => {
  const {
    isQuickOrderOpen,
    closeQuickOrder,
    checkoutItems,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryZone,
    setDeliveryZone,
    setLastOrder,
  } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('মিরপুর');
  const [addressDetails, setAddressDetails] = useState('');
  // 3 Payment Methods: Cash On Delivery, Nagad, Bkash
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  // Choose Payment Plan when Bkash or Nagad is selected: '50' | '75' | '100'
  const [advancePlan, setAdvancePlan] = useState<'50' | '75' | '100'>('50');
  // Real Payment Details for bKash / Nagad
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [note, setNote] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderSubmission | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep deliveryZone in sync with district
  useEffect(() => {
    if (isDhakaDistrict(district)) {
      setDeliveryZone('inside-dhaka');
    } else {
      setDeliveryZone('outside-dhaka');
    }
  }, [district, setDeliveryZone]);

  if (!isQuickOrderOpen) return null;

  // Source of truth: checkoutItems when in checkout modal
  const orderItems: CartItem[] = checkoutItems;

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isDhaka = isDhakaDistrict(district);
  const deliveryCharge = orderItems.length === 0 ? 0 : isDhaka ? DELIVERY_RATES['inside-dhaka'] : DELIVERY_RATES['outside-dhaka'];
  const grandTotal = subtotal + deliveryCharge;

  // Calculate Advance Amount and Due on Delivery
  let advanceAmount = 0;
  let dueAmount = grandTotal;

  if (paymentMethod !== 'cod') {
    if (advancePlan === '50') {
      advanceAmount = Math.round(grandTotal * 0.5);
      dueAmount = grandTotal - advanceAmount;
    } else if (advancePlan === '75') {
      advanceAmount = Math.round(grandTotal * 0.75);
      dueAmount = grandTotal - advanceAmount;
    } else if (advancePlan === '100') {
      advanceAmount = grandTotal;
      dueAmount = 0;
    }
  }

  // Dynamically get the upazilas for the selected district (all 64 districts supported)
  const currentUpazilas = getUpazilasForDistrict(district);

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const upazilas = getUpazilasForDistrict(newDistrict);
    setUpazila(upazilas[0] || 'সদর');

    if (isDhakaDistrict(newDistrict)) {
      setDeliveryZone('inside-dhaka');
    } else {
      setDeliveryZone('outside-dhaka');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponApplied(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (orderItems.length === 0) {
      setErrorMessage('আপনার কার্টে কোনো পণ্য নেই। অনুগ্রহ করে পণ্য নির্বাচন করুন।');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('দয়া করে আপনার পুরো নাম লিখুন (Your Full Name)।');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setErrorMessage('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!addressDetails.trim() || addressDetails.trim().length < 3) {
      setErrorMessage('দয়া করে আপনার বিস্তারিত ঠিকানা (বাসা নং / রোড / গ্রাম / এলাকা) লিখুন।');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('অর্ডার সম্পন্ন করতে নিয়ম ও শর্তাবলীতে সম্মতি প্রদান করুন।');
      return;
    }

    // Real Payment verification for bKash / Nagad
    let cleanSender = '';
    if (paymentMethod !== 'cod') {
      cleanSender = senderNumber.replace(/[^0-9]/g, '');
      if (cleanSender.length !== 11 || !cleanSender.startsWith('01')) {
        setErrorMessage(
          `দয়া করে যে ${paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বর থেকে টাকা পাঠিয়েছেন সেই ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।`
        );
        return;
      }
      if (!trxId.trim() || trxId.trim().length < 6) {
        setErrorMessage(
          `দয়া করে আপনার পেমেন্টের সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন (যেমন: BJD82XKD)।`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          phoneNumber: cleanPhone,
          district: district,
          upazila: upazila,
          address: addressDetails.trim(),
          notes: note.trim(),
          deliveryZone: isDhaka ? 'inside-dhaka' : 'outside-dhaka',
          paymentMethod: paymentMethod,
          advancePlan: paymentMethod !== 'cod' ? parseInt(advancePlan, 10) : 0,
          paymentTrxId: paymentMethod !== 'cod' ? trxId.trim().toUpperCase() : null,
          paymentSenderNumber: paymentMethod !== 'cod' ? cleanSender : null,
          items: orderItems.map((item) => ({
            id: item.productId || item.id,
            name: item.productName,
            weight: item.weight,
            price: item.price,
            quantity: item.quantity,
            image: item.imageUrl,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = data.order;
      const fullAddress = `${createdOrder.address}, উপজেলা/থানা: ${createdOrder.upazila}, জেলা: ${createdOrder.district}`;

      const orderData: OrderSubmission = {
        orderId: createdOrder.orderCode,
        customerName: createdOrder.customerName,
        phoneNumber: createdOrder.phoneNumber,
        address: fullAddress,
        deliveryZone: createdOrder.deliveryZone as any,
        deliveryCharge: createdOrder.deliveryCharge,
        notes: createdOrder.notes || '',
        district: createdOrder.district,
        upazila: createdOrder.upazila,
        paymentMethod: createdOrder.paymentMethod as any,
        advancePlan: createdOrder.advancePlan > 0 ? (createdOrder.advancePlan as any) : undefined,
        advanceAmount: createdOrder.advanceAmount,
        dueAmount: createdOrder.dueAmount,
        items: orderItems,
        subtotal: createdOrder.subtotal,
        total: createdOrder.totalAmount,
        createdAt: createdOrder.createdAt,
      };

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      setSubmittedOrder(orderData);
      setLastOrder(orderData);
      clearCart();
    } catch (err) {
      console.error(err);
      setErrorMessage('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। ইন্টারনেট কানেকশন চেক করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSubmittedOrder(null);
    closeQuickOrder();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleModalClose}
      />

      <div className="min-h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="relative w-full max-w-5xl bg-[#fdfdfd] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Breadcrumb & Close Bar (Ghorer Bazar Style: Home > Checkout) */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 hover:text-[#f48721] cursor-pointer" onClick={handleModalClose}>
                Home
              </span>
              <span className="text-gray-400">›</span>
              <span className="text-[#f48721] font-semibold">Checkout (চেকআউট)</span>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 max-h-[88vh] overflow-y-auto bg-[#fafafa]">
            {submittedOrder ? (
              /* Success Receipt */
              <div className="max-w-xl mx-auto flex flex-col items-center text-center py-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3 ring-8 ring-green-50">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <h3 className="text-2xl font-bold text-[#222831]">
                  আলহামদুলিল্লাহ! আপনার অর্ডারটি নিশ্চিত হয়েছে
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  অর্ডার কোড: <strong className="text-[#f48721] font-bold text-sm tracking-wide">{submittedOrder.orderId}</strong>
                </p>

                {/* Receipt Card */}
                <div className="w-full bg-[#f8f9fa] rounded-lg p-5 my-5 border border-gray-200 text-left text-xs space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">
                    অর্ডার বিবরণী (Order Details)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    <p>
                      <strong className="text-gray-900">গ্রাহকের নাম:</strong> {submittedOrder.customerName}
                    </p>
                    <p>
                      <strong className="text-gray-900">মোবাইল নম্বর:</strong> {submittedOrder.phoneNumber}
                    </p>
                    <p className="sm:col-span-2">
                      <strong className="text-gray-900">ডেলিভারি ঠিকানা:</strong> {submittedOrder.address}
                    </p>
                    <p>
                      <strong className="text-gray-900">জেলা ও থানা:</strong> {submittedOrder.district}, {submittedOrder.upazila}
                    </p>
                    <p>
                      <strong className="text-gray-900">ডেলিভারি চার্জ:</strong>{' '}
                      {submittedOrder.deliveryZone === 'inside-dhaka' ? '৳৭০ (ঢাকার ভেতরে)' : '৳১৩০ (ঢাকার বাইরে)'}
                    </p>
                    <p className="sm:col-span-2">
                      <strong className="text-gray-900">পেমেন্ট মেথড:</strong>{' '}
                      {submittedOrder.paymentMethod === 'cod' && 'ক্যাশ অন ডেলিভারি (Cash On Delivery)'}
                      {submittedOrder.paymentMethod === 'bkash' && `বিকাশ (${submittedOrder.advancePlan}% অগ্রিম)`}
                      {submittedOrder.paymentMethod === 'nagad' && `নগদ (${submittedOrder.advancePlan}% অগ্রিম)`}
                    </p>
                    {submittedOrder.paymentMethod !== 'cod' && (
                      <>
                        <p>
                          <strong className="text-[#f48721]">অগ্রিম পরিশোধিত/প্রদেয়:</strong> ৳{submittedOrder.advanceAmount}
                        </p>
                        <p>
                          <strong className="text-gray-900">ডেলিভারিতে বাকি:</strong> ৳{submittedOrder.dueAmount}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-800 block mb-2">
                      অর্ডারকৃত পণ্য তালিকা ({submittedOrder.items.length}টি):
                    </span>
                    <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto pr-1">
                      {submittedOrder.items.map((item) => (
                        <li key={item.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0 bg-white">
                              <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                            </div>
                            <div>
                              <span className="font-semibold text-[#222831] block line-clamp-1">
                                {item.productName}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {item.weight} × {item.quantity}টি
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 shrink-0 ml-2">
                            ৳{item.price * item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-[#222831] text-base">
                    <span>সর্বমোট বিল:</span>
                    <span className="text-[#f48721] text-xl font-extrabold">৳{submittedOrder.total}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-[#222831] mb-5 text-left w-full">
                  <p className="font-bold text-[#1e7e34] mb-0.5">ডেলিভারি তথ্য:</p>
                  <p className="text-gray-600 leading-relaxed">
                    আমাদের কাস্টমার কেয়ার প্রতিনিধি খুব দ্রুত আপনার সাথে ফোনে যোগাযোগ করে পার্সেলটি নিশ্চিত করবেন। যেকোনো প্রয়োজনে কল করুন: <strong>০১৭০০-০০০০০০</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-[#f48721] hover:bg-[#d97116] text-white font-bold px-8 py-2.5 rounded-lg text-sm transition cursor-pointer shadow-md"
                >
                  আরও কেনাকাটা করুন
                </button>
              </div>
            ) : (
              /* Two-Column Checkout Layout (Exact Ghorer Bazar Structure) */
              <form onSubmit={handleSubmitOrder}>
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* LEFT COLUMN: Order Review + Shipping Address (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* 1. Order Review (Ghorer Bazar Style) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs">
                      <div className="flex items-center gap-2 border-l-4 border-[#f48721] pl-2 mb-3">
                        <h4 className="font-bold text-xs text-[#222831]">Order review</h4>
                      </div>

                      {orderItems.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4 text-center">আপনার কার্টে কোনো পণ্য নেই।</p>
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                          {orderItems.map((item) => (
                            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                              {/* Product Image & Info */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white">
                                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-[#222831] line-clamp-1 block text-xs sm:text-sm">
                                    {item.productName}
                                  </h5>
                                  {item.weight && !item.productName.includes(item.weight) && (
                                    <span className="text-[11px] text-gray-500 block">
                                      {item.weight}
                                    </span>
                                  )}

                                  {/* Quantity Stepper & Price (Exact Ghorer Bazar Style) */}
                                  <div className="flex items-center gap-2 mt-1.5 text-gray-600 flex-wrap">
                                    <span className="text-xs">Qty:</span>
                                    <div className="inline-flex items-center bg-gray-100 rounded-md overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="px-2.5 py-0.5 text-[#f48721] hover:bg-gray-200 font-bold transition cursor-pointer select-none text-sm leading-none"
                                        aria-label="Decrease quantity"
                                      >
                                        -
                                      </button>
                                      <span className="px-2.5 text-xs font-bold text-gray-800 select-none">
                                        {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="px-2.5 py-0.5 text-[#f48721] hover:bg-gray-200 font-bold transition cursor-pointer select-none text-sm leading-none"
                                        aria-label="Increase quantity"
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Item Total Price */}
                                    <span className="font-bold text-gray-900 text-xs sm:text-sm ml-2">
                                      ৳{(item.price * item.quantity).toLocaleString('en-US')}.00
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Solid Red Delete Button (Exact Ghorer Bazar Style) */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="w-6 h-6 rounded bg-[#ea4335] hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Shipping Address (Ghorer Bazar Style) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 border-l-4 border-[#f48721] pl-2 mb-0.5">
                        <h4 className="font-bold text-xs text-[#222831]">Shipping Address</h4>
                      </div>

                      {/* Row 1: Full Name & Phone with 88 prefix */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Your Full Name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#f48721] transition"
                          />
                        </div>

                        <div className="flex">
                          <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-2.5 py-2 text-xs text-gray-600 font-bold select-none flex items-center">
                            88
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="0144774455 *"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-r-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#f48721] transition"
                          />
                        </div>
                      </div>

                      {/* Row 2: Email (Optional) */}
                      <div>
                        <input
                          type="email"
                          placeholder="example@gmail.com (Optional)"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#f48721] transition"
                        />
                      </div>

                      {/* Row 3: YOUR ADDRESS Preview Box (Exact Ghorer Bazar Signature Feature!) */}
                      <div className="bg-orange-50/60 border border-orange-200 rounded-lg p-2.5 text-xs">
                        <span className="block text-[10px] font-bold text-[#f48721] uppercase tracking-wider mb-0.5">
                          YOUR ADDRESS
                        </span>
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#f48721] shrink-0" />
                          <span>
                            {upazila}, {district}
                          </span>
                        </div>
                      </div>

                      {/* Row 4: Detailed Address Input */}
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="ex: House no. / building / street / area / village"
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#f48721] transition"
                        />
                      </div>

                      {/* Row 5: District & Thana/Upazila Dropdowns Side by Side (Ghorer Bazar Style) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* District Dropdown */}
                        <div className="relative">
                          <select
                            value={district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#f48721] cursor-pointer appearance-none shadow-xs"
                          >
                            <option value="ঢাকা">ঢাকা (ডেলিভারি ৳৭০)</option>
                            <optgroup label="অন্যান্য জেলা (ডেলিভারি ৳১৩০)">
                              {BANGLADESH_DISTRICTS.filter((d) => d !== 'ঢাকা').map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 text-xs">
                            ▼
                          </div>
                        </div>

                        {/* Thana/Upazila Dropdown - Dynamically populated for ALL 64 districts! */}
                        <div className="relative">
                          <select
                            value={upazila}
                            onChange={(e) => setUpazila(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#f48721] cursor-pointer appearance-none shadow-xs"
                          >
                            {currentUpazilas.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 text-xs">
                            ▼
                          </div>
                        </div>
                      </div>

                      {/* Row 6: Billing Address Toggle (Ghorer Bazar Style) */}
                      <div className="pt-1 flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="sameBilling"
                          checked={sameBillingAddress}
                          onChange={(e) => setSameBillingAddress(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#f48721] rounded"
                        />
                        <label htmlFor="sameBilling" className="cursor-pointer text-[11px]">
                          Billing Address (বিলিং ঠিকানা একই থাকবে)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Payment Method + Summary + Submit (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* 1. Payment Method: 3 Options (Cash On Delivery, Bkash, Nagad) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2 border-l-4 border-[#f48721] pl-2 mb-1">
                        <h4 className="font-bold text-xs text-[#222831]">Payment method</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Option 1: Cash On Delivery */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                            paymentMethod === 'cod'
                              ? 'border-[#f48721] bg-orange-50/70 text-[#222831] font-semibold ring-1 ring-[#f48721]'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-[#1e7e34]" />
                            <span className="text-[11px]">Cash On Delivery</span>
                          </div>
                          {paymentMethod === 'cod' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#f48721] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>

                        {/* Option 2: Bkash */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bkash')}
                          className={`p-2 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                            paymentMethod === 'bkash'
                              ? 'border-[#f48721] bg-orange-50/70 text-[#222831] font-semibold ring-1 ring-[#f48721]'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#e2136e] text-white text-[8px] font-bold flex items-center justify-center">
                              ব
                            </span>
                            <span className="text-[11px] font-semibold text-[#e2136e]">Bkash</span>
                          </div>
                          {paymentMethod === 'bkash' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#f48721] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Option 3: Nagad */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between cursor-pointer text-xs ${
                          paymentMethod === 'nagad'
                            ? 'border-[#f48721] bg-orange-50/70 text-[#222831] font-semibold ring-1 ring-[#f48721]'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#f7941d] text-white text-[8px] font-bold flex items-center justify-center">
                            ন
                          </span>
                          <span className="text-[11px] font-semibold text-[#d45d00]">Nagad (নগদ)</span>
                        </div>
                        {paymentMethod === 'nagad' && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#f48721] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* 2. Coupon or Voucher (Ghorer Bazar Style) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
                      <span className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                        Have any coupon or gift voucher?
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#f48721]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="bg-[#f48721] hover:bg-[#d97116] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Apply coupon
                        </button>
                      </div>
                      {couponApplied && (
                        <p className="text-[10px] text-green-600 mt-1 font-medium">
                          কুপন কোড গ্রহণ করা হয়েছে!
                        </p>
                      )}
                    </div>

                    {/* 3. Order Summary Box & Choose Payment Plan (Exact Ghorer Bazar Style) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs space-y-2 text-xs">
                      {/* Sub total */}
                      <div className="flex justify-between text-gray-600">
                        <span>Sub total</span>
                        <span className="font-semibold text-gray-800">
                          {subtotal.toFixed(2)} BDT
                        </span>
                      </div>

                      {/* Delivery cost */}
                      <div className="flex justify-between text-gray-600 items-center">
                        <div>
                          <span>Delivery cost</span>
                          <span className="ml-1 text-[10px] text-gray-400">
                            ({isDhaka ? 'ঢাকা' : district})
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {deliveryCharge.toFixed(2)} BDT
                        </span>
                      </div>

                      {/* When Bkash or Nagad is selected: Show Payment Plan Discount, Partial Amount, Due Amount */}
                      {paymentMethod !== 'cod' && (
                        <>
                          <div className="flex justify-between text-gray-600">
                            <span>Payment Plan Discount</span>
                            <span className="font-semibold text-gray-800">
                              0.00BDT
                            </span>
                          </div>

                          <div className="flex justify-between text-gray-600">
                            <span>Partial Amount</span>
                            <span className="font-semibold text-gray-800">
                              {advanceAmount.toFixed(2)}BDT
                            </span>
                          </div>

                          <div className="flex justify-between text-gray-600">
                            <span>Due Amount</span>
                            <span className="font-semibold text-gray-800">
                              {dueAmount.toFixed(2)}BDT
                            </span>
                          </div>
                        </>
                      )}

                      {/* Total Line: 'Total (After Discount)' for Advance, or 'Total' for COD */}
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-[#222831]">
                        <span>{paymentMethod !== 'cod' ? 'Total (After Discount)' : 'Total'}</span>
                        <span className="text-[#222831] text-base font-extrabold">
                          {grandTotal.toFixed(2)}BDT
                        </span>
                      </div>

                      {/* Choose Payment Plan (Appears when Bkash or Nagad is selected - EXACT Ghorer Bazar Feature!) */}
                      {paymentMethod !== 'cod' && (
                        <div className="pt-3 border-t border-gray-200 space-y-2 animate-in fade-in duration-150">
                          <span className="block font-bold text-xs text-[#222831]">
                            Choose Payment Plan
                          </span>

                          <div className="space-y-1.5 text-xs text-gray-700">
                            {/* Option 1: 50% advance */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 rounded hover:bg-orange-50/50">
                              <input
                                type="radio"
                                name="advancePlan"
                                value="50"
                                checked={advancePlan === '50'}
                                onChange={() => setAdvancePlan('50')}
                                className="w-3.5 h-3.5 accent-[#f48721] cursor-pointer"
                              />
                              <span className="text-[11px] text-gray-800">
                                50% advance payment is required to confirm your order.
                              </span>
                            </label>

                            {/* Option 2: 75% advance */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 rounded hover:bg-orange-50/50">
                              <input
                                type="radio"
                                name="advancePlan"
                                value="75"
                                checked={advancePlan === '75'}
                                onChange={() => setAdvancePlan('75')}
                                className="w-3.5 h-3.5 accent-[#f48721] cursor-pointer"
                              />
                              <span className="text-[11px] text-gray-800">
                                75% advance payment is required to confirm your order.
                              </span>
                            </label>

                            {/* Option 3: Full payment advance */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 rounded hover:bg-orange-50/50">
                              <input
                                type="radio"
                                name="advancePlan"
                                value="100"
                                checked={advancePlan === '100'}
                                onChange={() => setAdvancePlan('100')}
                                className="w-3.5 h-3.5 accent-[#f48721] cursor-pointer"
                              />
                              <span className="text-[11px] text-gray-800">
                                Full payment advance
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Real bKash / Nagad Payment Instructions & Verification Inputs */}
                      {paymentMethod !== 'cod' && (
                        <div
                          className={`rounded-xl p-3.5 border text-xs space-y-3 mt-3 ${
                            paymentMethod === 'bkash'
                              ? 'bg-pink-50/80 border-[#e2136e]/30'
                              : 'bg-orange-50/80 border-[#f7941d]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b pb-2 border-gray-200/80">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                              <span
                                className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${
                                  paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f7941d]'
                                }`}
                              >
                                {paymentMethod === 'bkash' ? 'ব' : 'ন'}
                              </span>
                              <span>
                                {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পেমেন্ট নির্দেশিকা (Send Money)
                              </span>
                            </div>
                            <span className="font-extrabold text-[#f48721]">
                              প্রদেয়: ৳{advanceAmount.toLocaleString()}
                            </span>
                          </div>

                          {/* Official Account Number with 1-click Copy */}
                          <div className="bg-white rounded-lg p-2.5 border border-gray-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-gray-500 block">
                                উন্নত খাবার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বর:
                              </span>
                              <span className="text-sm font-bold font-mono tracking-wider text-gray-900">
                                01700-000000
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('01700000000');
                                setCopiedNumber(true);
                                setTimeout(() => setCopiedNumber(false), 2000);
                              }}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-[11px] transition flex items-center gap-1 cursor-pointer"
                            >
                              {copiedNumber ? (
                                <span className="text-green-600 font-bold">কপি হয়েছে!</span>
                              ) : (
                                <span>নম্বর কপি</span>
                              )}
                            </button>
                          </div>

                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            ওপরের নম্বরে আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাপ থেকে{' '}
                            <strong>৳{advanceAmount}</strong> সেন্ড মানি করুন। পেমেন্ট সম্পন্ন হওয়ার পর
                            ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বরটি নিচে লিখে অর্ডার নিশ্চিত করুন:
                          </p>

                          {/* Sender Phone Input */}
                          <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">
                              যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="01XXXXXXXXX"
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-800 font-mono focus:outline-none focus:border-[#f48721]"
                            />
                          </div>

                          {/* TrxID Input */}
                          <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1">
                              ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="যেমন: BJD928XKD"
                              value={trxId}
                              onChange={(e) => setTrxId(e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-800 font-mono uppercase focus:outline-none focus:border-[#f48721]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. Special notes (Optional) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
                      <div className="flex items-center gap-2 border-l-4 border-[#f48721] pl-2 mb-1.5">
                        <h4 className="font-bold text-xs text-[#222831]">Special notes (Optional)</h4>
                      </div>
                      <textarea
                        maxLength={90}
                        rows={2}
                        placeholder="অতিরিক্ত নির্দেশনা থাকলে লিখুন..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-[#f48721] transition"
                      />
                      <span className="block text-right text-[10px] text-gray-400 mt-0.5">
                        {note.length}/90 characters
                      </span>
                    </div>

                    {/* 5. Terms Agreement Checkbox (Ghorer Bazar Style) */}
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#f48721] rounded mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="terms" className="leading-tight cursor-pointer text-[11px]">
                        I have read and agree to the{' '}
                        <span className="text-[#f48721] font-semibold underline">Terms and Conditions</span>,{' '}
                        <span className="text-[#f48721] font-semibold underline">Privacy Policy</span> &{' '}
                        <span className="text-[#f48721] font-semibold underline">Refund and Return Policy</span>.
                      </label>
                    </div>

                    {/* 6. Big Orange PLACE ORDER Button (Exact Ghorer Bazar Style) */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#f48721] hover:bg-[#d97116] disabled:opacity-70 text-white font-extrabold py-3 px-6 rounded-lg text-sm tracking-wider uppercase transition cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>PROCESSING...</span>
                      ) : (
                        <span>
                          {paymentMethod === 'cod'
                            ? `PLACE ORDER — ৳${grandTotal.toLocaleString()}`
                            : `PLACE ORDER (ADVANCE ৳${advanceAmount.toLocaleString()})`}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

