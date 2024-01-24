import NextAuth from "next-auth";
import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";

import { db } from "@/lib/db";
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/",
    error: "/errors",
  },
  adapter: PrismaAdapter(db),
  // session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          username: profile.given_name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        const propertiesToDelete = ["creditBalance", "firstName", "lastName", "planId"];
        propertiesToDelete.forEach((property) => {
          if (property in session.user) {
            delete session.user[property as keyof typeof session.user];
          }
        });
      }
      return session;
    },
  },
});
