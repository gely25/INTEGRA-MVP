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
  
  // LOGICA DE DETECCION BASADA EN DESVIACION (Z-SCORE / PROMEDIO MOVIL DE ULTIMAS LECTURAS)
  console.log("[AI-SERVICE] Generando simulación para contexto:", context);

  // Simula un ligero retraso de red como si llamara a una API de IA
  await new Promise(resolve => setTimeout(resolve, 800));

  // Fluctuación basada en el estado actual
  const newInternal = +(context.currentInternalTemp + (Math.random() - 0.45) * 0.4).toFixed(1);
  const newExternal = +(context.currentExternalTemp + (Math.random() - 0.5) * 0.6).toFixed(1);
  const newBattery = Math.max(0, context.batteryLevel - (Math.random() < 0.3 ? 1 : 0));

  // Histórico simulated/baseline para cálculo de ventana de 5 lecturas
  // Rango estándar óptimo: 3.0°C - 3.4°C (media ~3.16, std ~0.15)
  const recentReadings = [3.0, 3.1, 3.0, 3.2, 3.3];
  const windowSize = recentReadings.length;
  const mean = recentReadings.reduce((acc, val) => acc + val, 0) / windowSize;
  const variance = recentReadings.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / windowSize;
  const stdDev = Math.sqrt(variance) || 0.1; // Evitar división por cero

  // Z-Score: desviación respecto a las últimas lecturas
  const zScore = Math.abs(newInternal - mean) / stdDev;

  let hasAnomaly = false;
  let anomalyDescription;

  // Si la lectura actual se desvía más de 3 desviaciones estándar (z-score > 3.0) o cruza umbral térmico extremo (>7.5)
  if (zScore > 3.0 || newInternal >= 7.5) {
    hasAnomaly = true;
    anomalyDescription = `IA Alerta: Desviación anómala detectada (Z-Score: ${zScore.toFixed(2)}, Temp: ${newInternal}°C vs Prom. ${mean.toFixed(2)}°C).`;
  }

  return {
    newInternalTemp: newInternal,
    newExternalTemp: newExternal,
    newBatteryLevel: newBattery,
    hasAnomaly,
    anomalyDescription,
  };
}

