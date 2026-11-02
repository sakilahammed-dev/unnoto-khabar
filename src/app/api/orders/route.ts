import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

// Helper to generate unique order code like UK-2611-1001
async function generateOrderCode(): Promise<string> {
  const date = new Date();
  const yearSuffix = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `UK-${yearSuffix}${month}-`;

  // Find latest order with this prefix
  const latestOrder = await prisma.order.findFirst({
    where: {
      orderCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      orderCode: true,
    },
  });

  let nextSequence = 1001;
  if (latestOrder && latestOrder.orderCode) {
    const parts = latestOrder.orderCode.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  return `${prefix}${nextSequence}`;
}

// POST: Create a new customer order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phoneNumber,
      district,
      upazila,
      address,
      notes,
      deliveryZone,
      paymentMethod,
      advancePlan = 0,
      paymentTrxId,
      paymentSenderNumber,
      items,
    } = body;

    // 1. Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'অনুগ্রহ করে আপনার সঠিক নাম লিখুন।' }, { status: 400 });
    }

    const cleanPhone = (phoneNumber || '').replace(/[\s-]/g, '');
    const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।' },
        { status: 400 }
      );
    }

    if (!district || !upazila || !address || address.trim().length < 5) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে জেলা, থানা এবং বিস্তারিত ডেলিভারি ঠিকানা লিখুন।' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'কার্টে অন্তত একটি পণ্য থাকতে হবে।' }, { status: 400 });
    }

    // Payment validation for bKash and Nagad
    const selectedPaymentMethod = ['cod', 'bkash', 'nagad'].includes(paymentMethod) ? paymentMethod : 'cod';
    if (selectedPaymentMethod !== 'cod') {
      const cleanTrx = (paymentTrxId || '').trim();
      const cleanSender = (paymentSenderNumber || '').replace(/[\s-]/g, '');

      if (!cleanSender || !bdPhoneRegex.test(cleanSender)) {
        return NextResponse.json(
          { error: 'অনুগ্রহ করে যে বিকাশ/নগদ নম্বর থেকে টাকা পাঠিয়েছেন সেই সঠিক ১১ ডিজিটের নম্বরটি লিখুন।' },
          { status: 400 }
        );
      }

      if (!cleanTrx || cleanTrx.length < 6) {
        return NextResponse.json(
          { error: 'অনুগ্রহ করে আপনার পেমেন্টের সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন (যেমন: BJD82XKD)।' },
          { status: 400 }
        );
      }
    }

    // 2. Server-side calculations (tamper-proof)
    const isDhaka = deliveryZone === 'inside-dhaka';
    const deliveryCharge = isDhaka ? 70 : 130;

    let subtotal = 0;
    const sanitizedItems = items.map((item: any) => {
      const unitPrice = Math.max(0, parseInt(item.price, 10) || 0);
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      return {
        productId: String(item.id || item.productId || 'custom'),
        name: String(item.name || 'পণ্য'),
        weight: String(item.weight || item.selectedWeight || '1kg'),
        unitPrice,
        quantity,
        totalPrice,
        imageUrl: item.image || item.imageUrl || null,
      };
    });

    const totalAmount = subtotal + deliveryCharge;
    const cleanAdvancePlan = [0, 20, 50, 100].includes(advancePlan) ? advancePlan : 0;
    const advanceAmount = cleanAdvancePlan > 0 ? Math.round((totalAmount * cleanAdvancePlan) / 100) : 0;
    const dueAmount = totalAmount - advanceAmount;

    // 3. Generate unique order code
    const orderCode = await generateOrderCode();

    // 4. Save to Database in an atomic transaction
    const newOrder = await prisma.order.create({
      data: {
        orderCode,
        customerName: customerName.trim(),
        phoneNumber: cleanPhone,
        district: district.trim(),
        upazila: upazila.trim(),
        address: address.trim(),
        notes: notes ? notes.trim() : null,
        deliveryZone: isDhaka ? 'inside-dhaka' : 'outside-dhaka',
        deliveryCharge,
        subtotal,
        totalAmount,
        advancePlan: cleanAdvancePlan,
        advanceAmount,
        dueAmount,
        paymentMethod: selectedPaymentMethod,
        paymentTrxId: paymentTrxId ? paymentTrxId.trim().toUpperCase() : null,
        paymentSenderNumber: paymentSenderNumber ? paymentSenderNumber.trim() : null,
        paymentStatus: cleanAdvancePlan === 100 ? 'PAID' : cleanAdvancePlan > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
        status: 'PENDING',
        items: {
          create: sanitizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}

// GET: Admin fetch orders list (Secured)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const cookieToken = req.cookies.get('admin_token')?.value || '';
    const token = authHeader.replace('Bearer ', '') || cookieToken;

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ। লগইন করুন।' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderCode: { contains: search } },
        { customerName: { contains: search } },
        { phoneNumber: { contains: search } },
        { district: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Summary statistics for admin overview
    const [pendingCount, confirmedCount, shippedCount, deliveredCount, revenueAggregate] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalOrders: total,
        pending: pendingCount,
        confirmed: confirmedCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        totalRevenue: revenueAggregate._sum.totalAmount || 0,
      },
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'অর্ডার তালিকা লোড করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
