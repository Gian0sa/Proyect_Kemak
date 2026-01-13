import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Intentamos obtener el token de las cookies (es más seguro para Middleware)
  // Nota: Para que esto funcione al 100%, al loguearte deberíamos guardar el token también en cookies
  const authCookie = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Definir rutas protegidas (Dashboard, Ventas, Gestión)
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                        pathname.startsWith('/admin') || 
                        pathname.startsWith('/ventas');

  // 3. Si intenta entrar a ruta protegida sin token, al Login
  if (isProtectedRoute && !authCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Si ya está logueado e intenta ir al Login, al Dashboard
  if (pathname.startsWith('/auth/login') && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
// 5. Configurar qué rutas debe "vigilar" el middleware
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/ventas/:path*', 
    '/auth/login'
  ],
};