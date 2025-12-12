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
- [x] System categories (predefined)
- [ ] Category-based filtering and reports

#### Payment Methods
- [x] Payment method management (cards & e-wallets)
- [x] Card type auto-detection (Visa, Mastercard, Amex, etc.)
- [x] E-wallet support (DANA, OVO, GoPay, Apple Pay, Google Pay, etc.)
- [x] Secure storage (only last 4 digits stored)
- [x] Payment method logos via logo.dev
- [x] Set default payment method
- [x] Card expiry tracking and validation

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
- [x] Category policies and authorization
- [x] System categories support
- [x] Reusable DataTable component
- [x] Icon picker component
- [x] Toast notifications
- [x] Payment methods management (cards & e-wallets)
- [x] Card type auto-detection with Luhn validation
- [x] E-wallet provider support (7 providers)
- [x] Payment method policies and authorization
- [x] Default payment method functionality
- [x] Logo.dev integration with caching

### In Progress
- [ ] Services/subscriptions CRUD

### Next Up
- [ ] Dashboard with analytics
- [ ] Subscription tracking and management

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
