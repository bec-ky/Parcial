import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <Provider>
        <body className="relative min-h-screen">
          {children}
          <Link
            href="/logs"
            className="fixed bottom-4 right-4 border border-solid border-black rounded px-4 py-2 bg-white hover:bg-gray-100"
          >
            Logs
          </Link>
        </body>
      </Provider>
    </html>
  );
}