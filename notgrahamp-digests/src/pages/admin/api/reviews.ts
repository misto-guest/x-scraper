import type { APIContext } from 'astro';
import { createReview } from '../../../lib/admin-utils';

export async function POST(context: APIContext) {
  try {
    const body = await context.request.json();
    const { date, notes, actionItems } = body;

    if (!date || !notes) {
      return new Response(
        JSON.stringify({ error: 'Date and notes are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const review = createReview({
      date,
      notes,
      actionItems: actionItems || []
    });

    return new Response(
      JSON.stringify({ success: true, review }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating review:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create review: ' + (error.message || 'Unknown error') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
