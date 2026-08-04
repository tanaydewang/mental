import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Heart, Send, Trash2, MessageCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase, type PostRow } from "@/lib/supabase"
import { usePosts } from "@/hooks/use-data"
import { MOOD_OPTIONS, getMood } from "@/lib/constants"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/toaster"
import { cn, formatRelative, initials } from "@/lib/utils"

export function CommunityPage() {
  const { profile, user } = useAuth()
  const { posts, loading, refresh } = usePosts()
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<string>("okay")
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error("Write something first", "Your post can't be empty.")
      return
    }
    setPosting(true)
    const name = profile?.full_name || "Anonymous"
    const { error } = await supabase.from("posts").insert({
      content: content.trim(),
      mood,
      author_name: name,
      author_avatar: profile?.avatar_url ?? null,
    })
    setPosting(false)
    if (error) {
      toast.error("Couldn't post", error.message)
      return
    }
    toast.success("Shared with the community")
    setContent("")
    refresh()
  }

  const handleLike = async (post: PostRow) => {
    const { error } = await supabase.from("posts").update({ likes: post.likes + 1 }).eq("id", post.id)
    if (error) return toast.error("Couldn't like", error.message)
    refresh()
  }

  const handleDelete = async (post: PostRow) => {
    if (post.user_id !== user?.id) return
    const { error } = await supabase.from("posts").delete().eq("id", post.id)
    if (error) return toast.error("Couldn't delete", error.message)
    toast.success("Post removed")
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community"
        description="You're not alone. Share and draw strength from others on the same path."
      />

      {/* Composer */}
      <Card>
        <CardContent className="p-5">
          <div className="flex gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white">
                {initials(profile?.full_name || "You")}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something with the community…"
                rows={3}
                className="w-full rounded-xl border border-input bg-card/40 px-4 py-3 text-sm backdrop-blur placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMood(m.key)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                        mood === m.key ? "border-primary bg-primary/15 scale-110" : "border-border"
                      )}
                      title={m.label}
                    >
                      <span className="text-base">{m.emoji}</span>
                    </button>
                  ))}
                </div>
                <Button onClick={handlePost} loading={posting} size="sm">
                  <Send className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="The community is quiet"
          description="Be the first to share. Your words might be exactly what someone needs to hear."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => {
              const m = getMood(post.mood ?? "okay")
              const isOwn = post.user_id === user?.id
              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-5">
                    <div className="flex gap-3">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white">
                          {initials(post.author_name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{post.author_name}</p>
                          <span className="text-xs text-muted-foreground">· {formatRelative(post.created_at)}</span>
                          {post.mood && (
                            <Badge variant="outline" className="gap-1">
                              <span>{m.emoji}</span> {m.label}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{post.content}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-secondary"
                          >
                            <Heart className="h-4 w-4" /> {post.likes}
                          </button>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MessageCircle className="h-4 w-4" /> 0
                          </span>
                          {isOwn && (
                            <button
                              onClick={() => handleDelete(post)}
                              className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
