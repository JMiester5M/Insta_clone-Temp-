export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ images: [] });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { images: true },
    });
    return NextResponse.json({ images: user?.images || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
