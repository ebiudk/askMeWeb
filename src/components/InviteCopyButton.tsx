"use client"

import { useState } from "react"

export default function InviteCopyButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const url = `${window.location.origin}/groups/${inviteCode.startsWith('join') ? '' : ''}${window.location.pathname}/join`
    // Since we are already in /groups/[id], we can just use the current path
    const fullUrl = `${window.location.origin}${window.location.pathname}/join`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-2 flex items-center space-x-2">
      <button
        onClick={copyToClipboard}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        {copied ? "コピーしました！" : "招待URLをコピー"}
      </button>
      <span className="text-xs text-gray-400">
        このURLを参加者に共有してください
      </span>
    </div>
  )
}
