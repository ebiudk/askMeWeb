"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

export default function GroupInvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const [groupInfo, setGroupInfo] = useState<{ id: string, name: string, invite_code: string } | null>(null)
  const [fetchingInfo, setFetchingInfo] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const res = await fetch(`/api/groups/${id}`)
        if (res.ok) {
          const data = await res.json()
          setGroupInfo(data.group)
        } else {
          setError("グループが見つかりません")
        }
      } catch (err) {
        console.error("Failed to fetch group info:", err)
        setError("エラーが発生しました")
      } finally {
        setFetchingInfo(false)
      }
    }
    fetchGroupInfo()
  }, [id])

  const handleJoin = async () => {
    if (!groupInfo) return
    setLoading(true)

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: groupInfo.invite_code }),
      })

      if (res.ok) {
        router.push(`/groups/${id}`)
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
    return <div className="text-center py-10">招待情報を読み込んでいます...</div>
  }

  if (error || !groupInfo) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <p className="text-red-500 mb-4">{error || "グループ情報が取得できませんでした"}</p>
        <button onClick={() => router.push("/")} className="text-indigo-600 underline">ホームへ戻る</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-center">グループへの招待</h1>
      <div className="mb-6 text-center">
        <p className="text-lg">
          <span className="font-bold text-indigo-600">{groupInfo.name}</span>
          <br />
          グループに招待されています
        </p>
      </div>
      <div className="space-y-4">
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "参加中..." : "参加を承諾する"}
        </button>
        <button
          onClick={() => router.push("/")}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
