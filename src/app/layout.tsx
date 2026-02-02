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
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 text-sm text-gray-500 text-center space-y-2">
            <div className="flex justify-center space-x-6 mb-2">
              <a href="https://github.com/ebiudk/askMeWeb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Github className="w-4 h-4" />
                <span>Web</span>
              </a>
              <a href="https://github.com/ebiudk/askMeClient" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Github className="w-4 h-4" />
                <span>Client</span>
              </a>
            </div>
            <p>© 2025 AskMe! - All Rights Reserved</p>
            <p className="max-w-3xl mx-auto leading-relaxed text-xs">
              AskMe! はVRChat Inc.が公式に作成・承認したものではなく、VRChat Inc.の見解・意見を反映したものではありません。VRChatはVRChat Inc.の商標または登録商標です。
            </p>
          </footer>
          <Notification />
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
