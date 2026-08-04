import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Smile,
  Moon,
  BookOpen,
  Target,
  Plus,
  TrendingUp,
  Quote,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useMoods, useJournals, useSleep, useGoals, last7DaysMoodSeries, last7DaysSleepSeries, wellnessScore } from "@/hooks/use-data"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { MoodAreaChart, SleepLineChart } from "@/components/dashboard/charts"
import { getMood, quoteOfDay } from "@/lib/constants"
import { formatRelative, cn } from "@/lib/utils"

export function DashboardPage() {
  const { profile } = useAuth()
  const { moods, loading: moodsLoading } = useMoods()
  const { journals, loading: journalsLoading } = useJournals()
  const { sleep, loading: sleepLoading } = useSleep()
  const { goals, loading: goalsLoading } = useGoals()
  const navigate = useNavigate()

  const moodSeries = useMemo(() => last7DaysMoodSeries(moods), [moods])
  const sleepSeries = useMemo(() => last7DaysSleepSeries(sleep), [sleep])
  const score = useMemo(() => wellnessScore(moods, sleep, journals), [moods, sleep, journals])

  const todayMood = moods.find((m) => {
    const d = new Date(m.logged_at)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const latestSleep = sleep[0]
  const recentJournals = journals.slice(0, 3)
  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3)
  const quote = quoteOfDay()
  const name = profile?.full_name?.split(" ")[0] || "friend"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const quickActions = [
    { icon: Smile, label: "Log mood", to: "/app/mood", color: "bg-primary/15 text-primary" },
    { icon: BookOpen, label: "New journal", to: "/app/journal", color: "bg-secondary/15 text-secondary" },
    { icon: Moon, label: "Log sleep", to: "/app/sleep", color: "bg-accent/15 text-accent" },
    { icon: Target, label: "Set a goal", to: "/app", color: "bg-success/15 text-success" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${name}`}
        description="Here's a snapshot of your wellbeing today."
      />

      {/* Welcome / wellness score banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="relative grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative sm:col-span-2">
              <Badge variant="default" className="mb-3 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Wellness snapshot
              </Badge>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Your mental wellness score is{" "}
                <span className="text-gradient">{score}/100</span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {score >= 80
                  ? "You're doing great. Keep nurturing the habits that got you here."
                  : score >= 50
                  ? "Solid progress. A little more consistency will lift you further."
                  : "Every step counts. Try logging a mood or journaling today."}
              </p>
              <div className="mt-5 max-w-xs">
                <Progress value={score} />
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <p className="font-display text-3xl font-bold text-gradient">{score}</p>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moodsLoading ? (
          <Skeleton className="h-28" />
        ) : (
          <StatCard
            icon={Smile}
            label="Today's mood"
            value={todayMood ? getMood(todayMood.mood).label : "Not logged"}
            hint={todayMood ? `Intensity ${todayMood.intensity}/5` : "Tap to log"}
            accent="primary"
          />
        )}
        {sleepLoading ? (
          <Skeleton className="h-28" />
        ) : (
          <StatCard
            icon={Moon}
            label="Last sleep"
            value={latestSleep ? `${latestSleep.hours}h` : "—"}
            hint={latestSleep ? `Quality ${latestSleep.quality}/5` : "Log your sleep"}
            accent="accent"
          />
        )}
        {journalsLoading ? (
          <Skeleton className="h-28" />
        ) : (
          <StatCard
            icon={BookOpen}
            label="Journal entries"
            value={journals.length}
            hint={`${journals.filter((j) => j.is_pinned).length} pinned`}
            accent="secondary"
          />
        )}
        {goalsLoading ? (
          <Skeleton className="h-28" />
        ) : (
          <StatCard
            icon={Target}
            label="Active goals"
            value={goals.filter((g) => g.status === "active").length}
            hint={`${goals.filter((g) => g.status === "completed").length} completed`}
            accent="success"
          />
        )}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Weekly mood</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/mood")}>
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {moodsLoading ? <Skeleton className="h-[260px]" /> : <MoodAreaChart data={moodSeries} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Weekly sleep</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/sleep")}>
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {sleepLoading ? <Skeleton className="h-[260px]" /> : <SleepLineChart data={sleepSeries} />}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + quote */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((a) => (
                <Link key={a.label} to={a.to}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-4 transition-colors hover:border-primary/40"
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.color)}>
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{a.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary/20 blur-3xl" />
          <CardContent className="flex h-full flex-col justify-center p-6">
            <Quote className="h-7 w-7 text-secondary/50" />
            <p className="mt-3 font-display text-base font-medium leading-relaxed">"{quote.text}"</p>
            <p className="mt-3 text-sm text-muted-foreground">— {quote.author}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent journals + goals */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent journals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/journal")}>
              All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {journalsLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)
            ) : recentJournals.length ? (
              recentJournals.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 transition-colors hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.category} · {formatRelative(j.created_at)}</p>
                  </div>
                  <Badge variant="outline">{j.category}</Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No journals yet</p>
                <Button size="sm" onClick={() => navigate("/app/journal")}>
                  Write your first
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Upcoming goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goalsLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)
            ) : activeGoals.length ? (
              activeGoals.map((g) => (
                <div key={g.id} className="rounded-xl border border-border bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{g.title}</p>
                    <Badge variant={g.status === "completed" ? "success" : "default"}>
                      {g.current_count}/{g.target_count} {g.unit}
                    </Badge>
                  </div>
                  <Progress value={g.target_count ? (g.current_count / g.target_count) * 100 : 0} className="mt-3" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Target className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No active goals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
