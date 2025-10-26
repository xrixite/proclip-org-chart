import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_KEY = 'proclip-excluded-users';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for your Vercel domain
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get excluded users list
      const excludedUsers = await kv.get<string[]>(KV_KEY);
      res.status(200).json({ excludedUsers: excludedUsers || [] });
    } else if (req.method === 'POST') {
      // Update excluded users list
      const { excludedUsers } = req.body;

      if (!Array.isArray(excludedUsers)) {
        res.status(400).json({ error: 'excludedUsers must be an array' });
        return;
      }

      // Validate that all items are strings (user IDs)
      if (!excludedUsers.every((id) => typeof id === 'string')) {
        res.status(400).json({ error: 'All user IDs must be strings' });
        return;
      }

      // Store in Vercel KV
      await kv.set(KV_KEY, excludedUsers);

      res.status(200).json({ success: true, excludedUsers });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
