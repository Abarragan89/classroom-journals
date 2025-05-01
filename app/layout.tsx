import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { headers } from 'next/headers';
import Footer from "@/components/footer";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TanstackQueryProvider from "@/components/providers/tanstack-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "JotterBlog",
  description: "Blogging Platform for Students",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const headersList = await headers();
  const nonce = headersList.get('x-nonce');
  if (!nonce) return

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        nonce={nonce}
      >
        <TanstackQueryProvider>
          <ReactQueryDevtools initialIsOpen={true} />
          <ThemeProvider
            attribute='class'
            themes={["light", "dark", "tech", "cupid", "tuxedo", "avocado"]}
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <Footer />
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
