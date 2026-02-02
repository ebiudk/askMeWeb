import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Suspense } from "react"
import crypto from "node:crypto"

async function SettingsContent({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  async function generateApiKey() {
    "use server"
    const session = await auth()
    if (!session?.user?.id) return

    const apiKey = crypto.randomUUID()

    await prisma.user.update({
      where: { id: session.user.id },
      data: { api_key: apiKey },
    })

    revalidatePath("/settings")
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-50">設定</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border dark:border-zinc-800">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-zinc-100">API設定</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400">
              APIキー
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                readOnly
                value={user?.api_key || "未発行"}
                className="block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm font-mono"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
              クライアントアプリからの現在位置更新に使用します。
            </p>
          </div>
          <form action={generateApiKey}>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {user?.api_key ? "APIキーを再発行する" : "APIキーを発行する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/4 mb-6"></div>
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border dark:border-zinc-800 h-48"></div>
    </div>
  )
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent userId={session.user.id} />
    </Suspense>
  )
}
