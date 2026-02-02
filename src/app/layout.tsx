import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import Notification from "@/components/Notification"; // Notification を追加
import FeedbackButton from "@/components/FeedbackButton";
import { Github } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL("https://ask-me.ebiudk.link"),
  title: "AskMe! Web",
  description: "Real-time VRChat log monitoring and instance tracking.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-6 px-4 text-[10px] text-gray-400 dark:text-zinc-500 text-center">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-3">
                  <a href="https://github.com/ebiudk/askMeWeb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                    <Github className="w-3 h-3" />
                    <span>Web</span>
                  </a>
                  <a href="https://github.com/ebiudk/askMeClient" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                    <Github className="w-3 h-3" />
                    <span>Client</span>
                  </a>
                  <span className="hidden md:inline">|</span>
                  <span>© 2025 AskMe!</span>
                </div>
                <p className="leading-tight opacity-80">
                  AskMe! はVRChat Inc.が公式に作成・承認したものではなく、VRChat Inc.の見解・意見を反映したものではありません。<br />
                  VRChatはVRChat Inc.の商標または登録商標です。
                </p>
              </div>
            </footer>
            <Notification />
            <FeedbackButton />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
