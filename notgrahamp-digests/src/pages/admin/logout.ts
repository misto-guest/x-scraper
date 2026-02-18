import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  context.cookies.delete('admin_auth', {
    path: '/'
  });
  return context.redirect('/admin/login');
}
