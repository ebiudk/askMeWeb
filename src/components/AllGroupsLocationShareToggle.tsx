"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function AllGroupsLocationShareToggle() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleAll = async (isShared: boolean) => {
    setLoading(true)

    try {
      const res = await fetch("/api/membership/toggle-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_location_shared: isShared }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to update all sharing settings")
      } else {
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleToggleAll(true)}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
        ) : (
          <Eye className="mr-1.5 h-3 w-3" />
        )}
        すべての共有をオン
      </button>
      <button
        onClick={() => handleToggleAll(false)}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-zinc-700 text-xs font-medium rounded-md shadow-sm text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
        ) : (
          <EyeOff className="mr-1.5 h-3 w-3" />
        )}
        すべての共有をオフ
      </button>
    </div>
  )
}
