# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Laravel 12 + React 19 application using Inertia.js for seamless client-server integration. The project uses Laravel Fortify for authentication (including 2FA), TypeScript for type safety, and Tailwind CSS 4 with Radix UI components for the interface.

## Development Commands

### Setup
```bash
composer setup  # Install dependencies, generate key, run migrations, build assets
```

### Development Server
```bash
composer dev  # Runs 4 concurrent processes: server, queue worker, logs (pail), vite
```

For SSR mode:
```bash
composer dev:ssr  # Builds SSR bundle and runs server with SSR
```

### Testing
```bash
composer test           # Run all tests
php artisan test        # Direct artisan test command
php artisan test --filter=<TestName>  # Run specific test
```

### Code Quality
```bash
npm run lint            # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes
npm run types           # Type check TypeScript
./vendor/bin/pint       # Format PHP code (Laravel Pint)
```

### Building
```bash
npm run build           # Build for production
npm run build:ssr       # Build with SSR support
```

## Architecture

### Backend Structure

**Authentication Flow:**
- Laravel Fortify handles all auth operations (login, registration, password reset, 2FA)
- Views are registered in `app/Providers/FortifyServiceProvider.php` using Inertia renders
- Auth actions are in `app/Actions/Fortify/` (CreateNewUser, ResetUserPassword)
- Fortify features configured in `config/fortify.php` (registration, resetPasswords, emailVerification, twoFactorAuthentication)
- Rate limiting configured for login (5/min) and 2FA (5/min) in FortifyServiceProvider

**Routes:**
- `routes/web.php` - Main application routes (home, dashboard)
- `routes/settings.php` - All settings-related routes (profile, password, appearance, 2FA)
- Fortify automatically registers auth routes at root level (login, register, etc.)

**Inertia Shared Data:**
- Defined in `app/Http/Middleware/HandleInertiaRequests.php`
- Globally available: `name`, `quote`, `auth.user`, `sidebarOpen`
- All Inertia pages receive these props automatically

**Database:**
- Users table includes 2FA columns (two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at)
- Standard Laravel cache and jobs tables

### Frontend Structure

**Inertia Page Resolution:**
- Pages are auto-resolved from `resources/js/pages/` directory
- Convention: `Inertia::render('auth/login')` → `resources/js/pages/auth/login.tsx`
- All pages are `.tsx` files (TypeScript + JSX)

**Page Categories:**
- `pages/auth/*` - Authentication pages (login, register, forgot-password, reset-password, verify-email, two-factor-challenge, confirm-password)
- `pages/settings/*` - Settings pages (profile, password, appearance, two-factor)
- `pages/dashboard.tsx`, `pages/welcome.tsx` - Main app pages

**Layout System:**
- Layouts wrap pages and provide consistent structure
- `layouts/app-layout.tsx` - Main app layout (delegates to `app/app-sidebar-layout.tsx`)
- `layouts/auth-layout.tsx` - Auth pages layout
- `layouts/settings/layout.tsx` - Settings section layout
- Layout variants in subdirectories:
  - `layouts/app/*` - app-sidebar-layout, app-header-layout
  - `layouts/auth/*` - auth-split-layout, auth-simple-layout, auth-card-layout

**Component Organization:**
- `components/ui/*` - Radix UI components (shadcn-style: button, dialog, dropdown-menu, etc.)
- `components/*` - Application components (app-sidebar, app-header, nav-user, breadcrumbs, etc.)
- App shell components: app-shell, app-sidebar, app-header, app-content
- Auth/settings components: two-factor-setup-modal, delete-user, appearance-tabs

**Hooks:**
- `use-appearance.tsx` - Theme management (light/dark/system)
- `use-two-factor-auth.ts` - 2FA state management
- `use-mobile.tsx` - Mobile breakpoint detection
- `use-mobile-navigation.ts` - Mobile nav state
- `use-clipboard.ts` - Copy to clipboard utility
- `use-initials.tsx` - Generate user initials from name

**TypeScript Types:**
- Global types in `resources/js/types/index.d.ts`
- Key interfaces: User, Auth, SharedData, NavItem, NavGroup, BreadcrumbItem
- Inertia shared data typed via SharedData interface

**Utilities:**
- `lib/utils.ts` - `cn()` for Tailwind class merging, `isSameUrl()` for route matching

### Vite Configuration

**Plugins:**
- `laravel-vite-plugin` - Laravel integration with SSR support
- `@vitejs/plugin-react` - React with React Compiler enabled (babel-plugin-react-compiler)
- `@tailwindcss/vite` - Tailwind CSS 4
- `@laravel/vite-plugin-wayfinder` - Type-safe routing (formVariants: true)

**Entry Points:**
- Client: `resources/js/app.tsx`, `resources/css/app.css`
- SSR: `resources/js/ssr.tsx`

**Theme Initialization:**
- `initializeTheme()` called in `app.tsx` to set light/dark mode on load
- Theme preference stored and managed via `use-appearance` hook

## Key Patterns

**Inertia Form Handling:**
- Use Wayfinder for type-safe route generation (configured with form variants)
- Forms submit to Laravel routes, validation errors returned via Inertia props

**Authentication State:**
- Current user available via `usePage().props.auth.user`
- Shared globally through HandleInertiaRequests middleware

**UI Components:**
- Use Radix UI primitives from `components/ui/`
- Compose with Tailwind using `cn()` utility for class merging
- Lucide React icons via `lucide-react`

**2FA Implementation:**
- Backend: Fortify handles TOTP generation and validation
- Frontend: Custom hooks and modals in `pages/settings/two-factor.tsx`
- QR codes and recovery codes displayed during setup

**Appearance/Theme:**
- System supports light/dark/system modes
- Preference persisted and loaded on app initialization
- Appearance middleware handles server-side theme state

## Development Notes

- React Compiler is enabled for automatic memoization optimization
- StrictMode enabled in production React 19
- TypeScript strict mode enabled
- Prettier with organize-imports and tailwindcss plugins
- ESLint with React 19 and TypeScript support
- Database uses SQLite by default (check `.env` for configuration)
