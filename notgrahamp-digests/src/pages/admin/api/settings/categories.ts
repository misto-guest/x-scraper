import type { APIContext } from 'astro';
import { getOpenClawCategories } from '../../../../lib/admin-utils';

export async function GET(context: APIContext) {
  try {
    const categories = getOpenClawCategories();
    return new Response(
      JSON.stringify({ categories }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
