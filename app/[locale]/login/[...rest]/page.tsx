import { redirect } from '@/lib/navigation'

/**
 * Any unknown sub-path under /login (e.g. /login/sqdsd) redirects to /login.
 */
export default function LoginCatchAll() {
  redirect('/login')
}
