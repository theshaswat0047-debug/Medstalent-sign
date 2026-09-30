import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Vercel project: vault_sign → URL: vaultsign-khaki.vercel.app
  metadataBase: new URL("https://vaultsign-khaki.vercel.app"),
  title: "VaultSign — Secure. Sign. Done.",
  description:
    "VaultSign is an enterprise-grade e-signature platform. Send, sign, and track documents end-to-end with 100+ templates, an in-built editor, real-time tracking, and SOC 2 / HIPAA / eIDAS compliance.",
  keywords: [
    "VaultSign", "e-signature", "electronic signature", "document signing",
    "DocuSign alternative", "Dropbox Sign", "enterprise", "audit trail",
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
    description: "Enterprise e-signature platform with real-time tracking.",
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
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
