import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/auth-provider";
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
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20">
            {children}
          </main>
          <footer className="fixed bottom-0 left-0 right-0 bg-gray-50/90 backdrop-blur-sm border-t border-gray-200 py-2 px-4 text-[10px] text-gray-400 text-center z-40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-0.5">
              <div className="flex items-center gap-3">
                <a href="https://github.com/ebiudk/askMeWeb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                  <Github className="w-3 h-3" />
                  <span>Web</span>
                </a>
                <a href="https://github.com/ebiudk/askMeClient" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
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
        </AuthProvider>
      </body>
    </html>
  );
}
