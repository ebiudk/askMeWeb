import { signIn, auth } from "@/auth"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()

  if (session?.user) {
    redirect("/?message=already_authenticated")
  }

  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-[calc(100-64px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <Image
              src="/logo.png"
              alt="AskMe Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            AskMe! Web にログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ログ管理画面にアクセスするために認証が必要です
          </p>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("twitter", { redirectTo: callbackUrl || "/" })
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X でログイン
          </button>
        </form>
      </div>
    </div>
  )
}
