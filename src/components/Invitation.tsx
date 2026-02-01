"use client"

import { useState } from 'react'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'

interface InviteCopyButtonProps {
  inviteCode: string;
}

function InviteCopyButton({ inviteCode }: InviteCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2秒後に「コピーしました」を非表示にする
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {copied ? (
          <>
            <CheckIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            コピーしました！
          </>
        ) : (
          <>
            <ClipboardIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            招待コードをコピー
          </>
        )}
      </button>
    </div>
  );
}

interface InvitationProps {
  inviteCode: string;
  isAdmin: boolean;
}

export default function Invitation({ inviteCode, isAdmin }: InvitationProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <p className="mt-1 text-sm text-gray-500">
        招待コード: <code className="bg-gray-100 px-1 rounded">{inviteCode}</code>
      </p>
      <InviteCopyButton inviteCode={inviteCode} />
    </div>
  );
}
