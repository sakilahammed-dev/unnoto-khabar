'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { CartToast } from '@/components/CartToast';
import { FloatingCartTab } from '@/components/FloatingCartTab';
import { MobileMenuDrawer } from '@/components/MobileMenuDrawer';

export function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="min-h-screen flex-1">{children}</main>;
  }

  return (
    <>
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
      <FloatingCartTab />
      <CartToast />
    </>
  );
}
