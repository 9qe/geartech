import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GearTech @geartechjo — إكسسوارات سيارات وتكنولوجيا",
  description:
    "GearTech — viral car accessories and tech gadgets, shipped from Amman, Jordan. Cash on Delivery & CliQ accepted.",
  keywords: [
    "GearTech",
    "geartechjo",
    "car accessories Jordan",
    "إكسسوارات سيارات",
    "Amman",
  ],
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
