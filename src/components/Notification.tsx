"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { X } from "lucide-react"

function NotificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const msg = searchParams.get("message")
    if (msg === "already_authenticated") {
      setMessage("認証済みです")
      setShow(true)
      
      // クエリパラメータを削除
      const params = new URLSearchParams(searchParams.toString())
      params.delete("message")
      const newQuery = params.toString()
      const newUrl = `${pathname}${newQuery ? `?${newQuery}` : ""}`
      router.replace(newUrl)

      // 5秒後に消す
      const timer = setTimeout(() => {
        setShow(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router, pathname])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <button 
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Notification() {
  return (
    <Suspense fallback={null}>
      <NotificationContent />
    </Suspense>
  )
}
