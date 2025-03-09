import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }