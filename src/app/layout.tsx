import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { StoreLayoutWrapper } from '@/components/StoreLayoutWrapper';

export const metadata: Metadata = {
  title: 'উন্নত খাবার (Unnoto Khabar)',
  description:
    'সুন্দরবনের খাঁটি চাকের মধু, কাঠের ঘানিভাঙা সরিষার তেল, প্রিমিয়াম হানি নাটস, মদিনার আজওয়া খেজুর, খাঁটি গাওয়া ঘি ও দেশি শুঁটকি। সারা দেশে ক্যাশ অন ডেলিভারি।',
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
          <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
