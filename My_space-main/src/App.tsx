import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/context/theme-context"
import { ToastProvider } from "@/components/ui/toaster"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/auth/login-page"
import { RegisterPage } from "@/pages/auth/register-page"
import { ForgotPasswordPage } from "@/pages/auth/forgot-password-page"
import { ResetPasswordPage } from "@/pages/auth/reset-password-page"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Loader2 } from "lucide-react"

const DashboardPage = lazy(() => import("@/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })))
const MoodPage = lazy(() => import("@/pages/mood-page").then((m) => ({ default: m.MoodPage })))
const JournalPage = lazy(() => import("@/pages/journal-page").then((m) => ({ default: m.JournalPage })))
const SleepPage = lazy(() => import("@/pages/sleep-page").then((m) => ({ default: m.SleepPage })))
const AnalyticsPage = lazy(() => import("@/pages/analytics-page").then((m) => ({ default: m.AnalyticsPage })))
const CommunityPage = lazy(() => import("@/pages/community-page").then((m) => ({ default: m.CommunityPage })))
const ProfilePage = lazy(() => import("@/pages/profile-page").then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import("@/pages/settings-page").then((m) => ({ default: m.SettingsPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/app" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
                <Route path="/app/mood" element={<Suspense fallback={<PageLoader />}><MoodPage /></Suspense>} />
                <Route path="/app/journal" element={<Suspense fallback={<PageLoader />}><JournalPage /></Suspense>} />
                <Route path="/app/sleep" element={<Suspense fallback={<PageLoader />}><SleepPage /></Suspense>} />
                <Route path="/app/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
                <Route path="/app/community" element={<Suspense fallback={<PageLoader />}><CommunityPage /></Suspense>} />
                <Route path="/app/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
                <Route path="/app/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
