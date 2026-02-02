"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface LocationShareToggleProps {
  groupId: string
  initialValue: boolean
}

export default function LocationShareToggle({ groupId, initialValue }: LocationShareToggleProps) {
  const [isShared, setIsShared] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Linkの遷移を防ぐ
    e.stopPropagation()

    const newValue = !isShared
    setIsShared(newValue) // 楽観的更新
    setLoading(true)

    try {
      const res = await fetch(`/api/groups/${groupId}/membership`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_location_shared: newValue }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to update sharing setting")
        setIsShared(!newValue) // 元に戻す
      } else {
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
      setIsShared(!newValue) // 元に戻す
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isShared ? "このグループに居場所を公開中" : "このグループに居場所を非公開"}
      className={`p-2 rounded-full transition-colors ${
        isShared
          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isShared ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </button>
  )
}
