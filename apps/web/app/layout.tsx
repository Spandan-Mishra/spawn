import type { Metadata } from "next";
import { Exo, Economica, Kode_Mono } from "next/font/google";
import "./globals.css";

const exo = Exo({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-exo",
});

const economica = Economica({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-economica",
});

const kodeMono = Kode_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-kode-mono",
});

export const metadata: Metadata = {
  title: "Spawn",
  description: "Spawn your projects, with just a prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${exo.variable} ${economica.variable} ${kodeMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
