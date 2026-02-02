import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { is_location_shared } = await req.json();

    if (typeof is_location_shared !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await prisma.membership.updateMany({
      where: {
        user_id: session.user.id,
      },
      data: {
        is_location_shared,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update all memberships:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
