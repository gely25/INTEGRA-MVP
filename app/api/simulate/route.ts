import { NextResponse } from "next/server"
import { generateSimulationData } from "@/lib/ai-service"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      elapsedTimeMin,
      currentInternalTemp,
      currentExternalTemp,
      batteryLevel,
      gpsActive
    } = body;

    // Llamada a nuestro adaptador genérico de IA
    const simulationResult = await generateSimulationData({
      elapsedTimeMin,
      currentInternalTemp,
      currentExternalTemp,
      batteryLevel,
      gpsActive
    });

    return NextResponse.json(simulationResult);
  } catch (error) {
    console.error("[API_SIMULATE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
