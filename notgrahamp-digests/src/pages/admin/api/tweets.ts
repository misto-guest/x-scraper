import { updateTweetStatus } from '../../../lib/admin-utils';
import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { id, status, tags } = body;
  
  updateTweetStatus(id, status, tags);
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
