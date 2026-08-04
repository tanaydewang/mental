import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Trash2, TrendingUp, Lightbulb, Calendar } from "lucide-react"
import { supabase, type MoodRow } from "@/lib/supabase"
import { useMoods, last7DaysMoodSeries, last30DaysMoodSeries, moodDistribution } from "@/hooks/use-data"
import { MOOD_OPTIONS, getMood } from "@/lib/constants"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { MoodAreaChart, MoodPieChart } from "@/components/dashboard/charts"
import { MoodCalendar } from "@/components/dashboard/mood-calendar"
import { toast } from "@/components/ui/toaster"
import { cn, formatRelative } from "@/lib/utils"

type Tab = "week" | "month"

export function MoodPage() {
  const { moods, loading, refresh } = useMoods()
  const [tab, setTab] = useState<Tab>("week")
  const [selected, setSelected] = useState<string>(MOOD_OPTIONS[0].key)
  const [intensity, setIntensity] = useState(3)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const weekSeries = useMemo(() => last7DaysMoodSeries(moods), [moods])
  const monthSeries = useMemo(() => last30DaysMoodSeries(moods), [moods])
  const distribution = useMemo(() => moodDistribution(moods), [moods])
  const chartData = tab === "week" ? weekSeries : monthSeries

  const avgScore = useMemo(() => {
    if (!moods.length) return 0
    return (moods.reduce((s, m) => s + getMood(m.mood).score, 0) / moods.length).toFixed(1)
  }, [moods])

  const topMood = useMemo(() => {
    const counts: Record<string, number> = {}
    moods.forEach((m) => (counts[m.mood] = (counts[m.mood] ?? 0) + 1))
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return top ? getMood(top[0]) : null
  }, [moods])

  const streak = useMemo(() => {
    if (!moods.length) return 0
    let count = 0
    const seen = new Set(moods.map((m) => new Date(m.logged_at).toDateString()))
    let d = new Date()
    while (seen.has(d.toDateString())) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [moods])

  const handleSave = async () => {
    const mood = getMood(selected)
    setSaving(true)
    const { error } = await supabase.from("moods").insert({
      mood: mood.key,
      emoji: mood.emoji,
      intensity,
      note: note.trim(),
      logged_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      toast.error("Couldn't save mood", error.message)
      return
    }
    toast.success("Mood logged", `Feeling ${mood.label.toLowerCase()} today.`)
    setNote("")
    setIntensity(3)
    refresh()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("moods").delete().eq("id", id)
    if (error) {
      toast.error("Couldn't delete", error.message)
      return
    }
    toast.success("Mood entry deleted")
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mood Tracker"
        description="Log how you feel and discover the patterns that shape your days."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Log mood */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" /> How are you feeling?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <motion.button
                  key={m.key}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelected(m.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 transition-all",
                    selected === m.key ? "border-primary bg-primary/15" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                </motion.button>
              ))}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Intensity</label>
                <Badge variant="default">{intensity}/5</Badge>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full rounded-xl border border-input bg-card/40 px-4 py-3 text-sm backdrop-blur placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
            </div>

            <Button className="w-full" onClick={handleSave} loading={saving}>
              Log mood
            </Button>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Mood trend</CardTitle>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["week", "month"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                    tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[260px]" /> : <MoodAreaChart data={chartData} />}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{avgScore}</p>
              <p className="text-sm text-muted-foreground">Average score (out of 5)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{streak}</p>
              <p className="text-sm text-muted-foreground">Day logging streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-2xl">
              {topMood?.emoji ?? "—"}
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{topMood?.label ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Most frequent mood</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Mood calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : <MoodCalendar moods={moods} />}
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mood distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px]" />
            ) : moods.length ? (
              <MoodPieChart data={distribution} />
            ) : (
              <EmptyState
                icon={Lightbulb}
                title="No moods to chart yet"
                description="Log a few moods and your distribution will appear here."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
          ) : moods.length ? (
            <AnimatePresence mode="popLayout">
              {moods.slice(0, 12).map((m: MoodRow) => {
                const mood = getMood(m.mood)
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card/40 p-3"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ background: `${mood.color}25` }}
                    >
                      {m.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{mood.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatRelative(m.logged_at)} · Intensity {m.intensity}/5
                        {m.note && ` · ${m.note}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          ) : (
            <EmptyState
              icon={Smile}
              title="No moods logged yet"
              description="Log your first mood using the picker on the left."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
