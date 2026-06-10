import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseTrack — Competitor Intelligence",
  description: "Monitor competitors, auto-summarize changes, send digest emails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-sans)" },
          }}
        />
      </body>
    </html>
  );
}
