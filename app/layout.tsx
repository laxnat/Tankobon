import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";

const overpass = Overpass({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Regular, SemiBold, Bold
});

export const metadata: Metadata = {
  title: "Tankōbon",
  description: "Track and manage your manga collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={overpass.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}