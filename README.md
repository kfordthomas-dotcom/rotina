# Rotina

A calendar-first planning tool for freelancers and small agencies.

## Stack
- React + Vite + TypeScript
- Supabase (auth + database)
- TanStack Query
- Tailwind CSS (Floot design system)
- shadcn/ui primitives

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
Go to [supabase.com](https://supabase.com) and create a new project.

### 3. Run the database migration
In your Supabase dashboard → SQL Editor, paste and run the contents of:
```
supabase/migrations/001_initial_schema.sql
```

### 4. Add environment variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

Your credentials are in Supabase → Settings → API:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Enable Email Auth in Supabase
Go to Authentication → Providers → Email and make sure it's enabled.

### 6. Run the dev server
```bash
npm run dev
```

---

## Project Structure

```
src/
├── api/
│   └── supabaseClient.ts     # All Supabase data functions (replaces base44)
├── components/
│   ├── AppLayout.tsx          # Main nav sidebar + layout wrapper
│   ├── calendar/              # CalendarHeader, WeekView, DayView, MonthView, etc.
│   ├── dialogs/               # All dialog/sheet components
│   ├── sidebar/               # BacklogSidebar
│   └── ui/                    # shadcn UI primitives
├── lib/
│   ├── AuthContext.tsx        # Supabase auth context
│   ├── calendarUtils.ts       # Date helpers, PROJECT_COLORS, formatHour, etc.
│   ├── query-client.ts        # TanStack Query client
│   ├── supabase.ts            # Supabase client instance
│   └── utils.ts               # cn() helper
└── pages/
    ├── Calendar.tsx
    ├── Clients.tsx
    ├── Projects.tsx
    └── Login.tsx
```

---

## Renaming the app

The app is currently called "Rotina" throughout. To rename:
1. `index.html` — update `<title>`
2. `src/components/AppLayout.tsx` — update the logo text
3. `src/pages/Login.tsx` — update the heading

---

## Notes

- All data is scoped to the logged-in user via Supabase Row Level Security
- The design system uses CSS variables from Floot (warm paper tones, dark mode included)
- `src/api/supabaseClient.ts` exports an `entities` object that mirrors the original `base44.entities` API shape, making the migration transparent to all page components
