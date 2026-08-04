import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getMood, MOOD_OPTIONS } from "@/lib/constants"
import type { MoodRow } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function MoodCalendar({ moods }: { moods: MoodRow[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const byDay = useMemo(() => {
    const map: Record<string, MoodRow> = {}
    for (const m of moods) {
      const d = new Date(m.logged_at)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key] || new Date(m.logged_at) > new Date(map[key].logged_at)) map[key] = m
    }
    return map
  }, [moods])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-semibold">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const mood = byDay[`${year}-${month}-${day}`]
          const isToday = (() => {
            const t = new Date()
            return day === t.getDate() && month === t.getMonth() && year === t.getFullYear()
          })()
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition-colors",
                mood ? "border-transparent" : "border-border",
                isToday && !mood && "border-primary/50"
              )}
              style={mood ? { background: `${getMood(mood.mood).color}30`, borderColor: `${getMood(mood.mood).color}60` } : undefined}
              title={mood ? `${getMood(mood.mood).label} — ${mood.note || "no note"}` : undefined}
            >
              <span className={cn("text-sm", mood && "opacity-80")}>{mood?.emoji ?? day}</span>
            </motion.div>
          )
        })}
      </div>
      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {MOOD_OPTIONS.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}
