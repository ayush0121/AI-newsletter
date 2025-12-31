import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from '@/context/AuthProvider';
import CookieBanner from '@/components/CookieBanner';
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SynapseDigest | Daily AI & Tech News Summaries",
  description: "Get bite-sized daily summaries of the latest tech news. From AI breakthroughs to software engineering trends, stay informed in 5 minutes a day.",
  keywords: ["AI news", "tech newsletter", "software engineering", "daily summary", "tech trends"],
  openGraph: {
    title: "SynapseDigest | Daily AI & Tech News Summaries",
    description: "Your daily dose of AI & Tech news, summarized.",
    url: "https://synapsedigest.com",
    siteName: "SynapseDigest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynapseDigest | Daily AI & Tech News",
    description: "Stay ahead with daily tech summaries.",
  },
  icons: {
    icon: "/logo-v2.png",
    shortcut: "/logo-v2.png",
    apple: "/logo-v2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <AnimatedBackground />
            <div className="min-h-screen flex flex-col relative z-0">
              <Header />
              <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />

            </div>
            <CookieBanner />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
