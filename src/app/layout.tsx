import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ChainHeader } from "@/components/chain-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "Chain Reactor";

export const metadata: Metadata = {
  title: `${chainName} Explorer`,
  description: `Block explorer for ${chainName}`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-[family-name:var(--font-sans)]`}>
        <div className="min-h-screen flex flex-col">
          <ChainHeader />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-xs text-muted-foreground">
            Powered by <span className="font-medium text-foreground">Chain Reactor</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
