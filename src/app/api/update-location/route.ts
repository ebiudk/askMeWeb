import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const { current_world_id, current_world_name, current_instance_id, display_name } = await req.json()

    // Find user by API key
    const user = await prisma.user.findUnique({
      where: { api_key: apiKey },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // If current_world_id is null or empty, it means clearing location
    const isClearing = !current_world_id || current_world_id === ""
    const is_location_hidden = current_world_id === "private"

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        display_name: display_name || undefined,
        location: {
          upsert: {
            create: {
              world_id: isClearing ? null : current_world_id,
              world_name: isClearing ? null : current_world_name,
              instance_id: isClearing ? null : current_instance_id,
              is_hidden: is_location_hidden,
            },
            update: {
              world_id: isClearing ? null : current_world_id,
              world_name: isClearing ? null : current_world_name,
              instance_id: isClearing ? null : current_instance_id,
              is_hidden: is_location_hidden,
            },
          },
        },
      },
      include: { location: true },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Location update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
