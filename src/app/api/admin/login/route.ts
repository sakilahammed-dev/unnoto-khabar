import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'ইউজারনেম এবং পাসওয়ার্ড দিন।' }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'ভুল ইউজারনেম বা পাসওয়ার্ড।' }, { status: 401 });
    }

    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'ভুল ইউজারনেম বা পাসওয়ার্ড।' }, { status: 401 });
    }

    const token = createSessionToken(admin.id, admin.username);

    const response = NextResponse.json({
      success: true,
      message: 'সফলভাবে লগইন হয়েছে!',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
      token,
    });

    // Set secure cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'লগইন প্রক্রিয়া ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
