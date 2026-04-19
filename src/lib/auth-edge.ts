import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const {
  auth: authMiddleware,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.image = (token.image as string) || session.user.image;
        (session.user as { currency?: string }).currency =
          (token.currency as string) || "INR";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.currency = (user as { currency?: string }).currency || "INR";
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.AUTH_SECRET,
});
