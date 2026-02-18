import { createReview } from '../../../lib/admin-utils';
import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const formData = await context.request.formData();
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;
  const actionItemsText = formData.get('actionItems') as string;

  const actionItems = actionItemsText
    .split('\n')
    .filter(line => line.trim())
    .map(text => ({ text: text.trim(), completed: false }));

  createReview({
    date,
    notes: notes || '',
    actionItems
  });

  return context.redirect('/admin/reviews?created=true');
}
