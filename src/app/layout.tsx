import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DRC Tires - Lốp xe chất lượng cao với AI kiểm tra",
  description: "Mua lốp xe DRC Tires. Kiểm tra độ mòn lốp bằng AI tiên tiến. Giao hàng toàn quốc.",
  keywords: "lốp xe, DRC Tires, kiểm tra lốp AI, lốp xe máy, lốp ô tô",
  icons: {
    icon: [
      { url: "/logo-mp.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-mp.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-mp.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DRC Tires',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#dc2626',
  viewportFit: 'cover',
};

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ChatBot from '@/components/ai/ChatBot';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
