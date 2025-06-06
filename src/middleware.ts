import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public/assets folder
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}