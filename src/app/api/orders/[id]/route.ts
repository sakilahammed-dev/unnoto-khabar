import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

// Helper to authenticate admin
function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const cookieToken = req.cookies.get('admin_token')?.value || '';
  const token = authHeader.replace('Bearer ', '') || cookieToken;
  return verifySessionToken(token);
}

// GET: Get single order details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'অর্ডারটি পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: 'অর্ডার তথ্য লোড ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

// PATCH: Update order status, courier, payment, notes
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, courierName, trackingCode, internalNotes, advanceAmount } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (courierName !== undefined) dataToUpdate.courierName = courierName;
    if (trackingCode !== undefined) dataToUpdate.trackingCode = trackingCode;
    if (internalNotes !== undefined) dataToUpdate.internalNotes = internalNotes;
    if (advanceAmount !== undefined) {
      const existing = await prisma.order.findUnique({ where: { id }, select: { totalAmount: true } });
      if (existing) {
        const adv = Math.max(0, parseInt(advanceAmount, 10) || 0);
        dataToUpdate.advanceAmount = adv;
        dataToUpdate.dueAmount = Math.max(0, existing.totalAmount - adv);
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// DELETE: Delete order
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: 'অর্ডার মুছতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
