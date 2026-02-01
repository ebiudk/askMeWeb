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
  const [newName, setNewName] = useState(group.name);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isOwner = group.owner_id === currentUserId;

  const handleRename = async () => {
    if (!newName || newName === group.name) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to rename group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`グループ「${group.name}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              setNewName(group.name);
            }}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-500"
              title="グループ名を変更"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 text-red-400 hover:text-red-500"
                title="グループを削除"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
