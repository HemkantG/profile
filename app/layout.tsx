import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Profile Generator — InfoBeans",
  description: "Generate branded InfoBeans profile documents (DOCX & PDF) from LLM-extracted JSON. Creating WOW!",
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[--background] text-ink">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <footer className="mt-16 bg-ink-dark text-gray-300">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-white px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE}/img/logo.png`} alt="InfoBeans" className="h-6 w-auto" />
              </span>
            </div>
            <p className="text-center text-sm sm:text-right">
              <span className="font-medium text-white">Profile Generator</span>
              <span className="mx-2 text-gray-500">·</span>
              Creating <span className="font-semibold text-brand-500">WOW!</span>
            </p>
          </div>
          <div className="border-t border-white/10">
            <p className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-gray-500 sm:text-left">
              Internal tooling · Generates documents styled to the InfoBeans profile templates.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
