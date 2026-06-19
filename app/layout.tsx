import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Post Manager",
  description: "社群貼文排程與管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
