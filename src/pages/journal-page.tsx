import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Save,
  X,
  Clock,
  Check,
} from "lucide-react"
import { supabase, type JournalRow } from "@/lib/supabase"
import { useJournals } from "@/hooks/use-data"
import { JOURNAL_CATEGORIES } from "@/lib/constants"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Dialog } from "@/components/ui/dialog"
import { RichEditor } from "@/components/journal/rich-editor"
import { toast } from "@/components/ui/toaster"
import { cn, formatRelative, formatDate } from "@/lib/utils"

function stripHtml(html: string) {
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ""
}

export function JournalPage() {
  const { journals, loading, refresh } = useJournals()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")
  const [editing, setEditing] = useState<JournalRow | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    return journals.filter((j) => {
      const matchCat = category === "All" || j.category === category
      const text = stripHtml(j.content).toLowerCase() + " " + j.title.toLowerCase()
      const matchQuery = !query || text.includes(query.toLowerCase())
      return matchCat && matchQuery
    })
  }, [journals, query, category])

  const pinned = filtered.filter((j) => j.is_pinned)
  const rest = filtered.filter((j) => !j.is_pinned)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal"
        description="A private space to reflect, process, and grow."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New entry
          </Button>
        }
      />

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your journals…"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...JOURNAL_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={query || category !== "All" ? "No matching entries" : "Your journal is empty"}
          description={query || category !== "All" ? "Try a different search or filter." : "Start writing to capture your thoughts and reflections."}
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Write your first entry</Button>}
        />
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <Pin className="h-4 w-4" /> Pinned
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((j) => (
                  <JournalCard key={j.id} journal={j} onEdit={() => setEditing(j)} onRefresh={refresh} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="mb-3 text-sm font-semibold text-muted-foreground">All entries</p>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((j) => (
                  <JournalCard key={j.id} journal={j} onEdit={() => setEditing(j)} onRefresh={refresh} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit dialog */}
      <AnimatePresence>
        {(creating || editing) && (
          <JournalEditor
            journal={editing}
            onClose={() => {
              setCreating(false)
              setEditing(null)
            }}
            onSaved={() => {
              setCreating(false)
              setEditing(null)
              refresh()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function JournalCard({ journal, onEdit, onRefresh }: { journal: JournalRow; onEdit: () => void; onRefresh: () => void }) {
  const preview = stripHtml(journal.content).slice(0, 120)
  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase.from("journals").update({ is_pinned: !journal.is_pinned }).eq("id", journal.id)
    if (error) return toast.error("Couldn't update", error.message)
    onRefresh()
  }
  const del = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase.from("journals").delete().eq("id", journal.id)
    if (error) return toast.error("Couldn't delete", error.message)
    toast.success("Entry deleted")
    onRefresh()
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Card className="group h-full cursor-pointer p-5 hover:-translate-y-1 hover:shadow-glow-lg" onClick={onEdit}>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">{journal.category}</Badge>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={togglePin} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={journal.is_pinned ? "Unpin" : "Pin"}>
              {journal.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
            <button onClick={del} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <h3 className="mt-3 line-clamp-1 font-display font-semibold">{journal.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{preview || "Empty entry"}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Clock className="h-3 w-3" /> {formatRelative(journal.created_at)}
        </p>
      </Card>
    </motion.div>
  )
}

function JournalEditor({ journal, onClose, onSaved }: { journal: JournalRow | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(journal?.title ?? "")
  const [content, setContent] = useState(journal?.content ?? "")
  const [cat, setCat] = useState(journal?.category ?? "Personal")
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(journal?.id ?? null)

  // Auto-save (only for existing entries)
  useEffect(() => {
    if (!idRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setAutoSaved(false)
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("journals")
        .update({ title, content, category: cat, updated_at: new Date().toISOString() })
        .eq("id", idRef.current!)
      if (!error) {
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 2000)
      }
    }, 1500)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [title, content, cat])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Add a title", "Give your entry a title before saving.")
      return
    }
    setSaving(true)
    if (idRef.current) {
      const { error } = await supabase
        .from("journals")
        .update({ title, content, category: cat, updated_at: new Date().toISOString() })
        .eq("id", idRef.current)
      setSaving(false)
      if (error) return toast.error("Couldn't save", error.message)
      toast.success("Entry saved")
      onSaved()
    } else {
      const { data, error } = await supabase
        .from("journals")
        .insert({ title, content, category: cat })
        .select()
        .single()
      setSaving(false)
      if (error) return toast.error("Couldn't create", error.message)
      idRef.current = (data as JournalRow).id
      toast.success("Entry created")
      onSaved()
    }
  }

  return (
    <Dialog open onClose={onClose} className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{journal ? "Edit entry" : "New journal entry"}</h2>
          {autoSaved && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Auto-saved
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jtitle">Title</Label>
          <Input id="jtitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your entry a title" />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {JOURNAL_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your thoughts</Label>
          <RichEditor value={content} onChange={setContent} placeholder="Start writing…" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save entry
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
