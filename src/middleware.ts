// Auth.js middleware — protects routes, redirects unauthenticated users to /login
export { auth as middleware } from "@/lib/auth"

export const config = {
  // Run middleware on all routes except:
  // - Next.js static assets (_next/static, _next/image)
  // - Favicon and public images
  // - The Auth.js API route itself (handled by the authorized callback)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt).*)"],
}
