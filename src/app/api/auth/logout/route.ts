import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, destroySession, getSessionFromRequest, verifyCsrf } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const response = NextResponse.json({ success: true });

  if (session && verifyCsrf(request, session)) {
    await destroySession(session.sessionId);
  }

  clearAuthCookies(response);
  return response;
}
