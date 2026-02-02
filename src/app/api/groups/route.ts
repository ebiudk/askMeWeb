import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getUserGroups, createGroup } from "@/services/groupService"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const group = await createGroup(name, session.user.id)
    return NextResponse.json(group)
  } catch (error) {
    console.error("Group creation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const groups = await getUserGroups(session.user.id)
    return NextResponse.json(groups)
  } catch (error) {
    console.error("Groups fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
