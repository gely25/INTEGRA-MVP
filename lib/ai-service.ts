/**
 * INTEGRA — Servicio Genérico de Inteligencia Artificial
 * 
 * Este adaptador sirve como una capa de abstracción para conectar la aplicación
 * a cualquier modelo de IA en el futuro (OpenAI, Gemini, un modelo open-source 
 * entrenado internamente, o una API en Python/Flask).
 * 
 * Al centralizar la lógica aquí, evitamos acoplar la app a un SDK específico 
 * (como Vercel AI SDK).
 */

export interface SimulationContext {
  elapsedTimeMin: number;
  currentInternalTemp: number;
  currentExternalTemp: number;
  batteryLevel: number;
  gpsActive: boolean;
}

export interface SimulationResult {
  newInternalTemp: number;
  newExternalTemp: number;
  newBatteryLevel: number;
  hasAnomaly: boolean;
  anomalyDescription?: string;
}

/**
 * Función genérica para solicitar una simulación del próximo punto de telemetría.
 * Actualmente devuelve datos simulados (placeholder), pero está diseñada para
 * ser reemplazada por una llamada HTTP al servicio de IA definitivo.
 */
export async function generateSimulationData(context: SimulationContext): Promise<SimulationResult> {
  // TODO: Reemplazar esta lógica con un `fetch` o llamada real al modelo de IA.
  // Ejemplo futuro:
  // const response = await fetch('https://tu-api-de-ia.com/simulate', { method: 'POST', body: JSON.stringify(context) });
  // return await response.json();
  
  // LOGICA PLACEHOLDER ACTUAL (Simula el comportamiento de una IA evaluando el contexto)
  console.log("[AI-SERVICE] Generando simulación para contexto:", context);

  // Simula un ligero retraso de red como si llamara a una API de IA
  await new Promise(resolve => setTimeout(resolve, 800));

  // Fluctuación basada en el estado actual
  const newInternal = +(context.currentInternalTemp + (Math.random() - 0.45) * 0.4).toFixed(1);
  const newExternal = +(context.currentExternalTemp + (Math.random() - 0.5) * 0.6).toFixed(1);
  const newBattery = Math.max(0, context.batteryLevel - (Math.random() < 0.3 ? 1 : 0));

  // Simular una anomalía si la temperatura interna sube demasiado
  let hasAnomaly = false;
  let anomalyDescription;

  if (newInternal >= 8.0) {
    hasAnomaly = true;
    anomalyDescription = "Peligro: Ruptura inminente de cadena de frío detectada por tendencia alcista persistente.";
  }

  return {
    newInternalTemp: newInternal,
    newExternalTemp: newExternal,
    newBatteryLevel: newBattery,
    hasAnomaly,
    anomalyDescription,
  };
}
