// Fuera de alcance del MVP actual — el store corre en memoria (ver lib/store.tsx). Persistencia real pendiente de una siguiente iteración.
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"


export async function POST(req: Request) {
  try {
    const roleHeader = req.headers.get("X-Role-Actor")
    if (!roleHeader || !["incucai", "hospital", "iot"].includes(roleHeader)) {
      return new NextResponse("Forbidden: Access Denied to write events", { status: 403 })
    }

    const body = await req.json();
    
    const {
      eventId,
      eventName,
      time,
      actor,
      org,
      txId,
      prevHash,
      hash,
      status,
      caseId
    } = body;

    // RBAC: Hospital cannot create GENESIS or initial cases events
    if (roleHeader === "hospital" && ["CASE_CREATED", "COMPATIBILITY_MATCH"].includes(eventName)) {
      return new NextResponse("Forbidden: Hospital cannot trigger administrative events", { status: 403 })
    }

    const newEvent = await prisma.event.create({
      data: {
        eventId,
        eventName,
        time,
        actor,
        org,
        txId,
        prevHash,
        hash,
        status,
        caseId
      }
    });

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("[API_EVENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
