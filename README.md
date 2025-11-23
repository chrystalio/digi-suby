# Digi-Suby

A modern subscription management application built with Laravel 12 and React 19. Track, manage, and analyze all your digital subscriptions in one place.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.4
- **Frontend**: React 19, TypeScript, Inertia.js v2
- **Styling**: Tailwind CSS 4, Radix UI (shadcn/ui)
- **Authentication**: Laravel Fortify (with 2FA support)
- **Build Tool**: Vite
- **Testing**: Pest PHP v4

## Features

### Planned Features

#### Core Subscription Management
- [ ] Dashboard with spending overview and analytics
- [ ] Subscription tracking (active, paused, cancelled)
- [ ] Payment scheduling and reminders
- [ ] Multi-currency support
- [ ] Billing cycle tracking (monthly, yearly, custom)

#### Categories & Organization
- [x] Categories management (CRUD)
- [x] Custom category creation with icons and colors
- [ ] System categories (predefined)
- [ ] Category-based filtering and reports

#### Payment Accounts
- [ ] Payment account management
- [ ] Multiple payment methods per account
- [ ] Account balance tracking
- [ ] Payment method icons and branding

#### Services & Subscriptions
- [ ] Service library with popular subscriptions
- [ ] Custom service creation
- [ ] Service logos and branding
- [ ] Subscription plans and pricing tiers

#### Analytics & Reports
- [ ] Monthly/yearly spending reports
- [ ] Category-wise breakdown
- [ ] Spending trends and forecasts
- [ ] Export to CSV/PDF

#### User Experience
- [x] Two-factor authentication (2FA)
- [x] Dark/light/system theme support
- [ ] Email notifications for renewals
- [ ] Mobile-responsive design

## Current Progress

### Completed
- [x] Project setup with Laravel 12 + React 19 + Inertia.js
- [x] Authentication system with 2FA
- [x] User settings (profile, password, appearance)
- [x] Categories CRUD with server-side pagination
- [x] Reusable DataTable component
- [x] Icon picker component
- [x] Toast notifications

### In Progress
- [ ] Category policies and authorization
- [ ] System categories support
- [ ] Color picker component

### Next Up
- [ ] Payment accounts management
- [ ] Services/subscriptions CRUD
- [ ] Dashboard with analytics

## Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- SQLite (default) or MySQL/PostgreSQL

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/digi-suby.git
cd digi-suby

# Install dependencies and setup
composer setup
```

This will:
- Install PHP dependencies
- Install Node dependencies
- Generate application key
- Run migrations
- Build frontend assets

### Development

```bash
# Start all development services
composer dev
```

This runs 4 concurrent processes:
- Laravel development server
- Queue worker
- Real-time logs (Pail)
- Vite dev server

### Testing

```bash
# Run all tests
composer test

# Run specific test
php artisan test --filter=TestName
```

### Code Quality

```bash
# PHP formatting
./vendor/bin/pint

# TypeScript type checking
npm run types

# ESLint
npm run lint

# Prettier
npm run format
```

## Project Structure

```
app/
├── Http/
│   ├── Controllers/     # API and web controllers
│   └── Requests/        # Form request validation
├── Models/              # Eloquent models
└── Policies/            # Authorization policies

resources/js/
├── components/
│   └── ui/              # Reusable UI components
├── layouts/             # Page layouts
├── pages/               # Inertia pages
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions

tests/
├── Feature/             # Feature tests
└── Unit/                # Unit tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request
