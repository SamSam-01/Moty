# Moty Mobile App

This is the React Native (Expo) mobile application for Moty.

## Architecture

The project follows a **Feature-Based Architecture** to ensure scalability and maintainability. All application code is located in the `src` directory.

### Directory Structure

```
mobile/
├── app/                  # Expo Router screens (entry points)
├── src/
│   ├── components/       # Shared UI components
│   │   ├── ui/           # Atomic components (Typography, Button, Input, etc.)
│   │   └── layout/       # Layout components
│   ├── features/         # Feature-specific logic and components
│   │   ├── auth/         # Authentication feature
│   │   ├── lists/        # Movie lists management
│   │   └── movies/       # Movie items and search
│   ├── theme/            # Centralized theme configuration
│   ├── lib/              # External library configurations (Supabase, etc.)
│   ├── services/         # API and Storage services
│   ├── context/          # Global React Context (AppContext)
│   └── types/            # TypeScript definitions
└── ...
```

### Shared UI Components (`src/components/ui`)

We use a set of shared "atomic" components to maintain UI consistency. Always use these instead of raw React Native components when possible.

- **`<Typography />`**: The primary text component. Supports `variant` (h1, h2, body, etc.) and uses theme colors.
- **`<GlassView />`**: Provides the glassmorphism effect used throughout the app.
- **`<Button />`**: Standardized button with loading state and variants.
- **`<Input />`**: Text input with label and error handling.
- **`<Modal />`**: Standardized modal wrapper.

### Features

Each feature is a self-contained module containing its own components, hooks, and logic.

- **Auth**: Handles Sign In and Sign Up.
- **Lists**: Manages creation, editing, and deletion of movie lists.
- **Movies**: Handles adding movies to lists, drag-and-drop reordering, and TMDB search.

### Theme

The application theme is centralized in `src/theme/index.ts`.
- Use `theme.colors` for all color references.
- Use `theme.spacing` for margins and paddings.
- Use `theme.borderRadius` for shapes.

## Development

### Prerequisites
- Node.js
- Expo CLI

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Adding a New Feature
1. Create a new directory in `src/features/`.
2. Add `components/`, `hooks/`, and an `index.ts` file.
3. Export public components from `index.ts`.
4. Import into `app/` screens as needed.
