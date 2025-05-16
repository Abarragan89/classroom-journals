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
  keywords: [
    "student writing platform",
    "AI grading",
    "classroom blogging",
    "teacher writing tool",
    "student assessments",
    "exit tickets",
    "classroom assessments",
    "fight against AI",
    "AI in the classroom"
  ],
  openGraph: {
    title: "JotterBlog",
    description: "Manage student writing and assessments. Share work as blog posts, auto-grade with AI, and write in a distraction-free, feedback-friendly classroom space.",
    url: "https://www.jotterblog.com", // <-- update this to your domain
    siteName: "JotterBlog",
    images: [
      {
        url: "/images/open-graph-logo.png", // <-- Add your image here
        width: 1200,
        height: 630,
        alt: "JotterBlog social preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JotterBlog",
    description: "Manage student writing and assessments. Share work as blog posts, auto-grade with AI, and write in a distraction-free, feedback-friendly classroom space.",
    images: ["/images/open-graph-logo.png"],
  },
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
