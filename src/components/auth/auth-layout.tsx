import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Logo } from "@/components/brand/logo"
import { quoteOfDay } from "@/lib/constants"

export function AuthLayout({ children, side }: { children: ReactNode; side: "left" | "right" }) {
  const quote = quoteOfDay()
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="relative flex min-h-screen flex-col justify-between p-6 sm:p-10 lg:min-h-0">
        <div className="flex justify-between">
          <Logo />
          <a
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back home
          </a>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md py-10"
        >
          {children}
        </motion.div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} My Space. Your mind, your space.
        </p>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-brand opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        {/* floating blobs */}
        <motion.div
          className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-10 bottom-32 h-80 w-80 rounded-full bg-accent/40 blur-3xl"
          animate={{ y: [0, 40, 0], x: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 flex h-full flex-col justify-center p-12">
          <motion.blockquote
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-md"
          >
            <p className="font-display text-3xl font-semibold leading-tight text-white">
              "{quote.text}"
            </p>
            <footer className="mt-4 text-lg text-white/80">— {quote.author}</footer>
          </motion.blockquote>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-6"
          >
            {[
              { n: "100K+", l: "Mood logs" },
              { n: "25K+", l: "Active users" },
              { n: "98%", l: "Positive feedback" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-bold text-white">{s.n}</div>
                <div className="text-sm text-white/70">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
