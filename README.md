# My Space

> Mental wellness starts with one small step.

My Space is a premium, production-ready mental wellness SaaS application. Track your mood, journal your thoughts, monitor your sleep, visualize your trends, and connect with a supportive community — all in one beautifully designed space.

## Features

### Landing Page
- Animated hero with gradient blobs and floating glass cards
- Statistics, feature grid, testimonials, FAQ, newsletter CTA, footer
- Fully responsive with mobile menu

### Authentication
- Email + password sign up / sign in (Supabase Auth)
- Forgot password + reset password flows
- Protected routes, loading states, password visibility toggle, remember me
- Auto-created user profile on signup

### Dashboard
- Wellness score with animated progress ring
- Today's mood, last sleep, journal count, active goals stat cards
- Weekly mood & sleep charts (Recharts)
- Quick actions, daily quote, recent journals, upcoming goals
- Responsive sidebar (desktop) + slide-out drawer (mobile)

### Mood Tracker
- Emoji picker with 5 moods + intensity slider + notes
- Weekly / monthly trend area chart
- Mood calendar (color-coded by mood)
- Mood distribution pie chart
- Insights: average score, streak, most frequent mood
- History with delete

### Journal
- Rich-text editor (bold, italic, lists, quote, undo/redo)
- Create / edit / delete entries
- Search + category filters
- Pin entries
- Auto-save (debounced) with visual indicator

### Sleep Tracker
- Hours slider + quality star rating + notes
- Weekly / monthly sleep line chart
- Hours-per-day bar chart
- Report stats: average hours, quality, consistency score
- History with delete

### Analytics
- Progress cards (mood logs, sleep entries, journals, goals completed)
- Overall wellness score
- 30-day mood trend, 7-day sleep trend
- Journal frequency bar chart (14 days)
- Mood distribution pie chart
- 12-week activity heatmap

### Community
- Create posts with a mood tag
- Like posts
- Delete your own posts
- Avatar + author name + relative timestamps

### Profile
- Avatar upload (Supabase Storage)
- Update full name + bio
- Change password (with current password verification)
- Member badge + join date

### Settings
- Theme switcher (dark / light) with live preview
- Notification toggles
- Privacy toggles (public profile)
- Security panel
- Sign out / danger zone

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS, tailwindcss-animate |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Row Level Security) |

## Design System

- **Dark + light themes** with CSS custom properties (HSL color ramps)
- **Glassmorphism** cards with backdrop blur
- **Premium palette**: Primary `#4F46E5`, Secondary `#7C3AED`, Accent `#06B6D4`, Success `#10B981`, Warning `#F59E0B`
- **Typography**: Sora (display) + Inter (body)
- **8px spacing system**, rounded corners, soft shadows, glow effects
- Micro-interactions: hover lifts, animated transitions, loading skeletons, toast notifications

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your Supabase URL + anon key to .env

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Database Schema

The app uses Supabase (PostgreSQL) with Row Level Security enabled on every table. Each user only sees their own data.

| Table | Purpose |
|-------|---------|
| `profiles` | Display name, avatar, bio, preferences (auto-created on signup) |
| `moods` | Mood logs: emoji, intensity (1-5), note, tags, timestamp |
| `journals` | Journal entries: title, rich-text content, category, pinned |
| `sleep` | Sleep logs: hours, quality (1-5), bedtime/wake, note |
| `goals` | Wellness goals: title, target, progress, status |
| `posts` | Community feed posts: author, content, mood, likes |

All tables use `user_id DEFAULT auth.uid()` so inserts work without the client passing an owner, and RLS policies enforce per-user isolation.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Protected route, auth layout
│   ├── brand/         # Logo
│   ├── dashboard/     # Layout, sidebar, navbar, charts, stat cards, calendar
│   ├── journal/       # Rich-text editor
│   ├── landing/       # Nav, footer
│   └── ui/            # Button, Card, Input, Dialog, Toast, Skeleton, etc.
├── context/           # Auth + theme providers
├── hooks/             # Data fetching + analytics helpers
├── lib/               # Supabase client, constants, utils
└── pages/
    ├── auth/          # Login, register, forgot, reset
    ├── landing-page.tsx
    ├── dashboard-page.tsx
    ├── mood-page.tsx
    ├── journal-page.tsx
    ├── sleep-page.tsx
    ├── analytics-page.tsx
    ├── community-page.tsx
    ├── profile-page.tsx
    └── settings-page.tsx
```

## License

Built as a demonstration of a premium SaaS product. All code is original.
