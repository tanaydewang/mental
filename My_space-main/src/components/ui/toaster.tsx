import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

type Toast = {
  id: string
  type: ToastType
  title: string
  description?: string
}

type ToastContextValue = {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export const toast: ToastContextValue = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
}

const colors = {
  success: "text-success",
  error: "text-destructive",
  info: "text-accent",
  warning: "text-warning",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const remove = React.useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id))
  }, [])

  const add = React.useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((s) => [...s, { id, type, title, description }])
      setTimeout(() => remove(id), 4500)
    },
    [remove]
  )

  const value = React.useMemo<ToastContextValue>(
    () => ({
      success: (title, description) => add("success", title, description),
      error: (title, description) => add("error", title, description),
      info: (title, description) => add("info", title, description),
      warning: (title, description) => add("warning", title, description),
    }),
    [add]
  )

  React.useEffect(() => {
    Object.assign(toast, value)
  }, [value])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl glass-strong p-4 shadow-glow-lg"
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", colors[t.type])} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Standalone Toaster component for apps that mount the provider elsewhere
export function Toaster() {
  return null
}
