import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display, Hind_Siliguri } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const hindSiliguri = Hind_Siliguri({ subsets: ["bengali"], weight: ["400","500","600","700"], variable: "--font-hind-siliguri", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Unkora — আপনার বিশ্বস্ত অনলাইন শপ", template: "%s | Unkora" },
  description: "বই, লেদার পণ্য, বেবি প্রোডাক্ট, ইসলামিক লাইফস্টাইল ও অর্গানিক ফুড — সারা বাংলাদেশে দ্রুত ডেলিভারি।",
  keywords: ["online shop bangladesh", "bangladeshi books", "leather goods", "baby products", "islamic products", "organic food bangladesh", "unkora"],
  metadataBase: new URL("https://unkora.com"),
  openGraph: { type: "website", locale: "bn_BD", alternateLocale: "en_US", siteName: "Unkora", url: "https://unkora.com" },
  twitter: { card: "summary_large_image", site: "@unkora" },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = { themeColor: "#B45309" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${dmSans.variable} ${playfair.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen bg-cream-50 font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
