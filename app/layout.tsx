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
  title: "Pragati — AI Career Operating System",
  description: "Upload your resume, analyze job descriptions, and get AI-powered guidance on whether to apply, improve first, or skip. Career Intelligence Meets Career Growth.",
  keywords: ["job search", "resume analysis", "career decision", "interview prep", "AI career coach"],
  authors: [{ name: "Pragati" }],
  openGraph: {
    title: "Pragati — AI Career Operating System",
    description: "Career Intelligence Meets Career Growth",
    type: "website",
    url: "https://pragati.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pragati — AI Career Operating System",
    description: "Career Intelligence Meets Career Growth",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
