"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

interface GroupSettingsProps {
  group: {
    id: string;
    name: string;
    owner_id: string;
  };
  currentUserId: string;
  isAdmin: boolean;
}

export default function GroupSettings({ group, currentUserId, isAdmin }: GroupSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(group.name);
  const [newName, setNewName] = useState(group.name);
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();

  const isOwner = group.owner_id === currentUserId;

  const handleRename = async () => {
    if (!newName || newName === displayName) {
      setIsEditing(false);
      return;
    }

    const previousName = displayName;
    setDisplayName(newName); // Optimistic update
    setIsEditing(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to rename group");
        setDisplayName(previousName); // Revert
        setNewName(previousName);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("An error occurred");
      setDisplayName(previousName); // Revert
      setNewName(previousName);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`グループ「${displayName}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    setIsDeleted(true); // Optimistic update
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete group");
        setIsDeleted(false);
      }
    } catch (error) {
      alert("An error occurred");
      setIsDeleted(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || isDeleted) return null;

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <button
            onClick={handleRename}
            disabled={loading}
            className="p-1 text-green-600 hover:text-green-500"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewName(displayName);
            }}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">{displayName}</h1>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 dark:text-zinc-500 hover:text-gray-500 dark:hover:text-zinc-300"
              title="グループ名を変更"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 text-red-400 hover:text-red-500 dark:hover:text-red-300"
                title="グループを削除"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
