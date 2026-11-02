import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Public order tracking by phone number or orderCode
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 4) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে সঠিক অর্ডার কোড (যেমন: UK-2611-1001) অথবা মোবাইল নম্বর লিখুন।' },
        { status: 400 }
      );
    }

    const cleanPhone = query.replace(/[\s-]/g, '');

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderCode: query.toUpperCase() },
          { phoneNumber: cleanPhone },
          { phoneNumber: { endsWith: cleanPhone.slice(-11) } },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'এই নম্বর বা কোডে কোনো অর্ডার খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    // Mask sensitive phone number for public privacy
    const sanitizedOrders = orders.map((order) => {
      const maskedPhone =
        order.phoneNumber.length >= 11
          ? `${order.phoneNumber.slice(0, 3)}*****${order.phoneNumber.slice(-3)}`
          : '***';

      return {
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        maskedPhone,
        district: order.district,
        upazila: order.upazila,
        deliveryZone: order.deliveryZone,
        deliveryCharge: order.deliveryCharge,
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        advanceAmount: order.advanceAmount,
        dueAmount: order.dueAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        courierName: order.courierName,
        trackingCode: order.trackingCode,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl,
        })),
      };
    });

    return NextResponse.json({ success: true, orders: sanitizedOrders });
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ error: 'অর্ডার ট্র্যাকিং এ সমস্যা হয়েছে।' }, { status: 500 });
  }
}
