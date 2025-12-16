import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/database/server';

async function getFidFromAddress(address: string): Promise<number | null> {
  try {
    // Use the official Farcaster Hub API to find FID by address
    const response = await fetch(`https://api.farcaster.xyz/v2/user-by-verification?address=${address}`);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.user) {
        return data.result.user.fid;
      }
    }
  } catch (error) {
    console.warn(`Failed to get FID for address ${address}:`, error);
  }
  return null;
}

async function getUserProfile(fid: number) {
  try {
    // Use the official Farcaster Hub API to get user data
    // Get all user data at once
    const response = await fetch(`https://api.farcaster.xyz/v2/user-data-by-fid?fid=${fid}`);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.messages) {
        const profile: any = { fid };

        // Parse the user data messages
        data.result.messages.forEach((msg: any) => {
          const type = msg.data.userDataBody.type;
          const value = msg.data.userDataBody.value;

          switch (type) {
            case 'USER_DATA_TYPE_USERNAME':
              profile.username = value;
              break;
            case 'USER_DATA_TYPE_PFP':
              profile.pfp = value;
              break;
            case 'USER_DATA_TYPE_DISPLAY':
              profile.displayName = value;
              break;
          }
        });

        return profile;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch profile for FID ${fid}:`, error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter required' }, { status: 400 });
  }

  try {
    // First get FID from address
    const fid = await getFidFromAddress(address);
    if (!fid) {
      return NextResponse.json({ error: 'FID not found for address' }, { status: 404 });
    }

    // Then get profile data
    const profile = await getUserProfile(fid);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Batch endpoint for multiple addresses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let addresses: string[] = [];

    if (typeof body.addresses === 'string') {
      addresses = [body.addresses];
    } else if (Array.isArray(body.addresses)) {
      addresses = body.addresses;
    } else {
      return NextResponse.json({ error: 'Addresses array or single address required' }, { status: 400 });
    }

    const profiles: Record<string, any> = {};

    // Process addresses in batches to avoid overwhelming the Hub
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);

      const promises = batch.map(async (address) => {
        try {
          const fid = await getFidFromAddress(address);
          let profile = null;
          if (fid) {
            profile = await getUserProfile(fid);
          }

          // Always save to database, even if no Farcaster profile
          const name = profile?.username || address.toLowerCase();
          const pfp = profile?.pfp || null;

          try {
            await sql('INSERT INTO users (address, fid, name, pfp, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (address) DO UPDATE SET fid = EXCLUDED.fid, name = EXCLUDED.name, pfp = EXCLUDED.pfp, updated_at = EXCLUDED.updated_at',
              [address.toLowerCase(), fid, name, pfp, new Date().toISOString()]);
            console.log(`✅ Saved profile for ${address}:`, { fid, name, pfp });
          } catch (error) {
            console.warn(`❌ Failed to save profile for ${address}:`, error);
          }

          if (profile) {
            profiles[address.toLowerCase()] = profile;
          }
        } catch (error) {
          console.warn(`Failed to fetch profile for ${address}:`, error);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching Farcaster profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}