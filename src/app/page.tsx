import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Users, MapPin, PlusCircle } from "lucide-react";
import { Suspense } from "react";

async function GroupList({ userId }: { userId: string }) {
  const userGroups = await prisma.group.findMany({
    where: {
      memberships: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            include: {
              location: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (userGroups.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">所属グループがありません</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          新しいグループを作成するか、招待コードで参加しましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {userGroups.map((group: any) => {
        const activeMembers = group.memberships.filter(
          (m: any) => m.user.location?.world_id && !m.user.location?.is_hidden
        );

        return (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {group.name}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  <Users className="mr-1 h-3 w-3" />
                  {activeMembers.length} / {group.memberships.length}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  現在のアクティビティ
                </p>
                {activeMembers.length > 0 ? (
                  <div className="space-y-2">
                    {activeMembers.slice(0, 3).map((membership: any) => (
                      <div
                        key={membership.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {membership.user.display_name || membership.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {membership.user.location?.world_name}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activeMembers.length > 3 && (
                      <p className="text-xs text-gray-500 pl-4">
                        他 {activeMembers.length - 3} 名がオンライン
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">オンラインのメンバーはいません</p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GroupListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="AskMe Logo"
              width={120}
              height={120}
              className="w-32 h-32"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            AskMe! Web
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            VRChatの居場所を、信頼できる仲間内だけで共有。
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              ログインしてはじめる
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
        <div className="flex gap-2">
          <Link
            href="/groups/join"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          >
            グループに参加
          </Link>
          <Link
            href="/groups/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            新規作成
          </Link>
        </div>
      </div>

      <Suspense fallback={<GroupListSkeleton />}>
        <GroupList userId={session.user!.id} />
      </Suspense>
    </div>
  );
}
