import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <motion.div
        whileHover={{ rotate: 8, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
          <path
            d="M16 7c-2.3 0-4 1.4-4.6 3.4A4 4 0 008.9 9C6.7 9 4.9 10.8 4.9 13c0 1.5.8 2.8 2 3.5a4.7 4.7 0 00-1.4 3.4c0 2.6 2.1 4.6 4.7 4.6 1 0 2-.3 2.7-.8.6 2 2.3 3.3 4.1 3.3s3.5-1.3 4.1-3.3c.8.5 1.7.8 2.7.8 2.6 0 4.7-2 4.7-4.6 0-1.3-.5-2.6-1.4-3.4 1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4-1 0-1.9.4-2.5 1.4C20 8.4 18.3 7 16 7z"
            fill="white"
          />
        </svg>
      </motion.div>
      {withText && (
        <span className="font-display text-xl font-bold tracking-tight">
          My <span className="text-gradient">Space</span>
        </span>
      )}
    </Link>
  )
}
