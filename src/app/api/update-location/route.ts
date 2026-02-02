import { NextResponse } from "next/server"
import { getUserByApiKey, updateUserLocation } from "@/services/userService"
import { Location } from "@/domain/models/Location"

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const { current_world_id, current_world_name, current_instance_id, display_name } = await req.json()

    // Find user by API key
    const user = await getUserByApiKey(apiKey)

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Domain logic: create location object
    const newLocation = Location.createFromVRChat(
      current_world_id,
      current_world_name,
      current_instance_id
    )

    // Domain logic: update user state (if we had more complex logic)
    const updatedUser = user.updateLocation(newLocation)

    // Application logic: persist changes
    await updateUserLocation(updatedUser.id, newLocation, display_name);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Location update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
