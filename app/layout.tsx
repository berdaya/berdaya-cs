import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chatbot Admin Panel - Berdaya",
  description: "Admin panel for managing chatbots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="pt-2">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}