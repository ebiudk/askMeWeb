"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, CheckIcon, TrashIcon } from "@heroicons/react/20/solid"

import { MemberViewModel } from "@/view-models/MemberViewModel"

interface MemberRowProps {
  groupId: string
  membership: MemberViewModel
  currentUserRole: string
  currentUserId: string
}

export default function MemberRow({ groupId, membership, currentUserRole, currentUserId }: MemberRowProps) {
  const [localRole, setLocalRole] = useState(membership.role)
  const [isLocationShared, setIsLocationShared] = useState(membership.isLocationShared)
  const [isRemoved, setIsRemoved] = useState(false)
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
      const res = await fetch(`/api/groups/${groupId}/members/${membership.userId}/role`, {
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

  const handleToggleLocationShare = async () => {
    const newValue = !isLocationShared
    setIsLocationShared(newValue)
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
        setIsLocationShared(!newValue)
      } else {
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
      setIsLocationShared(!newValue)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    const isSelf = membership.userId === currentUserId
    const confirmMessage = isSelf 
      ? "本当にこのグループを抜けますか？" 
      : `${membership.name} をグループから削除しますか？`
    
    if (!confirm(confirmMessage)) return

    setIsRemoved(true) // Optimistic update
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${membership.userId}/role`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to remove member")
        setIsRemoved(false) // Revert
        setLoading(false)
      } else {
        if (isSelf) {
          router.push("/")
        }
        router.refresh()
      }
    } catch (error) {
      alert("An error occurred")
      setIsRemoved(false) // Revert
      setLoading(false)
    }
  }

  const canManage = (myRole: string, targetRole: string) => {
    if (membership.userId === currentUserId) return false // Cannot change own role here
    if (myRole === "admin") return true
    if (myRole === "co-admin") {
      // Co-admin can manage anyone who is not an admin
      return targetRole !== "admin"
    }
    return false
  }

  const canRemove = (myRole: string, targetRole: string) => {
    if (membership.userId === currentUserId) return true // Can always leave
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

  if (isRemoved) return null;

  return (
    <li key={membership.userId} className={`relative hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors duration-150 first:rounded-t-md last:rounded-b-md ${isOpen ? "z-10" : ""}`}>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-3 sm:gap-y-0">
          <div className="flex items-center min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
              {membership.name}
            </p>
            <div className="ml-2 sm:ml-3 flex-shrink-0 flex">
              <p className={`px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-5 font-medium rounded-full ${
                localRole === "admin" 
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800" 
                  : localRole === "co-admin"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
              }`}>
                {localRole === "admin" ? "管理者" : localRole === "co-admin" ? "共管" : "会員"}
              </p>
            </div>
            {loading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
            )}
          </div>

          <div className="flex items-center space-x-2 pb-1 sm:pb-0">
            {membership.userId === currentUserId && (
              <button
                onClick={handleToggleLocationShare}
                disabled={loading}
                className={`inline-flex items-center whitespace-nowrap px-2 py-1 border text-[10px] sm:text-xs font-medium rounded transition-colors duration-150 ${
                  isLocationShared 
                    ? "border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
                    : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
              >
                {isLocationShared ? "🔓公開中" : "🔒非公開"}
              </button>
            )}

            {showManagement && (
              <div className="flex items-center relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => !loading && setIsOpen(!isOpen)}
                  disabled={loading}
                  className={`
                    inline-flex items-center justify-between w-32 px-3 py-1.5 text-sm font-medium border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
                    ${loading ? "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed" : "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-400 focus:ring-indigo-500 focus:border-indigo-500"}
                  `}
                >
                  <span>{roles.find(r => r.id === localRole)?.label}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black dark:ring-zinc-800 ring-opacity-5 z-20 overflow-hidden">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleChange(role.id)}
                          className={`
                            group flex w-full items-start px-4 py-2 text-sm text-left transition-colors duration-150
                            ${localRole === role.id ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-300" : "text-gray-700 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"}
                          `}
                          role="menuitem"
                        >
                          <div className="flex-1">
                            <p className={`font-medium ${localRole === role.id ? "text-indigo-900 dark:text-indigo-300" : "text-gray-900 dark:text-zinc-100"}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400 mt-0.5">
                              {role.description}
                            </p>
                          </div>
                          {localRole === role.id && (
                            <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-1" />
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
                {membership.userId === currentUserId ? "脱退する" : "削除"}
              </button>
            )}

            {showManagement && (
              <button
                onClick={handleRemoveMember}
                disabled={loading}
                title={membership.userId === currentUserId ? "脱退する" : "メンバーを削除"}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500 dark:text-zinc-400">
              居場所: {
                (!membership.location || !membership.location.isOnline) 
                ? (
                  <span title="VRChatがオフライン、もしくはAskMe!を起動していません" className="cursor-help text-gray-400 dark:text-zinc-500">
                    オフライン
                  </span>
                )
                : <span className="text-gray-900 dark:text-zinc-100">{membership.location.worldName}</span>
              }
              {(membership.location?.isOnline && !membership.location.isHidden && membership.location.worldId) && (
                <a 
                  href={`https://vrchat.com/home/launch?worldId=${membership.location.worldId}${membership.location.instanceId ? `&instanceId=${membership.location.instanceId}` : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center px-3 py-1 sm:px-6 sm:py-2 border border-transparent text-xs sm:text-sm font-bold rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
                >
                  Join
                </a>
              )}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-zinc-500 sm:mt-0">
            <p>
              最終更新:{" "}
              {membership.location?.updatedAt
                ? new Date(membership.location.updatedAt).toLocaleString("ja-JP")
                : "なし"}
            </p>
          </div>
        </div>
      </div>
    </li>
  )
}
