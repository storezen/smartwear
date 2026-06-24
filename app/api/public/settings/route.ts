import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();

    const safe = { ...settings };
    delete safe.postex_api_token;
    delete safe.postex_webhook_secret;
    delete safe.tiktok_pixel_id;
    delete safe.tiktok_access_token;

    return NextResponse.json(safe, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' },
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
