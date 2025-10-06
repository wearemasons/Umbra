import type { Metadata } from "next";

import { Lobster } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Umbra",
  description:
    "Umbra is a research knowledge management platform that uses AI to collect, summarize, and organize scientific papers into a structured database. Visualize connections, discover hidden patterns, and build a deeper understanding of the scientific landscape with our interactive graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lobster.variable} antialiased vsc-initialized`}>
        <ThemeProvider defaultTheme="system">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
