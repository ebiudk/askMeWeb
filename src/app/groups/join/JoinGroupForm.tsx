"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface JoinGroupFormProps {
  initialToken: string
}

export default function JoinGroupForm({ initialToken }: JoinGroupFormProps) {
  const [token] = useState(initialToken)
  const [loading, setLoading] = useState(false)
  const [fetchingInfo, setFetchingInfo] = useState(false)
  const [groupInfo, setGroupInfo] = useState<{ id: string, name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialToken) {
      fetchInviteInfo(initialToken)
    }
  }, [initialToken])

  const fetchInviteInfo = async (t: string) => {
    setFetchingInfo(true)
    setError(null)
    try {
      const res = await fetch(`/api/groups/invite-info?token=${t}`)
      if (res.ok) {
        const data = await res.json()
        setGroupInfo(data.group)
      } else {
        const data = await res.json()
        setError(data.error || "無効な招待トークンです")
      }
    } catch (err) {
      console.error(err)
      setError("招待情報の取得に失敗しました")
    } finally {
      setFetchingInfo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/groups/${data.group.id}`)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "グループへの参加に失敗しました")
      }
    } catch (error) {
      console.error(error)
      alert("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingInfo) {
    return <div className="text-center py-10">招待情報を確認しています...</div>
  }

  if (groupInfo) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">グループへの招待</h1>
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{groupInfo.name}</span>
            <br />
            グループに招待されています
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "参加中..." : "参加を承諾する"}
          </button>
          <button
            onClick={() => router.push("/")}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">グループに参加</h1>
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          {error || "招待URLが無効か、有効期限が切れています。新しい招待URLを取得してください。"}
        </p>
      </div>
      <button
        onClick={() => router.push("/")}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        ダッシュボードへ戻る
      </button>
    </div>
  )
}
