import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("session", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      success: true,
      nombre: user.nombre,
      role: user.role,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}