import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
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
