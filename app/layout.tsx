import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Let Me Know",
  description: "Your personalized AI web watcher",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming for "native app" feel
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
