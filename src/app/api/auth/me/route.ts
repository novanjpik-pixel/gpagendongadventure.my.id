import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hasAnyAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      let needsSetup = false;
      try {
        needsSetup = !(await hasAnyAdmin());
      } catch (err) {
        console.error('Setup check failed:', err instanceof Error ? err.message : String(err));
      }
      return NextResponse.json({ authenticated: false, needsSetup }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      csrfToken: session.csrfToken,
    });
  } catch (err) {
    console.error('Session check error:', err instanceof Error ? err.message || err.name : JSON.stringify(err));
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
