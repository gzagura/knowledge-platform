# Knowledge Discovery Platform - Frontend Architecture

## Project Overview
A complete Next.js 14 frontend for a Knowledge Discovery Platform with:
- Multi-language support (English, Ukrainian, Russian)
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Article discovery and interaction system
- User authentication and preferences
- Infinite scroll feed with scroll-snap
- Keyboard shortcuts support

## Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles with CSS variables
│   │   ├── providers.tsx            # React Query + Theme providers
│   │   └── [locale]/
│   │       ├── layout.tsx           # Root layout with i18n setup
│   │       ├── page.tsx             # Onboarding or redirect to feed
│   │       ├── (main)/
│   │       │   ├── layout.tsx       # Main layout with sidebar/tabbar
│   │       │   ├── feed/page.tsx    # Article feed (default)
│   │       │   ├── article/[id]/    # Full article view
│   │       │   ├── search/          # Article search
│   │       │   ├── saved/           # Bookmarked articles
│   │       │   ├── profile/         # User profile
│   │       │   └── settings/        # User settings
│   │       └── (auth)/
│   │           ├── login/           # Login page
│   │           └── signup/          # Signup page
│   │
│   ├── components/
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx      # Card view with interactions
│   │   │   ├── ArticleFeed.tsx      # Infinite scroll feed
│   │   │   ├── ArticleFullView.tsx  # Full article modal/page
│   │   │   ├── CategoryLabel.tsx    # Category + reading time
│   │   │   └── InteractionBar.tsx   # Like, bookmark, share buttons
│   │   │
│   │   ├── navigation/
│   │   │   ├── DesktopSidebar.tsx   # Left sidebar (≥1024px)
│   │   │   ├── BottomTabBar.tsx     # Bottom nav (mobile/tablet)
│   │   │   ├── Header.tsx           # Mobile/tablet header
│   │   │   └── RightSidebar.tsx     # Right sidebar (≥1280px)
│   │   │
│   │   ├── onboarding/
│   │   │   └── OnboardingWizard.tsx # Multi-step onboarding flow
│   │   │
│   │   └── ui/
│   │       ├── Snackbar.tsx         # Toast notifications
│   │       ├── Skeleton.tsx         # Loading skeletons
│   │       ├── ThemeToggle.tsx      # Dark/light toggle
│   │       ├── LanguageSwitcher.tsx # Language dropdown
│   │       └── SearchInput.tsx      # Debounced search input
│   │
│   ├── hooks/
│   │   ├── useMediaQuery.ts         # Responsive breakpoints
│   │   ├── useKeyboardShortcuts.ts  # Keyboard handler (L, S, D, Space, Enter, Arrow)
│   │   ├── useArticles.ts           # TanStack Query hooks for articles
│   │   ├── useInteractions.ts       # Like, bookmark, dismiss mutations
│   │   └── useAuth.ts               # Authentication state
│   │
│   ├── lib/
│   │   ├── api.ts                   # API client with auth headers
│   │   └── mock-data.ts             # Fallback mock articles for development
│   │
│   ├── types/
│   │   ├── article.ts               # Article TypeScript types
│   │   └── user.ts                  # User TypeScript types
│   │
│   ├── i18n/
│   │   ├── config.ts                # i18n configuration
│   │   └── request.ts               # next-intl getRequestConfig
│   │
│   └── middleware.ts                # next-intl routing middleware
│
├── messages/                        # Translation files
│   ├── en.json                      # English translations
│   ├── uk.json                      # Ukrainian translations
│   └── ru.json                      # Russian translations
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration (strict mode)
├── tailwind.config.ts               # Tailwind CSS config with custom colors
├── postcss.config.js                # PostCSS configuration
├── next.config.mjs                  # Next.js config with next-intl plugin
└── .gitignore                       # Git ignore rules

```

## Technology Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety (strict mode)

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Variables** - Theme switching (light/dark modes)
- **Inter Font** - Google Fonts typography

### State & Data
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animations (scroll-snap, slide-ups, transitions)
- **next-intl** - Internationalization (en, uk, ru)
- **next-themes** - Theme management (light/dark/system)

### UI Components
- **Lucide React** - SVG icons (Heart, Bookmark, Search, Settings, etc.)
- **Custom Components** - All built from scratch

## Design System

### Colors (CSS Variables)
```css
Light Mode:
--bg-primary: #ffffff
--bg-secondary: #f8f8f8
--text-primary: #111111
--text-secondary: #666666
--text-tertiary: #999999
--border: #e5e5e5
--accent: #ff3366 (likes)

