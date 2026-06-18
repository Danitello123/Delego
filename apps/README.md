# Apps

This directory contains the frontend applications in the Delego monorepo. Each application is a standalone web or mobile application that consumes the shared packages and backend services.

## 📋 Table of Contents

- [Overview](#overview)
- [Applications](#applications)
- [Development](#development)
- [Architecture](#architecture)
- [Shared Dependencies](#shared-dependencies)
- [Future Applications](#future-applications)

## Overview

The apps directory follows a monorepo pattern where each application is a separate package that can be developed and deployed independently while sharing common code through the packages directory.

### Current Applications

| App | Package | Port | Tech Stack | Description |
|-----|---------|------|------------|-------------|
| [frontend](./frontend) | `@delego/web` | 3001 | Next.js, React, TypeScript, Tailwind CSS | Customer web application for wallet connection, delegation management, and order tracking |

## Applications

### Customer Web App (`apps/frontend`)

The customer web application is the primary interface for users to interact with Delego. It provides:

#### Features

- **Wallet Connection**: Connect Stellar wallets and manage accounts
- **Delegation Management**: Create and manage AI agent delegations
- **Order Creation**: Initiate purchase requests through AI agents
- **Order Tracking**: Monitor order status in real-time
- **Approval Workflows**: Review and approve agent actions
- **Transaction History**: View past transactions and delegations
- **User Profile**: Manage account settings and preferences

#### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form
- **HTTP Client**: Axios (via @delego/sdk)
- **Wallet Integration**: Stellar SDK for JavaScript

#### Directory Structure

```
apps/frontend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth-related pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── wallet/           # Wallet-related components
│   ├── delegation/       # Delegation components
│   └── orders/           # Order components
├── hooks/                # Custom React hooks
│   ├── useWallet.ts      # Wallet connection hook
│   ├── useDelegation.ts  # Delegation management hook
│   └── useOrders.ts      # Orders hook
├── lib/                  # Utility libraries
│   ├── api.ts            # API client configuration
│   └── constants.ts      # Application constants
├── styles/               # Global styles
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies
```

#### Development

```bash
# Navigate to the frontend app directory
cd apps/frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The web app will be available at http://localhost:3001

#### Key Pages

- `/` - Landing page
- `/dashboard` - Main dashboard
- `/wallet/connect` - Wallet connection
- `/delegations` - Delegation management
- `/delegations/create` - Create new delegation
- `/orders` - Order history
- `/orders/[id]` - Order details
- `/profile` - User profile

## Development

### Running All Apps

To run all applications in development mode:

```bash
# From the repository root
pnpm dev:web
```

### Running Individual Apps

```bash
# Run specific app
pnpm --filter @delego/web dev
```

### Building Apps

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @delego/web build
```

### Testing Apps

```bash
# Run tests for all apps
pnpm test

# Run tests for specific app
pnpm --filter @delego/web test
```

## Architecture

### App Architecture Pattern

All applications in the monorepo follow a consistent architecture:

1. **Component-Based UI**: Modular, reusable components
2. **Custom Hooks**: Business logic encapsulated in hooks
3. **Type Safety**: Full TypeScript coverage
4. **API Layer**: Centralized API client via @delego/sdk
5. **State Management**: React Context for global state
6. **Routing**: Next.js App Router for web apps

### Data Flow

```
User Interaction
    ↓
Component
    ↓
Custom Hook
    ↓
API Client (@delego/sdk)
    ↓
API Gateway (apps/backend/gateway)
    ↓
Backend Services
```

### Shared Patterns

All applications share common patterns:

- **Error Handling**: Consistent error boundaries and error messages
- **Loading States**: Loading indicators for async operations
- **Form Validation**: Client-side validation with React Hook Form
- **Authentication**: JWT token management via API client
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Shared Dependencies

Applications consume shared packages from the `packages/` directory:

- **@delego/ui**: Shared React components
- **@delego/sdk**: API client SDK
- **@delego/types**: Shared TypeScript types
- **@delego/utils**: Shared utility functions

### Using Shared Packages

```typescript
// Import shared UI components
import { Button, Card, Input } from '@delego/ui';

// Import SDK for API calls
import { delegoClient } from '@delego/sdk';

// Import shared types
import { Delegation, Order } from '@delego/types';

// Import utilities
import { formatCurrency } from '@delego/utils';
```

## Future Applications

### Merchant App (Planned)

A web application for merchants to:

- Manage product listings
- Fulfill orders
- Track payouts
- View analytics
- Manage merchant wallet

**Tech Stack**: Next.js, React, TypeScript

### Mobile Apps (Planned)

Native mobile applications for iOS and Android:

- **iOS**: React Native
- **Android**: React Native

**Features**:
- Mobile wallet integration
- Push notifications
- Biometric authentication
- Offline mode support

### Admin Dashboard (Planned)

Administrative interface for:

- User management
- System monitoring
- Analytics and reporting
- Configuration management

**Tech Stack**: Next.js, React, TypeScript

## Contributing

When contributing to applications:

1. Follow the established architecture patterns
2. Use shared components when possible
3. Maintain TypeScript type safety
4. Write tests for new components
5. Ensure responsive design
6. Follow accessibility best practices
7. Update documentation as needed

See [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines.

## Documentation

- [Web App README](./frontend/README.md) - Detailed web app documentation
- [Shared UI Components](../packages/ui/README.md) - UI component library
- [API SDK](../packages/sdk/README.md) - API client documentation
- [Shared Types](../packages/types/README.md) - Type definitions

---

**Last Updated**: June 2026
