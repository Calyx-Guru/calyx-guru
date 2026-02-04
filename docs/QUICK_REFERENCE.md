# 🎯 Quick Reference - Unified Project Commands

## One-Line Overview

✅ **Single `package.json` with all dependencies**
✅ **Admin commands use `admin:` prefix**
✅ **All scripts run from project root**

## Essential Commands

### Mobile App

```bash
npm start              # Start Expo dev server
npm run android        # Build for Android
npm run ios           # Build for iOS
npm run web           # Run on web
npm run lint          # Lint code
```

### Admin Dashboard

```bash
npm run admin:dev     # Start dev server
npm run admin:build   # Build for production
npm run admin:lint    # Lint code
npm run admin:preview # Preview prod build
```

### Installation

```bash
npm install           # Install all dependencies (once)
```

## Running Both Simultaneously

```bash
# Terminal 1
npm start

# Terminal 2
npm run admin:dev
```

## What Got Consolidated

| Item               | Before             | After                 |
| ------------------ | ------------------ | --------------------- |
| package.json files | 2 (root + admin)   | 1 (root)              |
| Dependencies       | Separate installs  | Single install        |
| Scripts            | Different prefixes | Unified with `admin:` |
| node_modules       | root + admin       | root only             |
| Lock file          | 2 separate         | 1 shared              |

## File Locations

```
/
├── app/                    Mobile pages
├── src/                    Mobile code
├── admin/src/              Admin code
├── admin/vite.config.ts    Admin build config
└── package.json            ALL dependencies
```

## Why This Is Better

1. **Faster Setup** - One `npm install` instead of two
2. **Cleaner Scripts** - All commands start with `npm run`
3. **Unified Versions** - No version conflicts
4. **Easier Deployment** - Single source of truth
5. **Better DX** - Less mental overhead

## When to Use Each

| Task               | Command                | Purpose         |
| ------------------ | ---------------------- | --------------- |
| Mobile development | `npm start`            | Client-side app |
| Admin development  | `npm run admin:dev`    | Web dashboard   |
| Lint everything    | Run both lint commands | Code quality    |
| Deploy mobile      | `npm run android/ios`  | Native builds   |
| Deploy admin       | `npm run admin:build`  | Web deployment  |

## Common Workflows

### Start New Feature (Mobile)

```bash
npm start
# App opens in Expo Go, make changes, hot reload
```

### Start New Feature (Admin)

```bash
npm run admin:dev
# Dashboard opens in browser, make changes, hot reload
```

### Both Running

```bash
# In 2 separate terminals
npm start                 # Terminal 1
npm run admin:dev         # Terminal 2
```

### Build for Production

```bash
# Mobile
npm run android
npm run ios

# Admin
npm run admin:build       # Creates /admin/dist folder
npm run admin:preview     # Preview build locally
```

## Debugging

```bash
# Check installed packages
npm list --depth=0

# Check specific package
npm list vite
npm list tailwindcss

# Clean install (if issues)
rm -rf node_modules package-lock.json
npm install
```

## Port Info

- **Mobile**: Varies (19000+) - check Expo output
- **Admin**: 5173/5174/... - Vite auto-selects

---

**That's it! Everything is consolidated and ready to go.** 🚀
