import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { CartToast } from '@/components/CartToast';
import { FloatingCartTab } from '@/components/FloatingCartTab';
import { MobileMenuDrawer } from '@/components/MobileMenuDrawer';

export const metadata: Metadata = {
  title: 'উন্নত খাবার | সুস্থ জীবনের খাঁটি আহার - ১০০% খাঁটি অর্গানিক খাদ্য',
  description:
    'সুন্দরবনের প্রাকৃতিক চাকের কাঁচা মধু, কাঠের ঘানিভাঙা সরিষার তেল, প্রিমিয়াম হানি নাটস, মদিনার আজওয়া খেজুর, খাঁটি গাওয়া ঘি ও দেশি শুঁটকি। সারা দেশে ক্যাশ অন ডেলিভারি।',
  keywords: [
    'উন্নত খাবার',
    'Unnoto Khabar',
    'খাঁটি মধু',
    'হানি নাটস',
    'ঘানিভাঙা সরিষার তেল',
    'গাওয়া ঘি',
    'আজওয়া খেজুর',
    'চিয়া সিড',
    'ঘোরের বাজার',
    'অর্গানিক ফুড',
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  other: {
    google: 'notranslate',
  },
  openGraph: {
    title: 'উন্নত খাবার | সুস্থ জীবনের খাঁটি আহার',
    description: '১০০% খাঁটি প্রাকৃতিক খাবার সরাসরি ঘরে বসেই অর্ডার করুন। ক্যাশ অন ডেলিভারি সারা দেশে।',
    url: 'https://unnotokhabar.com',
    siteName: 'উন্নত খাবার (Unnoto Khabar)',
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fff5f7] text-[#252a34] antialiased selection:bg-pink-100 selection:text-pink-900">
        <CartProvider>
          {/* Sticky Header */}
          <Header />

          {/* Main Body Content */}
          <main className="flex-1 pb-16 md:pb-0">{children}</main>

          {/* Trust Badges, Reviews & Footer */}
          <Footer />

          {/* Persistent Floating Controls & Modals */}
          <MobileMenuDrawer />
          <MobileBottomNav />
          <CartDrawer />
          <QuickOrderModal />
          <FloatingWhatsApp />
          <CartToast />
          <FloatingCartTab />
        </CartProvider>
      </body>
    </html>
  );
}
