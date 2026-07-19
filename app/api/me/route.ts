import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  const session = cookieStore.get("session");

  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.value,
    },
  });

  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role,
  });
}