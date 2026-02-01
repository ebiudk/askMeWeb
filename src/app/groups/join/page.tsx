import { Suspense } from "react"
import { Metadata } from "next"
import { getInviteInfo } from "@/services/groupService"
import JoinGroupForm from "./JoinGroupForm"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : ""
  
  if (!token) {
    return {
      title: "グループへの招待 | AskMe! Web",
    }
  }

  const group = await getInviteInfo(token)

  if (!group) {
    return {
      title: "無効な招待 | AskMe! Web",
    }
  }

  const title = `${group.name}から招待されています！`
  
  return {
    title: title,
    description: "AskMe! Web グループへの招待",
    openGraph: {
      title: title,
      description: "AskMe! Web グループへの招待",
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: "AskMe! Logo",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: title,
      images: ["/logo.png"],
    },
  }
}

export default async function JoinGroupPage({ searchParams }: Props) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : ""

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <JoinGroupForm initialToken={token} />
    </Suspense>
  )
}
