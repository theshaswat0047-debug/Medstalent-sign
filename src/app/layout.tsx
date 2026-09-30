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
  title: "VaultSign — Secure. Sign. Done.",
  description:
    "VaultSign is an enterprise-grade e-signature platform. Send, sign, and track documents end-to-end with 100+ templates, an in-built editor, real-time Brevo-powered tracking, and SOC 2 / HIPAA / eIDAS compliance.",
  keywords: [
    "VaultSign", "e-signature", "electronic signature", "document signing",
    "DocuSign alternative", "Dropbox Sign", "Brevo", "enterprise", "audit trail",
    "Secure Sign Done",
  ],
  authors: [{ name: "VaultSign" }],
  icons: {
    icon: [
      { url: "/vaultsign-favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/vaultsign-favicon.png", sizes: "512x512" },
    ],
  },
  openGraph: {
    title: "VaultSign — Secure. Sign. Done.",
    description: "Enterprise e-signature platform. 100+ templates, in-built editor, real-time tracking.",
    siteName: "VaultSign",
    type: "website",
    images: ["/vaultsign-brand.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultSign — Secure. Sign. Done.",
    description: "Enterprise e-signature platform with real-time Brevo tracking.",
    images: ["/vaultsign-brand.png"],
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
