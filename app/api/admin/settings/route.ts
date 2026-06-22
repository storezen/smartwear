import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const settings = await getSettings();
    
    // Mask sensitive keys for the frontend
    const maskedSettings = { ...settings };
    
    if (maskedSettings.postex_api_token) {
      maskedSettings.postex_api_token = "********";
    }
    if (maskedSettings.postex_webhook_secret) {
      maskedSettings.postex_webhook_secret = "********";
    }
    if (maskedSettings.tiktok_access_token) {
      maskedSettings.tiktok_access_token = "********";
    }

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentSettings = await getSettings();
    
    const updates = { ...body };

    // Handle sensitive keys
    if (updates.postex_api_token === "********") {
      // It wasn't changed, delete from updates to prevent overriding with asterisks
      delete updates.postex_api_token;
    } else if (updates.postex_api_token) {
      // It was changed, encrypt it
      updates.postex_api_token = encrypt(updates.postex_api_token);
    }

    if (updates.postex_webhook_secret === "********") {
      delete updates.postex_webhook_secret;
    } else if (updates.postex_webhook_secret) {
      updates.postex_webhook_secret = encrypt(updates.postex_webhook_secret);
    }

    if (updates.tiktok_access_token === "********") {
      delete updates.tiktok_access_token;
    } else if (updates.tiktok_access_token) {
      updates.tiktok_access_token = encrypt(updates.tiktok_access_token);
    }

    const newSettings = await updateSettings(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
