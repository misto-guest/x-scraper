import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const formData = await context.request.formData();
  const password = formData.get('password');
  
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    context.cookies.set('admin_auth', 'true', {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return context.redirect('/admin');
  } else {
    return context.redirect('/admin/login?error=invalid');
  }
}
