import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXTAUTH_URL"] ?? "https://unkora.com"),
  title: { default: "Unkora — Premium Bengali Shopping", template: "%s | Unkora" },
  description: "বাংলাদেশের সেরা অনলাইন শপিং — বই, লেদার, বেবি, ইসলামিক ও অর্গানিক পণ্য",
  keywords: ["unkora", "online shopping", "bangladesh", "books", "leather", "islamic"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${hindSiliguri.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
