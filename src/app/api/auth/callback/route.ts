import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_token`);
  }

  try {
    // Check verification token
    const dbToken = await db.verificationToken.findUnique({
      where: { token }
    });

    if (!dbToken || dbToken.expires < new Date()) {
      return NextResponse.redirect(`${origin}/?auth_error=expired_token`);
    }

    // Upsert User
    const user = await db.user.upsert({
      where: { email: dbToken.email },
      update: {},
      create: { email: dbToken.email }
    });

    // Create a 30-day session
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const session = await db.session.create({
      data: {
        userId: user.id,
        expires: sessionExpires
      }
    });

    // Delete token so it cannot be used again
    await db.verificationToken.delete({
      where: { token }
    });

    // Create the redirect response
    const response = NextResponse.redirect(`${origin}/`);

    // Set secure HTTP-only cookie holding the session ID
    response.cookies.set({
      name: 'session_token',
      value: session.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: sessionExpires,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Callback auth error:', error);
    return NextResponse.redirect(`${origin}/?auth_error=server_error`);
  }
}
