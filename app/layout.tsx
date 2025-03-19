import type { Metadata } from "next";
// import localFont from "next/font/local";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./components/ui/sonnner";

import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { dark } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Kode Karo",
  description:
    "Track, bookmark, and conquer coding contests. Elevate your competitive programming journey!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className="w-full h-full min-h-screen bg-background flex items-center justify-center">
          {/* Centering Wrapper */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              {children}
              <Analytics />
            </div>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
