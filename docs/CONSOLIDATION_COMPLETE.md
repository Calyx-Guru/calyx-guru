# ✅ Admin & Root Package.json Consolidated

## What Changed

The admin project has been **successfully consolidated** with the root project into a single `package.json`.

### Before

```
CalyxGuru/
├── package.json (mobile/expo)
└── admin/
    └── package.json (separate admin project)
```

### After

```
CalyxGuru/
└── package.json (unified - includes both mobile & admin)
    └── admin/ (no package.json needed)
```

## Scripts

All scripts now run from **root** with `admin:` prefix for admin-related commands:

### Mobile App Scripts (unchanged)

```bash
npm start          # Start Expo mobile app
npm run android    # Build for Android
npm run ios        # Build for iOS
npm run web        # Run on web (Expo)
npm run lint       # Lint mobile code
```

### Admin Dashboard Scripts (with admin: prefix)

```bash
npm run admin:dev      # Start admin dev server
npm run admin:build    # Build admin for production
npm run admin:lint     # Lint admin code
npm run admin:preview  # Preview production build
```

## Dependencies

### Merged Successfully

- ✅ All Expo/React Native dependencies
- ✅ All admin (React + Vite) dependencies
- ✅ Shadcn/ui and Radix UI
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ Vite and build tools

### Total Dependencies

- **30+ production dependencies**
- **15+ development dependencies**
- All working together in one lock file

## How It Works

The scripts use `cd admin && <command>` to run admin-specific commands:

```bash
# When you run:
npm run admin:dev

# It executes:
cd admin && vite

# From root, which starts Vite with admin's vite.config.ts
```

## Benefits

✅ **Single installation** - `npm install` once installs everything
✅ **Unified versioning** - One lock file, one version management
✅ **Cleaner commands** - Consistent `admin:` prefix for admin tasks
✅ **Less duplication** - Shared dependencies (React, TypeScript, ESLint)
✅ **Easier CI/CD** - Single build process for both projects
✅ **Better team workflow** - Everyone uses same npm scripts

## Running Both Apps

You can now run both apps simultaneously from the root:

```bash
# Terminal 1 - Mobile app
npm start

# Terminal 2 - Admin dashboard
npm run admin:dev
```

Both will run independently on their respective ports.

## Installation & Setup

### First Time Setup

```bash
npm install
```

This installs all dependencies for both mobile and admin apps.

### Start Development

```bash
# Mobile app
npm start

# Admin dashboard
npm run admin:dev

# Both (separate terminals)
npm start &
npm run admin:dev
```

### Build for Production

```bash
# Mobile (native & web)
npm run android
npm run ios
npm run web

# Admin dashboard
npm run admin:build
```

## File Structure

```
CalyxGuru/
├── package.json           ← Single unified package.json
├── package-lock.json      ← Single lock file
├── app/                   ← Expo Router pages
├── src/                   ← Mobile app code
├── supabase/              ← Backend
├── tools/                 ← Utility scripts
├── admin/                 ← Admin dashboard
│   ├── src/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── components.json
└── [other config files]
```

## Admin Scripts in Detail

```bash
# Development
npm run admin:dev
# → cd admin && vite
# Starts Vite dev server on localhost:5174 (or next available port)

# Build for production
npm run admin:build
# → cd admin && tsc -b && vite build
# TypeScript check + Vite production build

# Lint admin code
npm run admin:lint
# → cd admin && eslint .
# Check for code quality issues

# Preview production build
npm run admin:preview
# → cd admin && vite preview
# Test the production build locally
```

## Testing It Works

```bash
# Verify admin:dev script works
npm run admin:dev

# You should see:
# ➜  Local:   http://localhost:5174/
# ➜  Network: use --host to expose
```

The admin dashboard is now running!

## Cleanup Notes

✅ Removed admin/package.json (now using root package.json)
✅ Kept admin/ folder with all source code
✅ All dependencies installed in root node_modules
✅ Admin can access all shared dependencies

## Next Steps

1. ✅ **Install**: `npm install` (already done)
2. **Develop**:
   - `npm start` for mobile
   - `npm run admin:dev` for admin dashboard
3. **Build**: Use respective build commands
4. **Deploy**: Deploy mobile and admin separately as needed

## Troubleshooting

### Scripts not found?

```bash
npm install
```

### Port already in use?

Vite automatically uses next available port. Check terminal output for the actual URL.

### Admin dependencies missing?

```bash
npm install
# Then verify:
npm list vite
npm list tailwindcss
```

### Want to check what's installed?

```bash
npm list --depth=0
```

---

**Status: ✅ CONSOLIDATED**

Single package.json, unified dependency management, admin scripts with `admin:` prefix.
