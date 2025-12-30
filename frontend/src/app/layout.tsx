import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from '@/context/AuthProvider';
import CookieBanner from '@/components/CookieBanner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechPulse - Daily Tech News",
  description: "AI, Computer Science, and Software Engineering news, summarized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                &copy; 2024 TechPulse. All rights reserved.
              </div>
            </footer>
            <CookieBanner />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
