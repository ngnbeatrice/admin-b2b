import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import {
  LoginUseCase as LoginUserUseCase,
  InvalidCredentialsError,
  UserRepository,
} from '@/features/users'
import { env } from '@/lib/env'

const CredentialsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    updateAge: env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        try {
          const useCase = new LoginUserUseCase(new UserRepository())
          return await useCase.execute(parsed.data.email, parsed.data.password)
        } catch (error) {
          // Known domain error — wrong email or password
          if (error instanceof InvalidCredentialsError) return null
          // Infrastructure error (DB down, timeout, etc.) — surface it to the client
          // NextAuth will return { error: 'Configuration' } which LoginScreen detects
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
