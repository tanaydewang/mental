import { useCallback, useEffect, useState } from "react"
import { supabase, type MoodRow, type JournalRow, type SleepRow, type GoalRow, type PostRow } from "@/lib/supabase"
import { getMood } from "@/lib/constants"

function startOfWeek(d = new Date()) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export function useMoods() {
  const [moods, setMoods] = useState<MoodRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(200)
    if (error) console.error(error)
    setMoods((data as MoodRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { moods, loading, refresh }
}

export function useJournals() {
  const [journals, setJournals] = useState<JournalRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
    if (error) console.error(error)
    setJournals((data as JournalRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { journals, loading, refresh }
}

export function useSleep() {
  const [sleep, setSleep] = useState<SleepRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("sleep")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(100)
    if (error) console.error(error)
    setSleep((data as SleepRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { sleep, loading, refresh }
}

export function useGoals() {
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    setGoals((data as GoalRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { goals, loading, refresh }
}

export function usePosts() {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) console.error(error)
    setPosts((data as PostRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { posts, loading, refresh }
}

// Derived analytics helpers
export function last7DaysMoodSeries(moods: MoodRow[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const sow = startOfWeek()
  return days.map((day, i) => {
    const d = new Date(sow)
    d.setDate(sow.getDate() + i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const dayMoods = moods.filter((m) => {
      const t = new Date(m.logged_at)
      return t >= d && t < next
    })
    const avg = dayMoods.length
      ? dayMoods.reduce((s, m) => s + getMood(m.mood).score, 0) / dayMoods.length
      : 0
    return { day, score: Number(avg.toFixed(2)), count: dayMoods.length }
  })
}

export function last30DaysMoodSeries(moods: MoodRow[]) {
  return Array.from({ length: 30 }, (_, i) => {
    const d = daysAgo(29 - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const dayMoods = moods.filter((m) => {
      const t = new Date(m.logged_at)
      return t >= d && t < next
    })
    const avg = dayMoods.length
      ? dayMoods.reduce((s, m) => s + getMood(m.mood).score, 0) / dayMoods.length
      : 0
    return { day: `${d.getMonth() + 1}/${d.getDate()}`, score: Number(avg.toFixed(2)), count: dayMoods.length }
  })
}

export function last7DaysSleepSeries(sleep: SleepRow[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const sow = startOfWeek()
  return days.map((day, i) => {
    const d = new Date(sow)
    d.setDate(sow.getDate() + i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const daySleep = sleep.filter((s) => {
      const t = new Date(s.logged_at)
      return t >= d && t < next
    })
    const hours = daySleep.length ? daySleep.reduce((sum, s) => sum + Number(s.hours), 0) / daySleep.length : 0
    const quality = daySleep.length ? daySleep.reduce((sum, s) => sum + s.quality, 0) / daySleep.length : 0
    return { day, hours: Number(hours.toFixed(1)), quality: Number(quality.toFixed(1)) }
  })
}

export function moodDistribution(moods: MoodRow[]) {
  return ["amazing", "good", "okay", "low", "rough"].map((key) => {
    const m = getMood(key)
    return { name: m.label, value: moods.filter((x) => x.mood === key).length, key }
  })
}

export function journalFrequency(journals: JournalRow[], days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const d = daysAgo(days - 1 - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const count = journals.filter((j) => {
      const t = new Date(j.created_at)
      return t >= d && t < next
    }).length
    return { day: `${d.getMonth() + 1}/${d.getDate()}`, count }
  })
}

// Wellness score = weighted blend of mood, sleep, journal consistency
export function wellnessScore(moods: MoodRow[], sleep: SleepRow[], journals: JournalRow[]) {
  const moodAvg = moods.length
    ? (moods.slice(0, 7).reduce((s, m) => s + getMood(m.mood).score, 0) / Math.min(moods.length, 7)) * 20
    : 0
  const sleepAvg = sleep.length
    ? (sleep.slice(0, 7).reduce((s, x) => s + Math.min(Number(x.hours) / 8, 1), 0) / Math.min(sleep.length, 7)) * 100
    : 0
  const journalScore = Math.min(journals.length, 7) * (100 / 7)
  const score = Math.round(moodAvg * 0.4 + sleepAvg * 0.4 + journalScore * 0.2)
  return Math.min(100, Math.max(0, score))
}
