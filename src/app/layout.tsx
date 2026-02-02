import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/auth-provider";
import Notification from "@/components/Notification"; // Notification を追加
import FeedbackButton from "@/components/FeedbackButton";

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
          <Notification />
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
