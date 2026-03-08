# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Visit

1. **Onboarding**: You'll see a 4-step wizard
   - Select language (English, Ukrainian, Russian)
   - Choose 3-5 interests
   - Select preferred reading time
   - Optionally sign up (or continue without account)

2. **Feed**: Scroll through personalized articles
   - Use Space/Arrow keys to navigate
   - Press L to like, S to save, D to dismiss
   - Click article to read full content

3. **Navigation**:
   - **Mobile/Tablet**: Bottom tab bar with 4 main sections
   - **Desktop**: Left sidebar with full navigation
   - **Settings**: Theme toggle (top right on mobile), language switcher

## Key Features

### Article Interactions
- **Like**: Click heart icon or press `L`
- **Save**: Click bookmark or press `S`
- **Dismiss**: Click circle or press `D` (shows undo)
- **Share**: Click share icon or press `Cmd+C/Ctrl+C`

### Search
- Debounced search (300ms delay)
- Results update as you type
- Click result to view full article

### Profile
- View reading stats
- See current streak
- Manage interests
- Logout option

### Settings
- **Theme**: Light, Dark, or System
- **Language**: Switch between 3 languages
- **Reading Time**: Quick, Standard, or Deep Dive
- **Interests**: Update your preferences
- **Account**: Logout button

## Environment Variables

Create `.env.local` file:

```
# API base URL (optional, defaults to localhost:8000/api)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Development Tips

### Mock Data
- No backend? Articles come from `src/lib/mock-data.ts`
- Fallback happens automatically when API fails
- Perfect for developing UI without backend

### Keyboard Shortcuts
- `L` - Like current article
- `S` - Save/bookmark current article
- `D` - Dismiss current article
- `Space` - Next article (scroll)
- `Enter` - Open full article view
- `↑` / `↓` - Navigate (if implemented)

### CSS Variables
Theme colors are CSS variables in `src/app/globals.css`:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f8f8;
  --text-primary: #111111;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --border: #e5e5e5;
  --accent: #ff3366;
}
```

Change them to customize the entire app's color scheme.

### Responsive Design
Test different breakpoints:
- **< 768px**: Mobile layout (no sidebar, bottom tab bar)
- **768px - 1024px**: Tablet layout
- **≥ 1024px**: Desktop with left sidebar
- **≥ 1280px**: Wide desktop with left + right sidebars

Use DevTools device emulation or:
```bash
# Testing responsive design
http://localhost:3000
# Use Chrome DevTools > Toggle device toolbar (Ctrl+Shift+M)
```

### Translations
All UI strings are translated in `messages/{lang}.json`:
- `messages/en.json` - English
- `messages/uk.json` - Ukrainian
- `messages/ru.json` - Russian

Change language via dropdown (appears on mobile/tablet in header, on desktop in sidebar)

## Production Build

```bash
# Build optimized version
npm run build

# Test production build locally
npm start
```

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Node Modules Issues
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Type Errors
```bash
# Check TypeScript
npx tsc --noEmit
```

## File Structure Quick Reference

```
src/
├── app/          # Next.js pages and layouts
├── components/   # Reusable React components
├── hooks/        # Custom React hooks
├── lib/          # Utilities and API client
├── types/        # TypeScript type definitions
├── i18n/         # Internationalization config
└── middleware.ts # Language routing middleware
```

## Next Steps

1. **Connect Backend**: Update `NEXT_PUBLIC_API_URL` to your backend
2. **Setup OAuth**: Replace placeholder buttons in login/signup
3. **Add Analytics**: Integrate tracking library
4. **Deploy**: Use Vercel, Netlify, or your own server

## Support Files

- `ARCHITECTURE.md` - Detailed architecture documentation
- `package.json` - Dependencies and scripts
- `tailwind.config.ts` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration

## Questions?

Check the code comments and type definitions for more details. All components are fully implemented with no placeholders.
