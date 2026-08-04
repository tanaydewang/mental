import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { getMood } from "@/lib/constants"

type SeriesPoint = Record<string, number | string>

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl glass-strong px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-1.5" style={{ color: p.color || p.fill }}>
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: {typeof p.value === "number" ? p.value : p.value}
        </p>
      ))}
    </div>
  )
}

export function MoodAreaChart({ data, dataKey = "score", xKey = "day" }: { data: SeriesPoint[]; dataKey?: string; xKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 5]} tickCount={6} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey={dataKey} name="Mood" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#moodGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SleepLineChart({ data, xKey = "day" }: { data: SeriesPoint[]; xKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 12]} tickCount={7} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="hours" name="Hours" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--accent))" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MoodPieChart({ data }: { data: { name: string; value: number; key: string }[] }) {
  const filtered = data.filter((d) => d.value > 0)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
          {filtered.map((entry) => (
            <Cell key={entry.key} fill={getMood(entry.key).color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function FrequencyBarChart({ data, xKey = "day", dataKey = "count", color = "hsl(var(--secondary))" }: { data: SeriesPoint[]; xKey?: string; dataKey?: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
        <Bar dataKey={dataKey} name="Entries" fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function WellnessRadial({ score }: { score: number }) {
  const data = [{ name: "Wellness", value: score, fill: "hsl(var(--primary))" }]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={90 - (score / 100) * 360}>
        <RadialBar background dataKey="value" cornerRadius={20} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
