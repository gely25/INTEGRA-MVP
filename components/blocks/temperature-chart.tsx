"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { useStore } from "@/lib/store"

const config: ChartConfig = {
  internal: { label: "Temp. interna (°C)", color: "var(--chart-1)" },
  external: { label: "Temp. externa (°C)", color: "var(--chart-3)" },
}

export function TemperatureChart() {
  const { telemetry } = useStore()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de temperatura</CardTitle>
        <CardDescription>
          Lecturas del sensor con umbral de cadena de frío en 4 °C. Interna vs. externa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <LineChart data={telemetry} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="t" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              fontSize={11}
              domain={[0, "dataMax + 4"]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={4}
              stroke="var(--danger)"
              strokeDasharray="4 4"
              label={{ value: "Umbral 4 °C", position: "insideTopRight", fontSize: 10, fill: "var(--danger)" }}
            />
            <Line
              dataKey="internal"
              type="monotone"
              stroke="var(--color-internal)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              dataKey="external"
              type="monotone"
              stroke="var(--color-external)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
