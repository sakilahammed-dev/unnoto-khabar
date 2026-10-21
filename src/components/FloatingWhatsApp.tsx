'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside aria-label="হোয়াটসঅ্যাপে যোগাযোগ" className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-40">
      <a
        href="https://wa.me/8801700000000?text=হ্যালো%20উন্নত%20খাবার,%20আমি%20পণ্য%20অর্ডার%20করার%20বিষয়ে%20জানতে%20চাই।"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="হোয়াটসঅ্যাপে চ্যাট করুন"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </aside>
  );
};
