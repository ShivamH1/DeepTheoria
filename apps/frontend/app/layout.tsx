import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DeepTheoria",
  description:
    "Multi-agent research pipeline: web search, scraping, AI-generated reports, and quality critique.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <SmoothScroll>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 min-h-screen">{children}</main>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
