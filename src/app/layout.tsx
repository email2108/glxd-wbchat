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
  title: "GLXD - Hệ thống xác thực OTP qua Telegram",
  description: "Hệ thống xác thực OTP an toàn và chuyên nghiệp qua Telegram với đầy đủ tính năng quản lý và giới thiệu.",
  keywords: ["GLXD", "OTP", "Telegram", "Xác thực", "Bảo mật", "Referral", "Dashboard"],
  authors: [{ name: "GLXD Team" }],
  openGraph: {
    title: "GLXD - Hệ thống xác thực OTP",
    description: "Hệ thống xác thực OTP an toàn qua Telegram",
    url: "https://glxd.com",
    siteName: "GLXD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GLXD - Hệ thống xác thực OTP",
    description: "Hệ thống xác thực OTP an toàn qua Telegram",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
