import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Ranchi — Google Business Profile & Local SEO Growth Engine",
  description: "Jharkhand's #1 local business growth platform. We help clinics, salons, hotels, and SMBs get verified and ranked on Google Maps, generate authentic 5-star reviews, and capture WhatsApp leads.",
  keywords: "Google Maps SEO Ranchi, Google Business Profile Jharkhand, local marketing Ranchi, review QR stands, digital ranchi",
  openGraph: {
    title: "Digital Ranchi — Local Business Growth & Google Maps System",
    description: "Rank #1 on Google Maps in Ranchi & Jharkhand. Get more direct calls, directions, and 5-star reviews.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteSettingsProvider>
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

