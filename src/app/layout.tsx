import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaultsign — Enterprise e-Signature Platform",
  description:
    "Send, sign, and track documents end-to-end with enterprise-grade e-signatures. 100+ templates, in-built editor, real-time Brevo-powered tracking, and SOC 2 / HIPAA / eIDAS compliance.",
  keywords: [
    "Vaultsign", "e-signature", "electronic signature", "document signing",
    "DocuSign alternative", "Dropbox Sign", "Brevo", "enterprise", "audit trail",
  ],
  authors: [{ name: "Vaultsign" }],
  openGraph: {
    title: "Vaultsign — Enterprise e-Signature Platform",
    description: "Send, sign, and track documents end-to-end. 100+ templates, in-built editor, real-time tracking.",
    siteName: "Vaultsign",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
