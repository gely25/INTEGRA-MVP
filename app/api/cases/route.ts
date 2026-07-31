// Fuera de alcance del MVP actual — el store corre en memoria (ver lib/store.tsx). Persistencia real pendiente de una siguiente iteración.
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"


export async function GET(req: Request) {
  try {
    const roleHeader = req.headers.get("X-Role-Actor")
    if (!roleHeader || !["incucai", "hospital", "auditor", "itprov"].includes(roleHeader)) {
      return new NextResponse("Forbidden: Access Denied", { status: 403 })
    }

    // Buscar el caso activo (o crear uno de prueba si no hay ninguno para que la demo funcione)
    let activeCase = await prisma.case.findFirst({
      include: {
        events: true,
        telemetry: true,
        alerts: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeCase) {
        return NextResponse.json({ message: "No active cases found" }, { status: 404 });
    }

    // RBAC: Hospital only sees their cases (mock check)
    if (roleHeader === "hospital" && activeCase.destinationCity !== "Córdoba") {
      return new NextResponse("Forbidden: Case mismatch", { status: 403 })
    }

    return NextResponse.json(activeCase);
  } catch (error) {
    console.error("[API_CASES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const roleHeader = req.headers.get("X-Role-Actor")
    // Only INCUCAI coordinator can register donors/create cases
    if (roleHeader !== "incucai") {
      return new NextResponse("Forbidden: Only Coordinador Nacional can create cases", { status: 403 })
    }

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
