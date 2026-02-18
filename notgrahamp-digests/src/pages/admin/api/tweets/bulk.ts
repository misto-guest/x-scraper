import { bulkUpdateTweets } from '../../../../lib/admin-utils';
import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { ids, status } = body;
  
  bulkUpdateTweets(ids, status);
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
