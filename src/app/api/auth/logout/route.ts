import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Delete session from DB
      try {
        await db.session.delete({
          where: { id: sessionToken }
        });
      } catch {}
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    
    // Clear cookie
    response.cookies.set({
      name: 'session_token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to process logout.' }, { status: 500 });
  }
}
