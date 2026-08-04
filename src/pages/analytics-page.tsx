import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Moon, BookOpen, Smile, Target, Award, Activity } from "lucide-react"
import {
  useMoods,
  useJournals,
  useSleep,
  useGoals,
  last30DaysMoodSeries,
  last7DaysSleepSeries,
  moodDistribution,
  journalFrequency,
  wellnessScore,
} from "@/hooks/use-data"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { MoodAreaChart, SleepLineChart, MoodPieChart, FrequencyBarChart } from "@/components/dashboard/charts"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

function ActivityHeatmap({ dates }: { dates: string[] }) {
  // build last 12 weeks grid
  const weeks = 12
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - (weeks * 7 - 1))

  const set = new Set(dates.map((d) => new Date(d).toDateString()))
  const cells: { date: Date; active: boolean }[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: { date: Date; active: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      col.push({ date, active: set.has(date.toDateString()) && date <= today })
    }
    cells.push(col)
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2">
      {cells.map((col, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {col.map((cell, di) => (
            <motion.div
              key={di}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (wi * 7 + di) * 0.003 }}
              className={cn(
                "h-3.5 w-3.5 rounded-sm transition-colors",
                cell.active ? "bg-primary" : "bg-muted",
                cell.date > today && "opacity-30"
              )}
              title={`${cell.date.toDateString()}${cell.active ? " — active" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const { moods, loading: ml } = useMoods()
  const { journals, loading: jl } = useJournals()
  const { sleep, loading: sl } = useSleep()
  const { goals, loading: gl } = useGoals()

  const moodSeries = useMemo(() => last30DaysMoodSeries(moods), [moods])
  const sleepSeries = useMemo(() => last7DaysSleepSeries(sleep), [sleep])
  const dist = useMemo(() => moodDistribution(moods), [moods])
  const jFreq = useMemo(() => journalFrequency(journals, 14), [journals])
  const score = useMemo(() => wellnessScore(moods, sleep, journals), [moods, sleep, journals])

  const activeDates = useMemo(
    () => [
      ...moods.map((m) => m.logged_at),
      ...journals.map((j) => j.created_at),
      ...sleep.map((s) => s.logged_at),
    ],
    [moods, journals, sleep]
  )

  const completedGoals = goals.filter((g) => g.status === "completed").length
  const loading = ml || jl || sl

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Your data, turned into insight. See the trends that shape your wellbeing."
      />

      {/* Progress cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Smile} label="Mood logs" value={moods.length} accent="primary" hint="All time" />
        <StatCard icon={Moon} label="Sleep entries" value={sleep.length} accent="accent" hint="All time" />
        <StatCard icon={BookOpen} label="Journal entries" value={journals.length} accent="secondary" hint="All time" />
        <StatCard icon={Award} label="Goals completed" value={completedGoals} accent="success" hint={`${goals.length} total`} />
      </div>

      {/* Wellness progress */}
      <Card className="relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <CardContent className="relative grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          <div className="sm:col-span-2">
            <Badge variant="default" className="mb-3 gap-1.5">
              <Target className="h-3.5 w-3.5" /> Overall wellness
            </Badge>
            <h2 className="font-display text-3xl font-bold">
              <span className="text-gradient">{score}/100</span>
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              A blend of your mood, sleep, and journaling consistency over the past week.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-muted">
              <p className="font-display text-2xl font-bold text-gradient">{score}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <>
          {/* Mood + sleep trends */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-primary" /> Mood trend (30 days)
                </CardTitle>
                <CardDescription>Daily average mood score</CardDescription>
              </CardHeader>
              <CardContent>
                {moods.length ? <MoodAreaChart data={moodSeries} /> : <EmptyState icon={Smile} title="No mood data" description="Log moods to see trends." />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-accent" /> Sleep trend (7 days)
                </CardTitle>
                <CardDescription>Hours slept per night</CardDescription>
              </CardHeader>
              <CardContent>
                {sleep.length ? <SleepLineChart data={sleepSeries} /> : <EmptyState icon={Moon} title="No sleep data" description="Log sleep to see trends." />}
              </CardContent>
            </Card>
          </div>

          {/* Journal frequency + mood distribution */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" /> Journal frequency
                </CardTitle>
                <CardDescription>Entries per day (14 days)</CardDescription>
              </CardHeader>
              <CardContent>
                {journals.length ? <FrequencyBarChart data={jFreq} color="hsl(var(--secondary))" /> : <EmptyState icon={BookOpen} title="No journals yet" description="Write entries to see frequency." />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-primary" /> Mood distribution
                </CardTitle>
                <CardDescription>How your moods break down</CardDescription>
              </CardHeader>
              <CardContent>
                {moods.length ? <MoodPieChart data={dist} /> : <EmptyState icon={Smile} title="No mood data" description="Log moods to see distribution." />}
              </CardContent>
            </Card>
          </div>

          {/* Activity calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" /> Activity calendar
              </CardTitle>
              <CardDescription>Your wellness activity over the last 12 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap dates={activeDates} />
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                Less
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-sm bg-muted" />
                  <div className="h-3 w-3 rounded-sm bg-primary/40" />
                  <div className="h-3 w-3 rounded-sm bg-primary/70" />
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                </div>
                More
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
