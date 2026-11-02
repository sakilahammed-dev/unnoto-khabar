import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const cookieToken = req.cookies.get('admin_token')?.value || '';
    const token = authHeader.replace('Bearer ', '') || cookieToken;

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, name: true, role: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: admin });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে।' });
  response.cookies.delete('admin_token');
  return response;
}
