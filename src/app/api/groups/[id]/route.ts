import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getGroupById, updateGroup, deleteGroup } from "@/services/groupService"
import { createGroupViewModel } from "@/view-models/GroupViewModel"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const group = await getGroupById(id)

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  // Domain logic: Check if user is a member
  const currentUserId = session.user.id
  if (!group.isMember(currentUserId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // View Model: Transform domain model to view model (includes sanitization logic)
  const viewModel = createGroupViewModel(group, currentUserId)

  return NextResponse.json({ group: viewModel })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const group = await getGroupById(id)
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  // Domain logic: Check if user is an admin
  if (!group.isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const updated = await updateGroup(id, name)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Group update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const group = await getGroupById(id)

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  // Domain logic: Only admin can delete group
  if (!group.isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await deleteGroup(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Group deletion error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
