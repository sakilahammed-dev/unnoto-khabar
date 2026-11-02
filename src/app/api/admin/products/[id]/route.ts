import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const cookieToken = req.cookies.get('admin_token')?.value || '';
  const token = authHeader.replace('Bearer ', '') || cookieToken;
  return verifySessionToken(token);
}

// PATCH: Update price or stock of a product
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { price, originalPrice, inStock, isOffer, badge, isCustom } = body;

    if (isCustom) {
      // Update custom product in CustomProduct table
      const updateData: any = {};
      if (price !== undefined) updateData.price = Math.max(0, parseInt(price, 10));
      if (originalPrice !== undefined) updateData.originalPrice = Math.max(0, parseInt(originalPrice, 10));
      if (inStock !== undefined) updateData.inStock = Boolean(inStock);
      if (isOffer !== undefined) updateData.isOffer = Boolean(isOffer);
      if (badge !== undefined) updateData.badge = badge;

      const updated = await prisma.customProduct.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, product: updated });
    } else {
      // Base catalog override via ProductOverride table
      const updateData: any = {};
      if (price !== undefined) updateData.customPrice = Math.max(0, parseInt(price, 10));
      if (originalPrice !== undefined) updateData.originalPrice = Math.max(0, parseInt(originalPrice, 10));
      if (inStock !== undefined) updateData.inStock = Boolean(inStock);
      if (isOffer !== undefined) updateData.isOffer = Boolean(isOffer);
      if (badge !== undefined) updateData.badge = badge;

      const override = await prisma.productOverride.upsert({
        where: { productId: id },
        update: updateData,
        create: {
          productId: id,
          ...updateData,
        },
      });

      return NextResponse.json({ success: true, override });
    }
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'পণ্যের তথ্য আপডেট করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

// DELETE: Delete a custom product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.customProduct.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'পণ্যটি মুছে ফেলা হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: 'পণ্য মুছতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
