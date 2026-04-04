import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Laureano Racing — Gestión",
  description: "Sistema de gestión para repuestos, accesorios y taller de motos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-[#080808] via-[#080808] to-[#0F0808]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
