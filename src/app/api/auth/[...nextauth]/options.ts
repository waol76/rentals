import type { NextAuthOptions } from 'next-auth'
import Google from 'next-auth/providers/google'

// List of allowed email addresses
const allowedEmails = [
  'waol76@gmail.com',
  'catua81@gmail.com',
  // Add more authorized emails as needed
];

export const options: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // If the user's email isn't in the allowed list, return false to show error
      return user.email ? allowedEmails.includes(user.email) : false;
    },
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
  pages: {
    // This is essential - define your custom error page here
    error: '/auth/error',
    // You can also define custom signIn and signOut pages if needed
    // signIn: '/auth/signin',
    // signOut: '/auth/signout',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}