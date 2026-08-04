import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Camera, Mail, User, Lock, Eye, EyeOff, Calendar, Sparkles } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toaster"
import { initials, formatDate, cn } from "@/lib/utils"

const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your name"),
  bio: z.string().max(200, "Keep it under 200 characters").optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    current: z.string().min(6, "Enter your current password"),
    next: z.string().min(6, "At least 6 characters"),
    confirm: z.string().min(6, "Confirm your new password"),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords don't match", path: ["confirm"] })
type PasswordForm = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? "", bio: profile?.bio ?? "" },
  })

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large", "Please pick an image under 2MB.")
      return
    }
    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `avatars/${user.id}.${ext}`
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (upErr) {
      setUploading(false)
      toast.error("Upload failed", upErr.message)
      return
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path)
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id)
    setUploading(false)
    if (dbErr) {
      toast.error("Couldn't update avatar", dbErr.message)
      return
    }
    toast.success("Avatar updated")
    refreshProfile()
  }

  const onProfileSubmit = async (values: ProfileForm) => {
    setSavingProfile(true)
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.full_name, bio: values.bio ?? "", updated_at: new Date().toISOString() })
      .eq("id", user!.id)
    setSavingProfile(false)
    if (error) return toast.error("Couldn't save", error.message)
    toast.success("Profile updated")
    refreshProfile()
  }

  const onPasswordSubmit = async (values: PasswordForm) => {
    setSavingPassword(true)
    const { error: sigErr } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: values.current,
    })
    if (sigErr) {
      setSavingPassword(false)
      toast.error("Current password is incorrect")
      return
    }
    const { error } = await supabase.auth.updateUser({ password: values.next })
    setSavingPassword(false)
    if (error) return toast.error("Couldn't update password", error.message)
    toast.success("Password updated")
    resetPwd()
  }

  const name = profile?.full_name || "My Space member"
  const avatar = profile?.avatar_url

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information and account." />

      {/* Profile header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-brand">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.3),transparent_50%)]" />
          </div>
          <CardContent className="relative -mt-12 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt={name} className="h-24 w-24 rounded-2xl border-4 border-card object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-gradient-brand font-display text-2xl font-bold text-white">
                    {initials(name)}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md transition-transform hover:scale-110"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">{name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="default" className="gap-1.5">
                    <Sparkles className="h-3 w-3" /> Member
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Calendar className="h-3 w-3" /> Joined {formatDate(profile?.created_at ?? new Date(), { month: "long", year: "numeric" })}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal information
            </CardTitle>
            <CardDescription>Update your display name and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pfullname">Full name</Label>
                <Input id="pfullname" {...regProfile("full_name")} />
                {profileErrors.full_name && <p className="text-xs text-destructive">{profileErrors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pbio">Bio</Label>
                <textarea
                  id="pbio"
                  {...regProfile("bio")}
                  rows={3}
                  placeholder="Tell us a little about yourself…"
                  className="w-full rounded-xl border border-input bg-card/40 px-4 py-3 text-sm backdrop-blur placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                />
                {profileErrors.bio && <p className="text-xs text-destructive">{profileErrors.bio.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={user?.email ?? ""} disabled className="pl-10 opacity-70" />
                </div>
              </div>
              <Button type="submit" loading={savingProfile}>Save changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-secondary" /> Change password
            </CardTitle>
            <CardDescription>Keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="current" type={showCurrent ? "text" : "password"} className="pl-10 pr-10" {...regPwd("current")} />
                  <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdErrors.current && <p className="text-xs text-destructive">{pwdErrors.current.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="next" type={showNext ? "text" : "password"} className="pl-10 pr-10" {...regPwd("next")} />
                  <button type="button" onClick={() => setShowNext((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdErrors.next && <p className="text-xs text-destructive">{pwdErrors.next.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" {...regPwd("confirm")} />
                {pwdErrors.confirm && <p className="text-xs text-destructive">{pwdErrors.confirm.message}</p>}
              </div>
              <Button type="submit" loading={savingPassword}>Update password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
