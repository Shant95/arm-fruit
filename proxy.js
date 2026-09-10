// proxy.js
import { NextResponse } from 'next/server';

export default function proxy(request) {
  // Rate limiting временно отключен для разработки
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};