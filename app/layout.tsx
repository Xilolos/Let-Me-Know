import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MobileNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ProgressBar from "@/components/ProgressBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccentProvider } from "@/components/AccentProvider";
import { AmoledProvider } from "@/components/AmoledProvider";

export const metadata: Metadata = {
  title: "Let Me Know",
  description: "Your personalized AI web watcher",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Let Me Know",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccentProvider>
            <AmoledProvider>
              <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
                {children}
              </main>
              <ProgressBar />
              <ServiceWorkerRegister />
            </AmoledProvider>
          </AccentProvider>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
