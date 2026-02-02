import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Invitation from "@/components/Invitation"
import MemberRow from "@/components/MemberRow"
import GroupSettings from "@/components/GroupSettings"
import { Suspense } from "react"
import { getGroupById } from "@/services/groupService"
import { createGroupViewModel } from "@/view-models/GroupViewModel"

async function GroupDetail({ id, userId }: { id: string; userId: string }) {
  const group = await getGroupById(id)

  if (!group) notFound()

  // Domain logic check
  if (!group.isMember(userId)) redirect("/")

  // View Model: Transform domain model to view model (includes sanitization logic)
  const viewModel = createGroupViewModel(group, userId)

  const myMembership = viewModel.members.find((m) => m.userId === userId)
  if (!myMembership) redirect("/")

  const isManagement = myMembership.role === "admin" || myMembership.role === "co-admin"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <GroupSettings 
            group={{ id: viewModel.id, name: viewModel.name, owner_id: group.ownerId }} 
            currentUserId={userId}
            isAdmin={isManagement}
          />
          <Invitation groupId={id} isAdmin={isManagement} />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border dark:border-zinc-800 sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
          {viewModel.members.map((member) => (
            <MemberRow 
              key={member.userId} 
              groupId={id}
              membership={member}
              currentUserRole={myMembership.role}
              currentUserId={userId}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}



function GroupDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-1/3"></div>
      <div className="bg-white dark:bg-zinc-900 shadow-sm border dark:border-zinc-800 overflow-hidden sm:rounded-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border-b dark:border-zinc-800">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [session, { id }] = await Promise.all([auth(), params])

  if (!session || !session.user) {
    redirect("/"); // セッションがない、またはユーザー情報がない場合はリダイレクト
  }

  return (
    <Suspense fallback={<GroupDetailSkeleton />}>
      <GroupDetail id={id} userId={session.user.id} />
    </Suspense>
  )
}
