import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { getLists } from "@/app/actions/list";
import { getTaskCounts } from "@/app/actions/task";
import { Toaster } from "@/components/ui/sonner";
import { ShortcutManager } from "@/components/ShortcutManager";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ViewTransitions } from "@/components/ViewTransitions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gemini Tasks",
  description: "A modern daily task planner",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [lists, counts] = await Promise.all([
      getLists(),
      getTaskCounts()
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen overflow-hidden bg-background text-foreground`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="md:hidden p-4 border-b flex items-center">
                    <MobileSidebar lists={lists} counts={counts} />
                    <span className="font-bold ml-2">Gemini Tasks</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
            <ShortcutManager />
            <ViewTransitions />
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
