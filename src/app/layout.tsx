import type { Metadata } from "next";
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
    icon: '/logo.png',
  },
};

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
