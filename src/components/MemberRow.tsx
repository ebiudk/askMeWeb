"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, CheckIcon, TrashIcon } from "@heroicons/react/20/solid"

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
  const [localRole, setLocalRole] = useState(membership.role)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRoleChange = async (newRole: string) => {
    if (newRole === localRole) {
      setIsOpen(false)
      return
    }

    const previousRole = localRole
    setLocalRole(newRole) // Optimistic update
    setIsOpen(false)
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
        setLocalRole(previousRole) // Revert on failure
      } else {
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
      setLocalRole(previousRole) // Revert on failure
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    const isSelf = membership.user.id === currentUserId
    const confirmMessage = isSelf 
      ? "本当にこのグループを抜けますか？" 
      : `${membership.user.display_name || membership.user.name} をグループから削除しますか？`
    
    if (!confirm(confirmMessage)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${membership.user.id}/role`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to remove member")
        setLoading(false)
      } else {
        if (isSelf) {
          router.push("/")
        }
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
      setLoading(false)
    }
  }

  const canManage = (myRole: string, targetRole: string) => {
    if (membership.user.id === currentUserId) return false // Cannot change own role here
    if (myRole === "admin") return true
    if (myRole === "co-admin") {
      // Co-admin can manage anyone who is not an admin
      return targetRole !== "admin"
    }
    return false
  }

  const canRemove = (myRole: string, targetRole: string) => {
    if (membership.user.id === currentUserId) return true // Can always leave
    if (myRole === "admin") return true
    if (myRole === "co-admin") return targetRole === "member"
    return false
  }

  const showManagement = canManage(currentUserRole, membership.role)
  const showRemove = canRemove(currentUserRole, membership.role)

  const roles = [
    { id: "member", label: "メンバー", description: "居場所の閲覧が可能" },
    { id: "co-admin", label: "共同管理者", description: "メンバー管理が可能" },
    ...(currentUserRole === "admin" ? [{ id: "admin", label: "管理者", description: "全権限を保持" }] : []),
  ]

  return (
    <li key={membership.user.id} className="hover:bg-gray-50 transition-colors duration-150 first:rounded-t-md last:rounded-b-md">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {membership.user.display_name || membership.user.name || "不明なユーザー"}
            </p>
            <div className="ml-3 flex-shrink-0 flex">
              <p className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                localRole === "admin" 
                  ? "bg-purple-100 text-purple-800 border border-purple-200" 
                  : localRole === "co-admin"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}>
                {localRole === "admin" ? "管理者" : localRole === "co-admin" ? "共同管理者" : "メンバー"}
              </p>
            </div>
            {loading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showManagement && (
              <div className="flex items-center relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => !loading && setIsOpen(!isOpen)}
                  disabled={loading}
                  className={`
                    inline-flex items-center justify-between w-32 px-3 py-1.5 text-sm font-medium border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
                    ${loading ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 hover:border-indigo-400 focus:ring-indigo-500 focus:border-indigo-500"}
                  `}
                >
                  <span>{roles.find(r => r.id === localRole)?.label}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleChange(role.id)}
                          className={`
                            group flex w-full items-start px-4 py-2 text-sm text-left transition-colors duration-150
                            ${localRole === role.id ? "bg-indigo-50 text-indigo-900" : "text-gray-700 hover:bg-gray-50"}
                          `}
                          role="menuitem"
                        >
                          <div className="flex-1">
                            <p className={`font-medium ${localRole === role.id ? "text-indigo-900" : "text-gray-900"}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-gray-500 group-hover:text-gray-600 mt-0.5">
                              {role.description}
                            </p>
                          </div>
                          {localRole === role.id && (
                            <CheckIcon className="h-4 w-4 text-indigo-600 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!showManagement && showRemove && (
              <button
                onClick={handleRemoveMember}
                disabled={loading}
                className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {membership.user.id === currentUserId ? "脱退する" : "削除"}
              </button>
            )}

            {showManagement && (
              <button
                onClick={handleRemoveMember}
                disabled={loading}
                title={membership.user.id === currentUserId ? "脱退する" : "メンバーを削除"}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
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
