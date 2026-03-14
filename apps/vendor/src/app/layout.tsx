import type { Metadata } from "next";
import { DM_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { VendorProviders } from "@/components/layout/VendorProviders";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const hindSiliguri = Hind_Siliguri({ subsets: ["bengali"], weight: ["400","500","600","700"], variable: "--font-hind-siliguri", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Unkora Vendor Portal", template: "%s | Vendor" },
  description: "Unkora ভেন্ডর পোর্টাল — আপনার দোকান পরিচালনা করুন",
};

export default function VendorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${dmSans.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <VendorProviders>{children}</VendorProviders>
      </body>
    </html>
  );
}
