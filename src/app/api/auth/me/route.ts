import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Lookup session and join user details
    const session = await db.session.findUnique({
      where: { id: sessionToken },
      include: { user: true }
    });

    // Verify session exists and hasn't expired
    if (!session || session.expires < new Date()) {
      // Clear cookie if session is expired
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete('session_token');
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      }
    });
  } catch (error) {
    console.error('Fetch session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
