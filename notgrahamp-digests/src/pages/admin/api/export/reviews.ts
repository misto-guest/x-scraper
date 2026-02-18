import { exportReviewsAsMarkdown, exportReviewsAsCSV } from '../../../../lib/admin-utils';
import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const formData = await context.request.formData();
  const format = formData.get('format') as string;
  
  let content: string;
  let filename: string;
  let contentType: string;

  if (format === 'csv') {
    content = exportReviewsAsCSV();
    filename = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
    contentType = 'text/csv';
  } else {
    content = exportReviewsAsMarkdown();
    filename = `reviews-export-${new Date().toISOString().split('T')[0]}.md`;
    contentType = 'text/markdown';
  }

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
