import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Body font
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
});

// Display font
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
})

export const metadata: Metadata = {
  title: "Tankōbon",
  description: "Track and manage your manga collection",
  icons: {
    icon: "/tankobon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${archivo.variable} ${archivoBlack.variable}`}>
      <body className={archivo.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}