Dark Mode:
--bg-primary: #111111
--bg-secondary: #1a1a1a
--text-primary: #f5f5f5
--text-secondary: #999999
--text-tertiary: #666666
--border: #2a2a2a
--accent: #ff4477
```

### Responsive Breakpoints
- **Mobile**: < 768px (full-width, bottom navigation)
- **Tablet**: 768px - 1023px (bottom navigation)
- **Desktop**: ≥ 1024px (left sidebar)
- **Wide Desktop**: ≥ 1280px (left + right sidebars)

### Animations
- **Transitions**: 150-200ms, ease-out timing
- **Scroll-snap**: Y-axis mandatory on feed
- **Framer Motion**: Slide-ups, scale animations, presence changes

## Key Features

### Feed System
- **Infinite Scroll**: Uses Intersection Observer for auto-loading
- **Scroll-snap**: CSS snap points for smooth, full-viewport card navigation
- **Optimistic Updates**: Instant UI feedback for likes/bookmarks
- **Keyboard Navigation**: Space=next, L=like, S=save, D=dismiss, Enter=read

### Article Discovery
- **Feed Page**: Main infinite scroll of personalized articles
- **Search**: Debounced search with results grid
- **Saved**: Bookmarked articles list
- **Categories**: Science, History, Technology, Art, Geography, Medicine, Philosophy, Sports, Music, Cinema

### Interactions
- **Like/Unlike**: With optimistic updates and count increment
- **Bookmark/Unbookmark**: Toggle saved status
- **Dismiss**: Hide article with undo option (snackbar)
- **Share**: Native share API or clipboard fallback
- **Analytics**: Optional tracking of engagement

### Authentication
- **Login/Signup**: Email + password forms
- **OAuth**: Placeholder for Google and GitHub (coming soon)
- **Token Storage**: localStorage for auth tokens
- **Protected Routes**: Graceful fallback for unauthenticated users

### User Preferences
- **Language**: Switch between EN, UK, RU with routing
- **Theme**: Light, Dark, System preference
- **Reading Time**: Quick (2min), Standard (5min), Deep Dive (10+min)
- **Interests**: Selectable categories for personalization
- **Profile**: View stats (articles read, streak, top categories)

### Onboarding
- **Multi-step Wizard**: Language → Interests → Reading Time → Auth
- **Progress Indicators**: Visual dots showing current step
- **Category Selection**: Min 3, Max 5 interests required
- **Skip Option**: Can bypass auth step

## API Integration

### Base URL
- Development: `http://localhost:8000/api`
- Configurable via `NEXT_PUBLIC_API_URL` env variable

### API Endpoints (Expected)
- `GET /articles/feed?skip=0&limit=10` - Paginated feed
- `GET /articles/{id}` - Full article content
- `GET /articles/random?count=3` - Random articles
- `GET /articles/search?q=query` - Article search
- `POST /articles/{id}/like` - Toggle like
- `POST /articles/{id}/bookmark` - Toggle bookmark
- `POST /articles/{id}/not-interested` - Dismiss article
- `GET /auth/me` - Current user info
- `POST /auth/login` - Email/password login

### Fallback Behavior
All API hooks have mock data fallbacks for development without backend

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development Server
```bash
npm run dev
```
Open http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## Code Quality

### TypeScript
- Strict mode enabled
- Full type coverage
- Path aliases: `@/*` → `src/*`

### Styling
- Tailwind CSS only (no inline styles)
- CSS variables for theming
- Mobile-first responsive design

### Accessibility
- Semantic HTML
- ARIA labels on buttons
- Keyboard navigation support
- Focus states on interactive elements

### Performance
- Code splitting (dynamic imports)
- Image optimization (next/image)
- CSS minimization
- Query caching (TanStack Query)
- Request deduplication

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- OAuth implementation (Google, GitHub)
- Real backend API integration
- User analytics dashboard
- Article recommendations engine
- Offline reading mode
- Social sharing features
- Comment system
- Reading time tracking
- Achievement badges
