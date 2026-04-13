// app/lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import Email from "next-auth/providers/email";

export async function authorizeCredentials(
  credentials: Record<"email" | "password", string> | undefined
) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Invalid credentials");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true, name: true, email: true, password: true, image: true },
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials")
  }

  const isCorrectPassword = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new Error("Invalid credentials");
  }

  return { id: user.id, name: user.name, email: user.email, image: user.image };
  
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      // Fetch isPremium fresh every time - keeps it in sync after webhook fires
      const dbUser = await prisma.user.findUnique({
        where: { id: (user?.id ?? token.id ) as string },
        select: { isPremium: true },
      });
      
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: dbUser?.isPremium ?? false,
          sub: token.sub,
          iat: token.iat,
          exp: token.exp,
          jti: token.jti,
          // Image intentionally excluded — fetch via /api/profile/image instead
        };
      }

      return { ...token, isPremium: dbUser?.isPremium ?? false };
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isPremium = token.isPremium;
        // Image is not in the token — components fetch it via /api/profile/image
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};