import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Footer from "@/components/footer";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TanstackQueryProvider from "@/components/providers/tanstack-query-provider";
import SessionProvider from "@/components/providers/session-provider";
import AbsentUserChecker from "@/components/absent-user-checker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://jotterblog.com"),
  title: "JotterBlog — AI Grading for Essays, Journals & Exit Tickets",
  description: "JotterBlog helps teachers assign essays, journals, and assessments — and lets AI grade them instantly using your own rubric. No answer keys. No multiple choice. Just real writing, automatically scored.",
  alternates: {
    canonical: "https://jotterblog.com",
  },
  keywords: [
    "student writing platform",
    "AI grading",
    "classroom blogging",
    "teacher writing tool",
    "student assessments",
    "assessments",
    "classroom assessments",
    "fight against AI",
    "AI in the classroom"
  ],
  openGraph: {
    title: "JotterBlog — AI Grading for Essays, Journals & Exit Tickets",
    description: "JotterBlog helps teachers assign essays, journals, and assessments — and lets AI grade them instantly using your own rubric. No answer keys. No multiple choice. Just real writing, automatically scored.",
    url: "https://jotterblog.com",
    siteName: "JotterBlog",
    images: [
      {
        url: "/images/open-graph-logo.png",
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
    title: "JotterBlog — AI Grading for Essays, Journals & Exit Tickets",
    description: "JotterBlog helps teachers assign essays, journals, and assessments — and lets AI grade them instantly using your own rubric. No answer keys. No multiple choice. Just real writing, automatically scored.",
    images: ["/images/open-graph-logo.png"],
  },
  appleWebApp: {
    title: 'JotterBlog — AI Grading for Essays, Journals & Exit Tickets',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="custom-scrollbar">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if(typeof URL!=="undefined"&&!URL.parse){URL.parse=function(u,b){try{return new URL(u,b);}catch(_){return null;}};}` }} />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} antialiasedju
          `}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <TanstackQueryProvider>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
            <ThemeProvider
              attribute='class'
              themes={["light", "dark", "tech", "cupid", "tuxedo", "avocado", "sky"]}
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AbsentUserChecker />
              <Toaster
                position="top-right"
              />
              <div className="flex min-h-screen flex-col">
                <div id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </div>
              </div>
              <Footer />
            </ThemeProvider>
          </TanstackQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}