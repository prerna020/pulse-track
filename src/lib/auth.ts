import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    EmailProvider({
      from: process.env.RESEND_FROM_EMAIL ?? "PulseTrack <onboarding@resend.dev>",
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier, url }) {
        if (!process.env.RESEND_API_KEY || !resend) {
          console.log(`\n\n[LOCAL DEV] Magic Link for ${identifier}: ${url}\n\n`);
          return;
        }

        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "PulseTrack <onboarding@resend.dev>",
          to: identifier,
          subject: "Sign in to PulseTrack",
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h1 style="color: #1a1208; font-size: 20px; margin-bottom: 8px;">Sign in to PulseTrack</h1>
              <p style="color: #5c4a32; font-size: 14px; margin-bottom: 24px;">
                Click the button below to sign in. This link expires in 24 hours.
              </p>
              <a href="${url}" style="display: inline-block; background: #1a1208; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                Sign in
              </a>
              <p style="color: #9c8570; font-size: 12px; margin-top: 24px;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          `,
        });

        if (error) {
          throw new Error(error.message);
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Auto-create user for easy login
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
            }
          });
          return newUser;
        }

        if (!user.password) {
          throw new Error("Account created with another provider. Please use Google or Magic Link.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return user;
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
