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

  async function updateVRChatId(formData: FormData) {
    "use server"
    const session = await auth()
    if (!session?.user?.id) return

    const vrchat_id = formData.get("vrchat_id") as string

    await prisma.user.update({
      where: { id: session.user.id },
      data: { vrchat_id },
    })

    revalidatePath("/settings")
  }

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
        <h1 className="text-2xl font-bold mb-6">設定</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-4">AskMe!クライアント連携</h2>
          <form action={updateVRChatId} className="space-y-4">
            <div>
              <label htmlFor="vrchat_id" className="block text-sm font-medium text-gray-700">
                VRChat ID (usr_...)
              </label>
              <input
                type="text"
                name="vrchat_id"
                id="vrchat_id"
                defaultValue={user?.vrchat_id || ""}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="usr_..."
              />
              <p className="mt-1 text-xs text-gray-500">
                居場所取得アプリで使用しているVRChatのユーザーIDを入力してください。
              </p>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              保存する
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">API設定</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              APIキー
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                readOnly
                value={user?.api_key || "未発行"}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 text-sm font-mono"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              クライアントアプリからの現在位置更新に使用します。
            </p>
          </div>
          <form action={generateApiKey}>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="bg-white p-6 rounded-lg shadow-sm border h-64"></div>
      <div className="bg-white p-6 rounded-lg shadow-sm border h-48"></div>
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
