# Shohoj Hishab

A modern restaurant POS (Point of Sale) and accounting system built with a monorepo architecture using Turbo, pnpm, TypeScript, Vite, and NestJS.

## 🏗️ Project Structure

This is a monorepo managed with **Turborepo** and **pnpm workspaces**.

```
shohoj-hishab/
├── apps/
│   ├── api/                 # NestJS backend API
│   └── web/                 # Vite + React frontend
├── packages/
│   ├── tailwind-config/     # Shared Tailwind CSS configuration
│   └── typescript-config/   # Shared TypeScript configurations
├── docs/
│   └── design-system.html   # Design system documentation
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## 🎨 Design System

The application follows a comprehensive design system with:

### Colors
- **Primary**: `#f97316` (Warm Orange)
- **Background Light**: `#f8fafc` (Slate-50)
- **Background Dark**: `#0f172a` (Slate-900)
- **Secondary**: `#64748b` (Slate-500)
- **Success**: `#22c55e` (Green)
- **Warning**: `#facc15` (Yellow)
- **Error**: `#ef4444` (Red)

### Typography
- **Font Family**: Plus Jakarta Sans
- **Heading 1**: 36px Bold
- **Heading 2**: 24px Bold
- **Body**: 16px Regular

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Cards**: With customizable shadows and glass effect support
- **Inputs**: With icon support and validation states
- **Toggles**: Animated switches with labels
- **Icons**: Material Icons Round

### Border Radius
- Default: 12px
- XL: 16px
- 2XL: 24px

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9.15.0

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

### Development URLs
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001

## 📦 Available Scripts

### Root Level
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run linting on all packages
- `pnpm typecheck` - Run TypeScript checking
- `pnpm clean` - Clean build outputs

### Web App (apps/web)
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript checks

### API (apps/api)
- `pnpm dev` - Start NestJS in watch mode
- `pnpm build` - Build the application
- `pnpm start` - Start the application
- `pnpm test` - Run tests

## 🧩 UI Components

Located in `apps/web/src/components/`:

- **Button**: Multi-variant button component
- **Card**: Flexible card container with shadow options
- **Input**: Form input with icon and validation support
- **Toggle**: Animated toggle switch
- **Icon**: Material Icons wrapper
- **Navbar**: Application navigation bar with theme toggle

### Usage Example

```tsx
import { Button, Card, Input, Icon } from './components'

function MyComponent() {
  return (
    <Card shadow="xl" className="p-6">
      <Icon name="restaurant" className="text-primary" />
      <Input icon="search" placeholder="Search..." />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}
```

## 🌙 Dark Mode

The application supports dark mode out of the box. Toggle between light and dark themes using the theme button in the navbar or programmatically:

```tsx
// The theme is controlled by the 'dark' class on document.documentElement
document.documentElement.classList.toggle('dark')
```

## 📚 Technologies

### Frontend
- React 19
- TypeScript 5.7
- Vite 6
- Tailwind CSS 4
- Material Icons Round

### Backend
- NestJS 11
- TypeScript 5.7

### Monorepo
- Turborepo 2.8
- pnpm workspaces

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Design system inspired by modern restaurant POS interfaces
- Built with love for the Bangladeshi restaurant community