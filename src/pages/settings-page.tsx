import { motion } from "framer-motion"
import { Moon, Sun, Bell, Shield, Lock, Eye, EyeOff, Trash2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "@/context/theme-context"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function SettingsPage() {
  const { profile, refreshProfile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [notif, setNotif] = useState(profile?.notification_enabled ?? true)
  const [privacy, setPrivacy] = useState(profile?.privacy_public ?? false)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)

  const toggleNotif = async (v: boolean) => {
    setNotif(v)
    setSavingNotif(true)
    const { error } = await supabase.from("profiles").update({ notification_enabled: v }).eq("id", profile!.id)
    setSavingNotif(false)
    if (error) {
      setNotif(!v)
      return toast.error("Couldn't update", error.message)
    }
    toast.success(v ? "Notifications on" : "Notifications off")
    refreshProfile()
  }

  const togglePrivacy = async (v: boolean) => {
    setPrivacy(v)
    setSavingPrivacy(true)
    const { error } = await supabase.from("profiles").update({ privacy_public: v }).eq("id", profile!.id)
    setSavingPrivacy(false)
    if (error) {
      setPrivacy(!v)
      return toast.error("Couldn't update", error.message)
    }
    toast.success(v ? "Profile is public" : "Profile is private")
    refreshProfile()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  const themeOptions = [
    { key: "dark" as const, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    { key: "light" as const, label: "Light", icon: Sun, desc: "Bright and clear" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Customize My Space to fit your preferences." />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" /> Appearance
          </CardTitle>
          <CardDescription>Choose how My Space looks to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  theme === opt.key ? "border-primary bg-primary/10 shadow-glow" : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", theme === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {theme === opt.key && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" /> Notifications
          </CardTitle>
          <CardDescription>Manage how and when we reach out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row
            title="Daily mood reminder"
            desc="A gentle nudge to log your mood each day."
            control={<Switch checked={notif} onCheckedChange={toggleNotif} disabled={savingNotif} />}
          />
          <div className="h-px bg-border" />
          <Row
            title="Weekly insights email"
            desc="A summary of your trends every Sunday."
            control={<Switch checked={notif} onCheckedChange={toggleNotif} disabled={savingNotif} />}
          />
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" /> Privacy
          </CardTitle>
          <CardDescription>Control who can see your information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row
            title="Public profile"
            desc="Allow other community members to see your name and avatar."
            control={<Switch checked={privacy} onCheckedChange={togglePrivacy} disabled={savingPrivacy} />}
          />
          <div className="h-px bg-border" />
          <Row
            title="Show in community"
            desc="Your posts appear in the community feed."
            control={<Switch checked={true} onCheckedChange={() => toast.info("Community visibility is always on")} />}
          />
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-secondary" /> Security
          </CardTitle>
          <CardDescription>Keep your account safe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/15">
                <Lock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Last changed recently</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/profile")}>
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Two-factor auth</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Badge variant="warning">Coming soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> Danger zone
          </CardTitle>
          <CardDescription>Irreversible actions. Proceed with care.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground">End your current session</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {control}
    </div>
  )
}
