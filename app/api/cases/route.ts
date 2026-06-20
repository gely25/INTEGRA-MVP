import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Buscar el caso activo (o crear uno de prueba si no hay ninguno para que la demo funcione)
    let activeCase = await prisma.case.findFirst({
      include: {
        events: true,
        telemetry: true,
        alerts: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Si la DB está vacía, retornar un caso vacío (el frontend puede encargarse de inyectar los datos iniciales si no encuentra uno)
    if (!activeCase) {
        return NextResponse.json({ message: "No active cases found" }, { status: 404 });
    }

    return NextResponse.json(activeCase);
  } catch (error) {
    console.error("[API_CASES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar y crear el caso
    const newCase = await prisma.case.create({
      data: {
        ...body,
      }
    });

    return NextResponse.json(newCase);
  } catch (error) {
    console.error("[API_CASES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
