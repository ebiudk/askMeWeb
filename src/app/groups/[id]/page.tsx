import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Invitation from "@/components/Invitation"
import MemberRow from "@/components/MemberRow"
import GroupSettings from "@/components/GroupSettings"
import { Suspense } from "react"

async function GroupDetail({ id, userId }: { id: string; userId: string }) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        select: {
          id: true,
          role: true,
          user_id: true,
          is_location_shared: true,
          user: {
            select: {
              id: true,
              name: true,
              display_name: true,
              location: {
                select: {
                  world_id: true,
                  world_name: true,
                  instance_id: true,
                  is_hidden: true,
                  updated_at: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!group) notFound()

  // Filter location data based on is_location_shared and is_hidden
  const sanitizedMemberships = group.memberships.map((m: any) => {
    const isOwnLocation = m.user_id === userId
    const shouldShowLocation = isOwnLocation || (m.is_location_shared && !m.user.location?.is_hidden)

    return {
      ...m,
      user: {
        ...m.user,
        location: shouldShowLocation ? m.user.location : null,
      },
    }
  })

  // Sort memberships: admin -> co-admin -> member, then by name
  const rolePriority: { [key: string]: number } = {
    admin: 0,
    "co-admin": 1,
    member: 2,
  }

  sanitizedMemberships.sort((a: any, b: any) => {
    const priorityA = rolePriority[a.role] ?? 3
    const priorityB = rolePriority[b.role] ?? 3
    if (priorityA !== priorityB) return priorityA - priorityB
    const nameA = a.user.display_name || a.user.name || ""
    const nameB = b.user.display_name || b.user.name || ""
    return nameA.localeCompare(nameB)
  })

  // Check membership
  const myMembership = sanitizedMemberships.find((m: any) => m.user_id === userId)
  if (!myMembership) redirect("/")

  const isAdmin = myMembership.role === "admin"
  const isManagement = isAdmin || myMembership.role === "co-admin"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <GroupSettings 
            group={{ id: group.id, name: group.name, owner_id: group.owner_id }} 
            currentUserId={userId}
            isAdmin={isManagement}
          />
          <Invitation groupId={id} isAdmin={isManagement} />
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sanitizedMemberships.map((membership: any) => (
            <MemberRow 
              key={membership.user.id} 
              groupId={id}
              membership={membership}
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
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border-b">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
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
