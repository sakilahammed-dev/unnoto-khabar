import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [overrides, customProducts] = await Promise.all([
      prisma.productOverride.findMany(),
      prisma.customProduct.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      overrides,
      customProducts,
    });
  } catch (error: any) {
    console.error('Fetch public products error:', error);
    return NextResponse.json({ success: false, overrides: [], customProducts: [] }, { status: 500 });
  }
}
