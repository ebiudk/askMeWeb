import Link from "next/link"
import { auth, signOut } from "@/auth"

export default async function Navbar() {
  const session = await auth()

  return (
    <nav className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="AskMe Logo" className="h-8 w-8" />
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">AskMe! Web</span>
            </Link>
            <Link href="https://github.com/ebiudk/askMeClient/releases/latest" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ml-2 sm:ml-4">
              <span className="hidden sm:inline">クライアントダウンロード</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                <Link href="/settings" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                  設定
                </Link>
                <span className="text-gray-700 dark:text-zinc-300 hidden md:inline truncate max-w-[100px]">{session.user?.name || session.user?.email}</span>
                <form
                  action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" })
                  }}
                >
                  <button className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
