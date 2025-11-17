# AutoCare360 - Frontend

A modern, full-stack automobile service management system built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **State Management:** React Hooks
- **Real-time:** WebSocket (STOMP.js)
- **Package Manager:** pnpm

## 📁 Project Structure

```
dev-autocare360-frontend/
├── src/                      # Source code directory
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard & management
│   │   ├── customer/       # Customer portal
│   │   ├── employee/       # Employee workspace
│   │   ├── api/            # API routes
│   │   ├── login/          # Authentication pages
│   │   └── signup/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components (Radix)
│   │   ├── admin/         # Admin-specific components
│   │   ├── customer/      # Customer-specific components
│   │   ├── employee/      # Employee-specific components
│   │   ├── real-time/     # WebSocket & live updates
│   │   └── vehicle/       # Vehicle management components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & API clients
│   ├── services/          # API service layer
│   ├── styles/            # Global styles & CSS modules
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── docs/                  # Documentation
└── package.json           # Dependencies & scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install pnpm globally (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
npx pnpm dev

# Open http://localhost:3000
```

### Building

```bash
# Create production build
npx pnpm build

# Start production server
npx pnpm start
```

### Code Quality

```bash
# Lint code
npx pnpm lint

# Format code with Prettier
npx pnpm format
```

## 🎨 Features

- **Role-Based Access Control:** Admin, Employee, and Customer portals
- **Real-time Updates:** Live notifications and progress tracking
- **Appointment Management:** Schedule and track service appointments
- **Project Tracking:** Monitor service projects and timelines
- **Time Logging:** Employee time tracking for services
- **Vehicle Management:** Customer vehicle profiles and history
- **Audit Logs:** Track all system changes and actions
- **AI Chatbot:** Integrated customer support assistant

## 🔧 Configuration

- **Path Aliases:** `@/` points to `src/` directory
- **TypeScript:** Configured for strict mode
- **ESLint:** Build-time errors ignored (configure as needed)

## 📝 Notes

- The project uses Next.js 14 App Router architecture
- All source code is organized in the `src/` directory for clean structure
- WebSocket connection for real-time features
- Responsive design with mobile-first approach
