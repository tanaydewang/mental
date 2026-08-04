import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Trash2, Star, TrendingUp, Clock, BedDouble } from "lucide-react"
import { supabase, type SleepRow } from "@/lib/supabase"
import { useSleep, last7DaysSleepSeries } from "@/hooks/use-data"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { SleepLineChart, FrequencyBarChart } from "@/components/dashboard/charts"
import { toast } from "@/components/ui/toaster"
import { cn, formatRelative, formatDate } from "@/lib/utils"

type Report = "week" | "month"

export function SleepPage() {
  const { sleep, loading, refresh } = useSleep()
  const [hours, setHours] = useState(7.5)
  const [quality, setQuality] = useState(3)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [report, setReport] = useState<Report>("week")

  const weekSeries = useMemo(() => last7DaysSleepSeries(sleep), [sleep])

  const avgHours = useMemo(() => {
    if (!sleep.length) return 0
    return (sleep.slice(0, 7).reduce((s, x) => s + Number(x.hours), 0) / Math.min(sleep.length, 7)).toFixed(1)
  }, [sleep])

  const avgQuality = useMemo(() => {
    if (!sleep.length) return 0
    return (sleep.slice(0, 7).reduce((s, x) => s + x.quality, 0) / Math.min(sleep.length, 7)).toFixed(1)
  }, [sleep])

  const consistency = useMemo(() => {
    if (sleep.length < 2) return 0
    const recent = sleep.slice(0, 7)
    const hrs = recent.map((s) => Number(s.hours))
    const mean = hrs.reduce((a, b) => a + b, 0) / hrs.length
    const variance = hrs.reduce((a, b) => a + (b - mean) ** 2, 0) / hrs.length
    const std = Math.sqrt(variance)
    return Math.round(Math.max(0, 100 - std * 20))
  }, [sleep])

  const reportData = useMemo(() => {
    if (report === "week") return weekSeries
    return weekSeries.slice(-7)
  }, [report, weekSeries])

  const handleSave = async () => {
    setSaving(true)
    const now = new Date()
    const { error } = await supabase.from("sleep").insert({
      hours,
      quality,
      note: note.trim(),
      bedtime: new Date(now.getTime() - hours * 3600000).toISOString(),
      wake_time: now.toISOString(),
      logged_at: now.toISOString(),
    })
    setSaving(false)
    if (error) {
      toast.error("Couldn't save sleep", error.message)
      return
    }
    toast.success("Sleep logged", `${hours}h recorded.`)
    setNote("")
    setHours(7.5)
    setQuality(3)
    refresh()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sleep").delete().eq("id", id)
    if (error) return toast.error("Couldn't delete", error.message)
    toast.success("Sleep entry deleted")
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sleep Tracker" description="Rest is the foundation of mental wellness. Track yours." />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Log sleep */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-accent" /> Log last night's sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Hours slept</label>
                <Badge variant="accent">{hours}h</Badge>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0h</span>
                <span>12h</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Sleep quality</label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuality(q)}
                    className={cn(
                      "flex h-12 flex-1 items-center justify-center rounded-xl border transition-all",
                      quality >= q ? "border-accent bg-accent/15" : "border-border"
                    )}
                  >
                    <Star className={cn("h-5 w-5", quality >= q ? "fill-accent text-accent" : "text-muted-foreground/40")} />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did you feel waking up?"
                rows={2}
                className="w-full rounded-xl border border-input bg-card/40 px-4 py-3 text-sm backdrop-blur placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
            </div>

            <Button className="w-full" onClick={handleSave} loading={saving}>
              Log sleep
            </Button>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Sleep trend</CardTitle>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["week", "month"] as Report[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setReport(r)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                    report === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[260px]" /> : <SleepLineChart data={reportData} />}
          </CardContent>
        </Card>
      </div>

      {/* Report stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{avgHours}h</p>
              <p className="text-sm text-muted-foreground">Average sleep (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{avgQuality}/5</p>
              <p className="text-sm text-muted-foreground">Average quality (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{consistency}%</p>
              <p className="text-sm text-muted-foreground">Sleep consistency</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly bar report */}
      <Card>
        <CardHeader>
          <CardTitle>Hours per day</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[260px]" /> : <FrequencyBarChart data={weekSeries} dataKey="hours" color="hsl(var(--accent))" />}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
          ) : sleep.length ? (
            <AnimatePresence mode="popLayout">
              {sleep.slice(0, 12).map((s: SleepRow) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/40 p-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                    <BedDouble className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.hours}h sleep</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatRelative(s.logged_at)} · {formatDate(s.logged_at)}
                      {s.note && ` · ${s.note}`}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((q) => (
                      <Star key={q} className={cn("h-3.5 w-3.5", s.quality >= q ? "fill-warning text-warning" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <EmptyState
              icon={Moon}
              title="No sleep logged yet"
              description="Log last night's sleep to start tracking your rest patterns."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
