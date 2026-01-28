import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { RootProvider } from "./provider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open-Prism | LaTeX Writing Workspace",
  description: "AI-powered LaTeX writing workspace inspired by OpenAI Prism",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={cn(
          geistSans.className,
          geistMono.variable,
          "h-full antialiased",
        )}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
