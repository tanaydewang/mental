import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Smile,
  BookOpen,
  Moon,
  BarChart3,
  Target,
  Users,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Heart,
  Quote,
} from "lucide-react"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingFooter } from "@/components/landing/landing-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

const stats = [
  { value: "100K+", label: "Mood logs" },
  { value: "25K+", label: "Active users" },
  { value: "98%", label: "Positive feedback" },
]

const features = [
  {
    icon: Smile,
    title: "Mood Tracking",
    desc: "Log how you feel with a tap. See patterns and triggers over time to understand what shapes your days.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: BookOpen,
    title: "Journal",
    desc: "A private space to reflect, process, and grow. Auto-save keeps your thoughts safe as you write.",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Moon,
    title: "Sleep Tracking",
    desc: "Monitor sleep hours and quality. Discover the link between rest and your mental wellness.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Beautiful charts turn your data into insight. Trends, correlations, and progress at a glance.",
    color: "from-success/20 to-success/5",
  },
  {
    icon: Target,
    title: "Habit Building",
    desc: "Set wellness goals and watch your streaks grow. Small steps, compounded into lasting change.",
    color: "from-warning/20 to-warning/5",
  },
  {
    icon: Users,
    title: "Community",
    desc: "You're not alone. Share in a supportive space and draw strength from others on the same path.",
    color: "from-destructive/20 to-destructive/5",
  },
]

const testimonials = [
  {
    name: "Maya Chen",
    role: "Product Designer",
    quote:
      "My Space helped me see that my low days always followed poor sleep. That one insight changed everything about how I care for myself.",
    avatar: "https://images.pexels.com/photos/16869444/pexels-photo-16869444.jpeg?auto=compress&cs=tinysrgb&h=120&w=120",
  },
  {
    name: "Daniel Okoye",
    role: "Software Engineer",
    quote:
      "I've tried half a dozen mood apps. This is the first one I actually stuck with. The journaling flow is genuinely a joy to use.",
    avatar: "https://images.pexels.com/photos/35681211/pexels-photo-35681211.jpeg?auto=compress&cs=tinysrgb&h=120&w=120",
  },
  {
    name: "Priya Sharma",
    role: "Therapist",
    quote:
      "I recommend My Space to clients who want to build self-awareness between sessions. The analytics are remarkable for self-reflection.",
    avatar: "https://images.pexels.com/photos/35490803/pexels-photo-35490803.jpeg?auto=compress&cs=tinysrgb&h=120&w=120",
  },
]

const faqs = [
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your data is encrypted in transit and at rest. Your mood logs, journals, and sleep data are yours alone — no one else can access them. We never sell your data.",
  },
  {
    q: "Do I need to use it every day?",
    a: "No, but you'll get the most insight from consistent use. A daily mood log takes about 10 seconds, and patterns emerge fastest with regular check-ins.",
  },
  {
    q: "Is My Space a replacement for therapy?",
    a: "No. My Space is a self-awareness and habit-building tool. It complements professional care beautifully — many therapists even recommend it — but it isn't a substitute.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term commitments. Your data stays yours, and you can export or delete it whenever you choose.",
  },
  {
    q: "Does it work on mobile?",
    a: "My Space is fully responsive and works beautifully on any device — phone, tablet, or desktop. Your data syncs seamlessly across all of them.",
  },
]

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-display text-base font-semibold pr-4">{q}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </motion.div>
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  const onNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = new FormData(form).get("email") as string
    form.reset()
    toast.success("You're on the list!", `We'll send wellness tips to ${email}.`)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[30%] h-[450px] w-[450px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <LandingNav />

      {/* Hero */}
      <section className="relative pt-36 pb-20 sm:pt-44">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="default" className="mb-6 gap-1.5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Your mental wellness companion
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Mental wellness starts with{" "}
              <span className="text-gradient">one small step.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Track your mood. Build healthy habits. Understand yourself better.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/register")} className="group w-full sm:w-auto">
                Get Started
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Floating glass preview cards */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <Card className="overflow-hidden p-0">
                <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                        <Smile className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-display font-semibold">Today's mood</p>
                        <p className="text-sm text-muted-foreground">How are you feeling?</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {["😄", "🙂", "😐", "😕", "😢"].map((e, idx) => (
                        <motion.button
                          key={e}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-colors",
                            idx === 1 ? "border-primary bg-primary/15" : "border-border hover:border-primary/50"
                          )}
                        >
                          {e}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                      <Moon className="h-5 w-5 text-accent" />
                      <span className="text-xs text-muted-foreground">Sleep</span>
                    </div>
                    <p className="mt-2 font-display text-2xl font-bold">7.5h</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-accent" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Floating accent cards */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 -top-6 hidden rounded-2xl glass-strong p-4 shadow-glow lg:block"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-semibold text-success">+12% this week</span>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -right-4 hidden rounded-2xl glass-strong p-4 shadow-glow lg:block"
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-secondary" />
                <span className="text-xs font-semibold">7-day streak</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 rounded-2xl glass p-8 sm:gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="accent" className="mb-4">Everything you need</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              One space for your whole wellbeing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Six powerful tools, working together to help you understand yourself and grow.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group h-full p-6 hover:-translate-y-1 hover:shadow-glow-lg">
                  <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", f.color)}>
                    <f.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Loved by thousands</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Real stories, real change
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full p-6">
                  <Quote className="h-7 w-7 text-primary/40" />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <Badge variant="warning" className="mb-4">Questions?</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>
            <div className="mt-10 rounded-2xl glass p-6 sm:p-8">
              {faqs.map((f, i) => (
                <FaqItem key={f.q} q={f.q} a={f.a} i={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center sm:p-16"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Start your wellness journey today
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/85">
                Join 25,000+ people building healthier minds. Weekly tips, no spam.
              </p>
              <form onSubmit={onNewsletter} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="border-white/30 bg-white/15 text-white placeholder:text-white/70 focus-visible:border-white"
                />
                <Button type="submit" variant="secondary" size="lg" className="shrink-0 bg-white text-primary hover:bg-white/90">
                  Subscribe
                </Button>
              </form>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/70">
                <CheckCircle2 className="h-3.5 w-3.5" /> Free forever. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
