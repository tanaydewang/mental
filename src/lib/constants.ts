export const MOOD_OPTIONS = [
  { key: "amazing", emoji: "😄", label: "Amazing", color: "#10B981", score: 5 },
  { key: "good", emoji: "🙂", label: "Good", color: "#22C55E", score: 4 },
  { key: "okay", emoji: "😐", label: "Okay", color: "#F59E0B", score: 3 },
  { key: "low", emoji: "😕", label: "Low", color: "#F97316", score: 2 },
  { key: "rough", emoji: "😢", label: "Rough", color: "#EF4444", score: 1 },
] as const

export type MoodKey = (typeof MOOD_OPTIONS)[number]["key"]

export function getMood(key: string) {
  return MOOD_OPTIONS.find((m) => m.key === key) ?? MOOD_OPTIONS[2]
}

export const JOURNAL_CATEGORIES = [
  "Personal",
  "Gratitude",
  "Reflection",
  "Goals",
  "Dreams",
  "Work",
] as const

export const DAILY_QUOTES = [
  { text: "You don't have to be perfect to be worthy of love and belonging.", author: "Brené Brown" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Rest is not idleness. To lie sometimes on the grass under trees is medicine for the soul.", author: "John Lubbock" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
]

export function quoteOfDay() {
  const day = Math.floor(Date.now() / 86400000)
  return DAILY_QUOTES[day % DAILY_QUOTES.length]
}
