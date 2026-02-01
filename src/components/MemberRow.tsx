"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface MemberRowProps {
  groupId: string
  membership: {
    id: string
    role: string
    user: {
      id: string
      name: string | null
      display_name: string | null
      location: {
        world_id: string | null
        world_name: string | null
        instance_id: string | null
        is_hidden: boolean
        updated_at: Date | string | null
      } | null
    }
  }
  currentUserRole: string
  currentUserId: string
}

export default function MemberRow({ groupId, membership, currentUserRole, currentUserId }: MemberRowProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: string) => {
    if (newRole === membership.role) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${membership.user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to update role")
      } else {
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const canManage = (myRole: string, targetRole: string) => {
    if (membership.user.id === currentUserId) return false // Cannot change own role here
    if (myRole === "admin") return true
    if (myRole === "co-admin") return targetRole === "member"
    return false
  }

  const showManagement = canManage(currentUserRole, membership.role)

  return (
    <li key={membership.user.id}>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm font-medium text-indigo-600 truncate">
              {membership.user.display_name || membership.user.name || "不明なユーザー"}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                membership.role === "admin" 
                  ? "bg-purple-100 text-purple-800" 
                  : membership.role === "co-admin"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {membership.role === "admin" ? "管理者" : membership.role === "co-admin" ? "共同管理者" : "メンバー"}
              </p>
            </div>
          </div>

          {showManagement && (
            <div className="ml-2 flex items-center space-x-2">
              <select
                disabled={loading}
                value={membership.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-white cursor-pointer"
              >
                <option value="member">メンバー</option>
                <option value="co-admin">共同管理者</option>
                {currentUserRole === "admin" && <option value="admin">管理者</option>}
              </select>
            </div>
          )}
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              居場所: {
                (membership.user.location?.is_hidden || !membership.user.location?.world_name) 
                ? (
                  <span title="VRChatがオフライン、もしくはAskMe!を起動していません" className="cursor-help">
                    オフライン
                  </span>
                )
                : membership.user.location.world_name
              }
              {membership.user.location && !membership.user.location.is_hidden && membership.user.location.world_id && (
                <a 
                  href={`https://vrchat.com/home/launch?worldId=${membership.user.location.world_id}${membership.user.location.instance_id ? `&instanceId=${membership.user.location.instance_id}` : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-indigo-600 hover:text-indigo-900 underline"
                >
                  VRChatで開く
                </a>
              )}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <p>
              最終更新:{" "}
              {membership.user.location?.updated_at
                ? new Date(membership.user.location.updated_at).toLocaleString("ja-JP")
                : "なし"}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}
