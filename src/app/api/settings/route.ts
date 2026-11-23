import { NextRequest, NextResponse } from 'next/server';
import { mapRowToSettings } from '@/lib/data';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(mapRowToSettings(data as Record<string, unknown>));
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const supabase = createServiceClient();
    const body = await request.json();

    // Map camelCase to snake_case for DB
    const updateData: Record<string, unknown> = {};
    if (body.siteName !== undefined) updateData.site_name = body.siteName;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.youtube !== undefined) updateData.youtube = body.youtube;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;
    if (body.aboutText !== undefined) updateData.about_text = body.aboutText;
    if (body.visionText !== undefined) updateData.vision_text = body.visionText;
    if (body.missionText !== undefined) updateData.mission_text = body.missionText;
    if (body.missions !== undefined) updateData.missions = body.missions;
    if (body.established !== undefined) updateData.established = body.established;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.stats !== undefined) updateData.stats = body.stats;
    if (body.donationInfo !== undefined) updateData.donation_info = body.donationInfo;
    if (body.team !== undefined) updateData.team = body.team;

    const { data, error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    await logActivity(guard.session.user, 'Mengubah pengaturan', 'Pengaturan', 'Pengaturan situs');
    return NextResponse.json(mapRowToSettings(data as Record<string, unknown>));
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
