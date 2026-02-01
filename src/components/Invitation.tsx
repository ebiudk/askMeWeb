"use client"

import { useState } from 'react'
import { CheckIcon, ClipboardIcon, ArrowPathIcon } from '@heroicons/react/20/solid'

interface InvitationProps {
  groupId: string;
  isAdmin: boolean;
}

export default function Invitation({ groupId, isAdmin }: InvitationProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const generateInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/groups/join?token=${data.token}`;
        setInviteUrl(url);
      }
    } catch (error) {
      console.error("Failed to generate invite:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium text-gray-900">メンバーを招待</h3>
      <p className="mt-1 text-xs text-gray-500">
        有効期限が24時間の招待URLを発行できます。
      </p>
      
      {!inviteUrl ? (
        <button
          onClick={generateInvite}
          disabled={loading}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ClipboardIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
          )}
          招待URLを発行
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copied ? (
                <CheckIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ClipboardIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <button
            onClick={generateInvite}
            disabled={loading}
            className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
          >
            <ArrowPathIcon className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            新しいURLを再発行
          </button>
        </div>
      )}
    </div>
  );
}
