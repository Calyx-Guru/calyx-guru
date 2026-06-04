/**
 * Install a built APK onto a connected device via adb.
 *
 * Usage:
 *   node scripts/install-android-apk.js
 *   node scripts/install-android-apk.js path/to/app.apk
 *   npm run install:android:apk
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const defaultCandidates = [
  path.join(root, 'android/app/build/outputs/apk/release/app-release.apk'),
  path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk'),
];

function listApksInDir(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.apk'))
    .map((name) => path.join(dir, name));
}

function findApk() {
  const arg = process.argv[2];
  if (arg) {
    const apkPath = path.resolve(arg);
    if (!fs.existsSync(apkPath)) {
      console.error(`APK not found: ${apkPath}`);
      process.exit(1);
    }
    return apkPath;
  }

  for (const candidate of defaultCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const releaseApks = listApksInDir(
    path.join(root, 'android/app/build/outputs/apk/release'),
  );
  if (releaseApks.length > 0) {
    return releaseApks[0];
  }

  const debugApks = listApksInDir(
    path.join(root, 'android/app/build/outputs/apk/debug'),
  );
  if (debugApks.length > 0) {
    return debugApks[0];
  }

  console.error(
    'No APK found. Build first, e.g. npm run build:android:apk\n' +
      'Or pass a path: node scripts/install-android-apk.js android/app/build/outputs/apk/release/app-release.apk',
  );
  process.exit(1);
}

const apk = findApk();
console.log(`Installing ${apk} ...`);

try {
  execSync(`adb install -r "${apk}"`, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
